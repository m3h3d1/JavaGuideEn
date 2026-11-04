---
title: "AI Voice Engineering: From ASR and TTS to Real-Time Voice Agents"
description: "An engineering guide to AI voice systems: audio capture, VAD, ASR, LLMs, TTS, streaming playback, interruption handling, latency optimization, and cloud, local, and hybrid deployment."
category: AI Application Development
head:
  - - meta
    - name: keywords
      content: AI voice,ASR,TTS,VAD,real-time voice agent,Speech to Speech,speech recognition,speech synthesis,cloud and edge,Realtime API
---

<!-- @include: @article-header.snippet.md -->

Hi, I'm Xiao G.

When developers first build a voice application, they often imagine a simple pipeline: the user speaks, speech is converted to text, the text goes to an LLM, and the response is played back.

That sounds like three calls: **ASR → LLM → TTS**.

Production exposes the gaps: the system thinks the user has finished before they have; the AI keeps speaking when the user tries to interrupt; air-conditioning and keyboard noise throw off ASR in a meeting room; a small network fluctuation breaks the downlink audio into choppy segments; and a good text response still sounds like a slow call-center agent when spoken aloud.

A text Agent connected to a microphone and speaker is only a talking demo. A production system also has to handle real-time audio, speech models, conversation state, and coordination between the client and cloud.

This guide first explains the roles of ASR, TTS, and VAD, then uses the interview-guide project to discuss audio capture, streaming, playback queues, and state machines. It concludes with when to use cloud APIs, local models, or a hybrid architecture.

## Terminology

The following terms are used throughout this article:

- **Client side**: Frontend code running on the user's device, such as in a browser or app.
- **Barge-in**: A user interrupting the AI while the model is responding.
- **Partial results**: Intermediate recognition results returned by streaming ASR in real time.
- **Cascaded architecture**: A pipeline that runs ASR, LLM, and TTS as separate stages.
- **Native Realtime API**: A real-time multimodal voice interface, commonly taking audio in and returning audio out. It may also emit text and tool-call events.

## What Problems Do AI Voice Systems Solve?

First, clarify the problem.

A voice Agent is closer to a real-time collaborative system: while the user speaks, the system must coordinate understanding, generation, and playback. Compared with text chat, voice adds several dimensions:

- **Real-time response**: The system must start working while the user speaks instead of waiting for them to finish.
- **Multimodal signals**: Tone, pauses, and emotion are lost in text.
- **Interruption handling**: People can interrupt each other, and a voice system must support that too.
- **End-to-end latency**: A one-second delay may be tolerable in text chat but can make a voice interaction feel unresponsive.

Voice interactions generally fall into two categories:

1. **Command-based voice assistants**: Common in smart-home and in-car controls. The system maps a request such as "turn on the air conditioner" to a predefined intent and device command. Products such as Siri and XiaoAi also support open-ended questions, so they are not simply fixed menus.
2. **LLM-based voice Agents**: These can understand open-ended questions, call tools, and sustain multi-turn conversations. If you ask what caused an API timeout last week, the Agent must understand the intent, retrieve context, generate an answer, and clarify details with you by voice.

The engineering priorities differ significantly. The rest of this article focuses on building LLM-based voice Agents.

## How Does ASR Convert Speech to Text?

ASR (Automatic Speech Recognition) may look like "audio in, text out," but it involves at least three decisions:

1. Which words were spoken.
2. How to segment them into words and sentences.
3. How to normalize punctuation, numbers, English, and technical terms.

For example, if the user asks about Java 21 virtual threads in Chinese, ASR must recognize Chinese, English, numbers, and technical terms together. If it transcribes "Java" phonetically as a Chinese phrase, even a strong LLM must first guess what the user said.

### Three ASR Approaches

| Type                               | Examples                                                                                                                                                                        | Strengths                                                                             | Limitations                                                                                                              | Suitable use                                                          |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| Cloud API                          | OpenAI Audio Transcriptions (`gpt-4o-transcribe`, `gpt-4o-mini-transcribe`, `whisper-1`, `gpt-4o-transcribe-diarize`), Azure Speech, Google Speech, Deepgram, Alibaba Cloud ASR | Quick to integrate, broad language coverage, low operational overhead                 | Cost, network latency, and data-compliance constraints                                                                   | Customer support, meeting transcription, lightweight voice assistants |
| General-purpose open-source models | Whisper, faster-whisper, Whisper.cpp, FunASR                                                                                                                                    | Can run locally and be self-hosted; faster-whisper can use Silero VAD to filter audio | Real-time performance requires engineering work; Whisper Turbo was not trained for translation and performs poorly at it | Private transcription, offline subtitles, enterprise networks         |
| Domain-specific models             | ASR for finance, healthcare, or automotive use                                                                                                                                  | Better adaptation to domain terms and accents                                         | High data-preparation and training costs                                                                                 | High-volume vertical use cases with specialized vocabularies          |

**Notes:**

- OpenAI's `gpt-4o-transcribe-diarize` supports speaker labels and suits multi-speaker scenarios such as meeting transcription. It is currently available only through `/v1/audio/transcriptions`, not the Realtime API. Audio longer than 30 seconds requires `chunking_strategy`. It does not support `prompt`, `logprobs`, or `timestamp_granularities[]`. If speaker labels are not needed, consider `gpt-4o-transcribe`, `gpt-4o-mini-transcribe`, or `whisper-1`.
- Whisper Turbo (`large-v3-turbo`) is an inference-optimized version of large-v3. It is faster but **was not trained for translation**; `--task translate` may return the original language instead of English. Use medium or large when translation is required.
- Distinguish real-time transcription from transcribing audio files. OpenAI's current documentation places low-latency transcription in Realtime transcription, using `gpt-realtime-whisper`; file uploads and speaker diarization use Audio Transcriptions.

**Selection guidance:** If your main requirement is real-time conversation, do not focus only on offline WER (Word Error Rate). Also consider:

- **Time to first partial**: Time from the user finishing a phrase to the first recognized text.
- **Partial-result stability**: Whether recognition progress is visible in real time.
- **Endpoint-detection accuracy**: Whether the system can tell when the user has finished.
- **Noise robustness**: Accuracy at a distance or when several people are speaking.
- **Vocabulary customization**: Whether the system can recognize domain-specific terms.

### Streaming vs. Non-Streaming ASR

Real-time conversations that require low time-to-first-text and natural interruption handling usually use streaming ASR. Non-streaming recognition can work when turns are clearly defined and utterances are short. The main differences are:

- **Non-streaming ASR:** Waits until the user finishes speaking, then recognizes the full utterance. Latency = speech duration + recognition time.
- **Streaming ASR:** Recognizes speech as the user speaks and returns results shortly after they finish. Latency ≈ endpoint-detection time + real-time recognition time.

The interview-guide project uses **Alibaba Cloud DashScope's `qwen3-asr-flash-realtime`**. This integration continuously appends audio over WebSocket, while server-side VAD determines when to submit a recognition turn:

```java
// QwenAsrService.java
OmniRealtimeConfig config = OmniRealtimeConfig.builder()
    .modalities(Collections.singletonList(OmniRealtimeModality.TEXT))
    .enableTurnDetection(true)  // Enable server-side VAD
    .turnDetectionType("server_vad")
    .turnDetectionSilenceDurationMs(400)  // 400 ms of silence marks the end of a turn
    .transcriptionConfig(transcriptionParam)
    .build();
```

Server-side VAD means the client does not need to implement full voice activity detection. The tradeoff is reflected in the parameter: `turnDetectionSilenceDurationMs(400)` means the system considers a turn complete after 400 ms of silence. DashScope documents a range of 200–6000 ms. Lower values respond faster but are more likely to split natural pauses; higher values make segmentation more conservative but increase latency. Client-side and server-side VAD can be combined, but this is not a fixed architecture. For low-latency interruption handling, the client can report `speech_start` first while the server uses ASR and VAD events to confirm turn completion. A lightweight client or stable network may use only server-side endpoint detection.

## How Does TTS Convert Text to Speech?

TTS (Text-to-Speech) synthesizes the model's response as audio. Although it is an output layer, it has a major effect on how users experience the Agent.

Different TTS systems can render the same response, such as "Let me check that for you," differently in terms of:

- Time to the first audio packet.
- How natural the voice sounds, including pacing on long sentences.
- Accuracy when reading numbers, code, and English abbreviations.
- Support for controlling emotion, speech rate, pauses, and pitch.

### How TTS Has Evolved

Traditional TTS uses several stages:

```
Text normalization → text analysis → acoustic model → vocoder → waveform output
```

Neural TTS, neural audio codecs, and generative speech models are reducing the number of hand-engineered stages in traditional pipelines. VALL-E, Fish Speech, and CosyVoice use different modeling approaches, so compare them by audio quality, latency, streaming support, and deployment cost—not just whether they are "end-to-end." For a real-time voice Agent, also consider time to first audio packet, streaming playback, and state handling after interruption.

If synthesis must wait until the full response is generated, the experience will feel slow. Streaming by short sentences or even tokens can improve time to first audio.

### Two Approaches to Real-Time TTS

| Type                | Examples                                                                                                           | Characteristics                                                                                                           |
| ------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Cloud real-time TTS | OpenAI Speech, Alibaba Cloud `qwen3-tts-flash-realtime` / Qwen-TTS-Realtime, Azure TTS, ElevenLabs                 | Supports streaming synthesis                                                                                              |
| Local TTS           | piper1-gpl (GPL-3.0; the original Piper project is archived), Fish Speech (Fish Audio Research License), CosyVoice | More control and suitable for offline use; check licenses for code, model weights, and voice assets before commercial use |

The interview-guide project also uses Alibaba Cloud real-time TTS over WebSocket. The model name recommended in the current DashScope Java SDK example is `qwen3-tts-flash-realtime`; the project's wrapper class is still named `QwenTtsRealtime`:

```java
// QwenTtsService.java
QwenTtsRealtimeConfig config = QwenTtsRealtimeConfig.builder()
    .voice(voice)  // Select a voice
    .responseFormat(QwenTtsRealtimeAudioFormat.PCM_24000HZ_MONO_16BIT)
    .mode("commit")  // Commit mode
    .languageType(languageType)
    .speechRate(speechRate)
    .volume(volume)
    .build();

// Send text and receive audio chunks in real time
qwenTtsRealtime.appendText(text);
qwenTtsRealtime.commit();
```

This code uses `commit` mode: after appending text, the client calls `commit()` to start synthesis. DashScope also provides `server_commit`, where the server decides when to commit. The tradeoff between latency and sentence completeness differs between these modes.

## How Does VAD Control Conversation Turns?

VAD (Voice Activity Detection) is often overlooked, but it has a major effect on the user experience.

VAD does not recognize speech content. It usually outputs the probability that an audio segment contains speech, or events indicating that speech started or ended. An application uses this to determine:

- Has the user started speaking?
- Has the user finished?
- Is there enough speech activity to trigger an interruption or submit a turn?

Standard VAD cannot determine on its own whether sound comes from the user, another person, music, or speaker playback. Handle playback echo with AEC or a playback reference signal. Multi-speaker scenarios may also require diarization, voiceprints, or target-speaker VAD. Real speech patterns also make endpoint detection harder:

- Speakers pause mid-sentence: "About this issue... I wanted to ask..."
- They give short responses such as "mm," "right," or "no."
- They may speak while thinking, with changing volume.
- Someone nearby may be speaking, or the speaker may be playing the AI's voice.

**Client-side or server-side VAD?**

| Type            | Examples                                                                                                          | Strengths                                                     | Limitations                                                                             |
| --------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Client-side VAD | WebRTC VAD, Silero VAD, @ricky0123/vad-web                                                                        | Fast response; no server resources required                   | Requires deploying a model on the client and tuning thresholds for noise                |
| Server-side VAD | DashScope ASR `server_vad`, OpenAI Realtime turn detection, endpoint detection built into some cloud ASR services | Simpler client logic and tighter integration with recognition | Adds server load and network latency; segmentation is constrained by the provider's API |

> ⚠️ **Do not evaluate VAD by offline accuracy alone.** Short utterances (<1 second, such as "mm," "right," or "no"), quiet interruptions, distant speech, and speaker echo can make production performance differ significantly from test data. The faster-whisper README also describes Silero VAD's default strategy as conservative: it removes only silence longer than two seconds. If VAD is the only interruption signal in a voice Agent, short responses can easily be missed.

The interview-guide frontend uses **@ricky0123/vad-web**, an ONNX-based client-side VAD:

```typescript
// AudioRecorder.tsx
const vadInstance = await window.vad.MicVAD.new({
  getStream: async () => stream,
  onnxWASMBasePath: "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/",
  baseAssetPath: "https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.29/dist/",
  onSpeechStart: () => {
    onSpeechStart?.(); // The user started speaking
  },
  onSpeechEnd: () => {
    onSpeechEnd?.(); // The user finished speaking
  },
});
```

Do not submit automatically every time client-side VAD triggers `onSpeechEnd`. Add a configurable silence-confirmation interval or combine it with the server's final transcription event to avoid mistaking a pause for the end of a turn. Tune the interval using production samples for each language, speaking rhythm, and latency target; 300–500 ms is not a universal threshold.

My recommendation: **VAD should provide a set of conversation-control signals, not just an on/off switch.** For example:

- `speech_start`: The user started speaking.
- `speech_end`: Speech activity ended (optionally with a confidence score).
- `maybe_barge_in`: The user may be interrupting.
- `non_speech`: No speech activity was detected in this audio segment.

## How Does a Complete Voice Conversation Work?

First, look at the full pipeline. This makes latency, interruption handling, and client-cloud coordination easier to understand.

A voice Agent conversation typically has these steps:

1. **Audio capture:** The microphone captures raw audio.
2. **Preprocessing:** AEC removes echo, NS suppresses noise, and AGC adjusts gain.
3. **VAD:** Detects whether the user is speaking and whether they have finished.
4. **Audio upload:** Sends processed audio to the server.
5. **ASR transcription:** Converts audio to text and streams partial results.
6. **Context assembly:** Combines system instructions, conversation history, and tool definitions.
7. **LLM inference:** Understands intent, generates a response, and calls tools if needed.
8. **TTS synthesis:** Converts the response to audio and streams audio chunks.
9. **Audio delivery:** The client plays audio as it arrives.
10. **State update:** Records the conversation and prepares context for the next turn.

Some work in a real-time voice pipeline can happen before the user finishes speaking.

Well-designed systems start work early when possible:

- Load session state and tool definitions as soon as the user starts speaking.
- Predict intent after ASR produces a stable prefix.
- Start TTS as soon as the LLM generates the first short sentence.
- If a tool call is slow, play a natural acknowledgement first.

The approach is straightforward: start independent stages early and use streaming to reduce perceived wait time.

## Why Is Real-Time Voice Harder Than Text Chat?

The challenge is not any single model. The entire pipeline must meet real-time constraints.

### Challenge 1: A Tight Latency Budget

A one-second delay is often tolerable in text chat. In a voice conversation, it can make the other party seem unresponsive.

Latency in a voice turn comes from several stages:

| Stage                  | Common sources of delay                                                  | Optimization                                                      |
| ---------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| Capture and encoding   | Audio-frame size and browser buffering                                   | Capture smaller frames and reduce unnecessary buffering           |
| VAD endpoint detection | Waiting for silence to confirm the user has finished                     | Adjust silence thresholds dynamically; submit short turns quickly |
| ASR                    | Audio upload, decoding, and stabilizing partial transcripts              | Streaming ASR, vocabulary hints, client-side preprocessing        |
| LLM                    | Time to first token, tool calls, and long context                        | Prompt caching, shorter replies, asynchronous tools               |
| TTS                    | Time to first audio packet, sentence segmentation, and vocoder inference | Stream sentence by sentence and warm up the voice                 |
| Playback               | Network jitter, decoding, and player buffering                           | Play as data arrives; manage the playback queue and buffer        |

If each stage adds 200 ms, the whole conversation quickly feels sluggish.

Optimize end-to-end P95 and P99 latency, not just one component's theoretical maximum. Users experience the whole pipeline, not an individual model benchmark.

### Challenge 2: Interruption Is More Than a Pause Button

A voice Agent must support **barge-in**.

When the user says, "Wait, that's not what I meant," the system must:

1. Detect that the user is speaking, rather than background noise or speaker echo.
2. Stop the local playback queue immediately instead of finishing the old response.
3. Cancel any LLM and TTS streams still generating on the server.
4. Record which content was played, not played, or interrupted in the conversation state.
5. Start the next turn using the new user audio.

Interruption failures are not always caused by inaccurate VAD. More often, the state machine does not define cancellation clearly. For example, playback may stop while the server continues streaming TTS, or the LLM may stop after the conversation history has already recorded unplayed text as "spoken."

The interview-guide project handles it like this:

```typescript
// VoiceInterviewPage.tsx
const handleAudioData = (audioData: string) => {
  // Stop sending audio during AI playback to avoid recognizing its own voice.
  if (isAiSpeakingRef.current) {
    return;
  }
  if (wsRef.current && wsRef.current.isConnected()) {
    wsRef.current.sendAudio(audioData);
  }
};
```

The frontend uses `isAiSpeakingRef` to track whether the AI is speaking and stops sending audio during playback. The backend cancels generation when it receives a `control` message.

### Challenge 3: Real-World Noise Is More Complex Than Test Conditions

Voice demos often run in quiet offices, but production environments may include:

- Cars, factories, shopping centers, or subway stations.
- A far-field microphone with the user several meters away.
- Multiple people speaking at once.
- Speaker playback that the microphone picks up again.

This affects the whole pipeline:

- VAD mistakes noise for speech and triggers incorrectly.
- ASR transcribes background speech and contaminates the user's intent.
- The microphone captures TTS playback, causing the Agent to interrupt itself.

The interview-guide frontend enables three common audio-processing options through `getUserMedia`:

```typescript
const stream = await navigator.mediaDevices.getUserMedia({
  audio: {
    echoCancellation: true, // AEC: cancel speaker echo
    noiseSuppression: true, // NS: reduce background noise
    autoGainControl: true, // AGC: stabilize volume with automatic gain control
    sampleRate: 16000,
  },
});
```

These settings help but do not cover every scenario. The browser treats them as constraints and tries to apply them; actual results depend on the browser, device, microphone, and playback environment. AEC has limits in strong-echo conditions, and NS may suppress part of the user's voice. For a hardware or app product, client-side audio preprocessing becomes a significant engineering investment.

### Challenge 4: Context Includes More Than Text History

A text Agent's context is mostly message history. A voice Agent must also track:

- Whether the user is currently speaking.
- How far playback has progressed in the previous response.
- Whether the user is asking a normal question or interrupting.
- Whether ASR partial text has stabilized.
- Whether the user's tone is questioning, negative, hesitant, or impatient.
- Whether a tool call is currently running.

Feeding only the final ASR transcript to the LLM loses much of this information.

For example, a transcript may show the user correcting the Agent—"No... I mean the order from last month"—but not that they interrupted it. Without knowing how much of the previous response played, the system may not know which statement the user is rejecting.

The interview-guide project uses WebSocket message types to represent different states:

```typescript
// voiceInterview.ts
export interface WebSocketSubtitleMessage {
  type: "subtitle";
  text: string;
  isFinal: boolean; // true means this ASR segment is final or stable
}

export interface WebSocketAudioResponseMessage {
  type: "audio";
  data: string; // Base64-encoded audio
  text: string; // Corresponding text
}

export interface WebSocketControlMessage {
  type: "control";
  action: string; // 'submit' | 'cancel' | 'pause'
  data?: Record<string, unknown>;
}
```

`isFinal` describes the ASR event; it does not mean the user clicked or said "submit." If the product uses manual submission, confirm it with a separate `control: submit` event. In automatic turn-taking mode, endpoint detection, the final ASR event, and business state should jointly determine whether to submit. Do not use one boolean for both meanings.

### Challenge 5: Echo Can Cause False Interruptions

When the microphone picks up the AI's playback, VAD or ASR may mistake it for the user speaking and cause the AI to interrupt itself.

The current interview-guide implementation is:

```typescript
if (isAiSpeakingRef.current) {
  return; // Do not send audio while the AI is speaking.
}
```

This "silent discard" approach prevents self-interruption, but also blocks users from interrupting while the AI is speaking.

More advanced approaches usually:

- Continue capturing audio while the AI speaks, but do not send it to ASR.
- Run client-side VAD on AEC-processed audio instead of raw microphone input.
- Combine an echo reference, energy across consecutive frames, VAD confidence, and playback-queue state to determine whether the user is actually interrupting.

### Challenge 6: Client-Side Capabilities Set the Experience Floor

Many teams put all capabilities in the cloud, where the experience quickly degrades on a weak network.

The client should handle at least:

- Microphone capture and audio preprocessing.
- VAD or lightweight interruption detection.
- Playback buffering and cancellation.
- Network-disconnection notices and reconnection.

Cloud models determine the ceiling; client-side engineering determines the floor. This is especially true for voice systems.

## How Does a Basic Voice Agent Work in the interview-guide Project?

The interview-guide project illustrates how a basic voice-interview Agent works.

### Overall Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
├─────────────────────────────────────────────────────────────┤
│  AudioRecorder        WebSocket         VoiceInterviewPage   │
│  - getUserMedia       - sendAudio       - State management  │
│  - AudioWorklet       - sendControl     - Manual submission │
│  - VAD detection     - Control messages - Chunked playback  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Spring Boot)                     │
├─────────────────────────────────────────────────────────────┤
│  VoiceInterviewWebSocketHandler                             │
│  - Session lifecycle (create, pause, resume, end)             │
│  - ASR ready / reconnect state synchronization                 │
│  - Route audio to ASR; trigger LLM after manual submission     │
│  - Stream LLM sentences and push synthesized TTS audio        │
├─────────────────────────────────────────────────────────────┤
│  QwenAsrService          DashscopeLlmService      QwenTtsService │
│  - qwen3-asr-flash-      - qwen-max / qwen-plus   - qwen-tts-    │
│    realtime              - Tool calling          realtime       │
└─────────────────────────────────────────────────────────────┘
```

### Frontend: Audio Capture and VAD

The `AudioRecorder` component handles the main frontend tasks:

**Step 1: Request microphone access and configure audio parameters:**

```typescript
const stream = await navigator.mediaDevices.getUserMedia({
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 16000, // ASR requires 16 kHz
  },
});
```

**Step 2: Initialize client-side VAD:**

```typescript
const vadInstance = await window.vad.MicVAD.new({
  getStream: async () => stream,
  onSpeechStart: () => {
    onSpeechStart?.(); // Trigger the callback
  },
  onSpeechEnd: () => {
    onSpeechEnd?.();
  },
});
await vadInstance.start();
```

**Step 3: Capture audio in chunks with AudioWorklet:**

VAD's `onSpeechEnd` only indicates that speech activity may have ended. Audio should still be sent to the server in chunks. The interview-guide implementation does this:

```typescript
await audioContext.audioWorklet.addModule("/audio-worklet/pcm-processor.js");

const workletNode = new AudioWorkletNode(audioContext, "pcm-processor");
workletNode.port.onmessage = (event) => {
  if (!recordingActiveRef.current) {
    return;
  }
  const base64 = arrayBufferToBase64(event.data as ArrayBuffer);
  onAudioData(base64); // Send 200 ms of Int16 PCM to backend ASR
};

source.connect(workletNode);
workletNode.connect(gainNode);
gainNode.connect(audioContext.destination);
```

`pcm-processor.js` runs on the audio-rendering thread. It resamples the browser's Float32 input to 16 kHz Int16 PCM and sends it to the main thread in 200 ms chunks through `postMessage`. Unlike the deprecated `ScriptProcessorNode`, `AudioWorkletNode` does not put audio processing on the UI main thread, reducing latency and stutter.

This raises a design question: **Why not wait for VAD to trigger `onSpeechEnd` before sending audio?**

VAD detection takes time. Waiting for it to confirm that the user has finished before sending audio adds the silence-confirmation delay. A better approach is to stream chunks continuously and use `onSpeechEnd` to tell the backend that the segment may be complete and ready for LLM submission.

However, interview-guide does not automatically submit when silence is detected. It **keeps transcribing with ASR and lets the user submit manually**. This prevents the system from responding when a candidate pauses mid-answer and avoids later speech overwriting an earlier response. The frontend treats ASR output as a draft; a `submit` control message advances to the next interview turn.

### Frontend: Audio Playback

interview-guide uses two playback modes:

**Mode 1: `HTMLAudioElement` (simple cases):**

```typescript
// VoiceInterviewPage.tsx
const onAudioResponse = (audioData: string, text: string) => {
  if (audioData && audioData.length > 0) {
    setAiAudio(audioData); // Set src and trigger autoplay
    setAiText(text);
    setAiSpeaking(true);

    // Set a watchdog timeout in case audio playback gets stuck
    const durationMs = estimateWavDurationMs(audioData);
    audioPlaybackWatchdogRef.current = setTimeout(
      finishAiPlayback,
      Math.min(Math.max(durationMs + 1500, 4000), 60_000),
    );
  }
};
```

**Mode 2: Chunked playback with `AudioContext` (finer control):**

```typescript
// Process an audio chunk
const handleAudioChunk = (
  base64Wav: string,
  _index: number,
  isLast: boolean,
) => {
  // 1. Decode WAV
  const binaryStr = atob(base64Wav);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }

  // This project expects a 44-byte WAV header and 24 kHz, mono, 16-bit PCM.
  // Parse the WAV header first if the server may return other formats.
  const pcmOffset = 44;
  const pcmData = new Int16Array(
    bytes.buffer,
    pcmOffset,
    (bytes.length - pcmOffset) / 2,
  );
  const float32 = new Float32Array(pcmData.length);
  for (let i = 0; i < pcmData.length; i++) {
    float32[i] = pcmData[i] / 32768;
  }

  const audioBuffer = ctx.createBuffer(1, float32.length, 24_000);
  audioBuffer.copyToChannel(float32, 0);

  // 2. Add it to the playback queue
  chunkQueueRef.current.push(audioBuffer);
  if (!isChunkPlayingRef.current) {
    playNextChunk();
  }

  // 3. Wait for the queue to drain after the last chunk or server audio_complete event
  if (isLast) {
    scheduleChunkDrainCompletion();
  }
};

// Play the next chunk
const playNextChunk = () => {
  if (chunkQueueRef.current.length === 0) {
    isChunkPlayingRef.current = false;
    return;
  }
  const buffer = chunkQueueRef.current.shift()!;
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.onended = () => playNextChunk();
  source.start(0);
};
```

Chunked playback starts sooner because it does not wait for the full audio file to load. The tradeoff is that the application must manage the queue, ordering, cancellation, and the meaning of the "last chunk."

In the newer implementation, the server sends an `audio_complete` control message after all TTS chunks have been sent. The frontend no longer depends on an audio chunk having `isLast=true`. Even if one sentence fails to synthesize, it can correctly end the "interviewer is speaking" state after the successful chunks finish playing.

> ⚠️ **Note:** Browser autoplay policies require an `AudioContext` to be created or resumed after user interaction. If it is created during page load, most browsers put it in the `suspended` state. Call `audioContext.resume()` when the user clicks **Start Interview** to ensure playback works.

### Backend: WebSocket Session Management

The backend uses `VoiceInterviewWebSocketHandler` to manage the session lifecycle:

```java
// VoiceInterviewWebSocketHandler.java
public class VoiceInterviewWebSocketHandler {
    // Session states: idle -> listening -> thinking -> speaking -> completed
    // Supported actions: pause, resume, end

    // Receive client audio
    public void handleAudioMessage(String sessionId, String audioBase64) {
        asrService.sendAudio(sessionId, decodeBase64(audioBase64));
    }

    // Receive a client control message
    public void handleControlMessage(String sessionId, String action, Map data) {
        switch (action) {
            case "submit" -> llmService.triggerResponse(sessionId, data);
            case "cancel" -> cancelCurrentGeneration(sessionId);
            case "pause" -> pauseSession(sessionId);
        }
    }
}
```

The interview-guide session state machine is:

| State       | Meaning                               | Can transition to |
| ----------- | ------------------------------------- | ----------------- |
| IN_PROGRESS | Interview in progress                 | PAUSED, COMPLETED |
| PAUSED      | Paused (user left the page or paused) | IN_PROGRESS       |
| COMPLETED   | Interview ended                       | -                 |

Pause and resume are useful when the user takes a call or switches tabs; they can continue the interview when they return.

### Backend: ASR Service

The backend ASR service wraps the Alibaba Cloud DashScope API:

```java
// QwenAsrService.java
public void startTranscription(
    String sessionId,
    Consumer<String> onFinal,
    Consumer<String> onPartial,
    Runnable onReady,
    Consumer<Throwable> onError
) {
    // 1. Create a session and establish a WebSocket connection
    OmniRealtimeConversation conversation = new OmniRealtimeConversation(param, callback);
    conversation.connect();

    // 2. Enable server-side VAD and use 400 ms of silence to mark the end of a turn
    OmniRealtimeConfig config = OmniRealtimeConfig.builder()
        .enableTurnDetection(true)
        .turnDetectionSilenceDurationMs(400)
        .build();

    // 3. Send the session configuration. Do not mark the local state ready yet.
    conversation.updateSession(config);
}

// 4. Enable audio upload after the callback receives the server's session.updated event.
public void onSessionUpdated(String sessionId) {
    AsrSession asrSession = sessions.get(sessionId);
    asrSession.markReady();
    asrSession.getOnReady().run(); // Notify the frontend that ASR is ready
}

public void sendAudio(String sessionId, byte[] audioData) {
    AsrSession session = sessions.get(sessionId);
    if (!session.awaitReady(1200)) {
        throw new IllegalStateException("ASR session not ready");
    }
    String audioBase64 = Base64.getEncoder().encodeToString(audioData);
    session.getConversation().appendAudio(audioBase64);
}
```

This is important. `new OmniRealtimeConversation(...)` only creates the object; `connect()` establishes the connection. After `updateSession(config)` sends the configuration, the client must wait for the server's `session.updated` event. The frontend should disable the microphone until it receives `asr_ready` from the backend. If readiness times out or an `error` arrives, the backend should close the old connection, create a new session, and send reconnection status to the frontend. The callback names above are illustrative; implement the actual event types and methods for the DashScope SDK version used by the project.

When the server returns recognition results, the handler streams partial text to the frontend:

```java
// Stream partial text over WebSocket
websocket.sendMessage(new WebSocketSubtitleMessage(
    "subtitle",
    transcript,
    isFinal  // true means this is the final result
));
```

### Backend: TTS Service

```java
// QwenTtsService.java
public byte[] synthesize(String text) throws Exception {
    CountDownLatch latch = new CountDownLatch(1);
    ByteArrayContainer audioContainer = new ByteArrayContainer();

    QwenTtsRealtime qwenTts = new QwenTtsRealtime(param, callback);
    try {
        qwenTts.connect();

        QwenTtsRealtimeConfig config = QwenTtsRealtimeConfig.builder()
            .voice(voice)  // For example, "Cherry"
            .responseFormat(QwenTtsRealtimeAudioFormat.PCM_24000HZ_MONO_16BIT)
            .speechRate(speechRate)
            .build();

        qwenTts.updateSession(config);
        qwenTts.appendText(text);
        qwenTts.commit();

        if (!latch.await(30, TimeUnit.SECONDS)) {
            throw new TimeoutException("TTS synthesis timed out");
        }
        return audioContainer.toByteArray();
    } finally {
        qwenTts.close();
    }
}
```

The example omits audio callbacks and business-exception mapping, but does not treat a timeout as success. In production, close the connection on cancellation and restore the thread's interrupt flag after catching `InterruptedException`.

After the handler receives PCM data, it converts it to WAV and sends it to the frontend:

```java
// Submit each complete LLM sentence to the concurrent TTS queue
OrderedTtsChunkEmitter chunkEmitter = new OrderedTtsChunkEmitter(session, semaphore);
llmService.chatStreamSentences(userText, sentence -> {
    chunkEmitter.submit(sentence);
});

// Push TTS chunks in sentence order, then send the audio_complete control message
chunkEmitter.finish();
chunkEmitter.awaitCompletion();
```

The goal is to reduce total wait time: **the LLM generates sentences, TTS synthesizes them, and the frontend plays them concurrently.** The backend uses `max-concurrent-tts-per-session` to limit concurrent TTS requests per session and `tts-timeout-seconds` to prevent one stuck sentence from blocking the turn. If all sentence-level TTS requests fail, it falls back to synthesizing the full response.

## How Can a Voice Agent Support Interruptions?

Interruption handling is a common challenge for voice Agents; a pause button alone is not enough.

### Three Layers of Interruption Handling

1. **Playback interruption:** Stop the current audio when the user speaks.
2. **Generation interruption:** Cancel LLM and TTS generation on the server.
3. **Context interruption:** Track which content has and has not played.

The current version of interview-guide does not implement true barge-in. The code below only stops sending microphone audio to the backend while the AI is playing, avoiding ASR being triggered by echo. The tradeoff is that user interruptions are discarded too:

```typescript
// Current implementation: discard microphone audio during AI playback.
const handleAudioData = (audioData: string) => {
  if (isAiSpeakingRef.current) {
    return;
  }
  wsRef.current.sendAudio(audioData);
};

// When audio playback finishes
const finishAiPlayback = () => {
  aiAudioPendingRef.current = false;
  clearAudioPlaybackWatchdog();
  setAiSpeaking(false);
  setIsSubmitting(false);

  // Submit the full text after normal playback completes.
  commitAiMessage(aiTextRef.current.trim());
};
```

For true interruption support, client-side VAD must keep detecting user speech during playback. When triggered, stop the player, clear queued audio that has not played, and send `cancel` to the LLM or TTS task running on the backend. The context must also track text that has already played. The current `finishAiPlayback()` submits the full response only after playback finishes, so it does not support this behavior.

### Interruptions as State-Machine Events

In a state machine, an interruption is a control event that can occur in almost any state:

| Current state  | User action             | Correct response                                                                                                             |
| -------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `listening`    | User continues speaking | Continue capturing and transcribing; this is not an interruption.                                                            |
| `thinking`     | User adds information   | Cancel the current inference and restart it with the new input.                                                              |
| `speaking`     | User interrupts         | Stop playback and clear the queue.                                                                                           |
| `tool_calling` | User says "never mind"  | Cancel queries that can be canceled. For operations with side effects, use idempotency, compensation, or human confirmation. |

Without clear cancellation semantics, the system can quickly end up listening to a new question while still playing the old answer.

## What Roles Do Browser Audio Capture and Preprocessing Play?

WebRTC is often used loosely to refer to browser audio and video capabilities. For voice Agents, distinguish the browser's audio-capture and preprocessing APIs from the WebRTC real-time transport protocol.

**Key distinction:**

- **Media Capture and Streams API** (`getUserMedia`): Captures microphone audio and accepts constraints such as AEC, NS, AGC, and sample rate. This is what interview-guide uses.
- **WebRTC protocol** (`RTCPeerConnection`): Provides end-to-end real-time transport using protocols such as ICE, DTLS-SRTP, and RTP. This transport layer is needed for the WebRTC mode of OpenAI Realtime API, Azure Voice Live, or a custom real-time audio/video pipeline.

The audio path in interview-guide is:

```
getUserMedia → AudioWorklet → Base64 encoding → WebSocket transmission
```

This pipeline uses **WebSocket (TCP)** for transport, not WebRTC's **RTP/SRTP**. WebSocket preserves message order but can be affected by TCP retransmissions on weak networks. WebRTC usually prefers UDP and uses jitter buffers and packet-loss concealment to reduce audio stutter; it may fall back to TCP/TURN when network conditions require it.

### Browser Audio-Preprocessing Pipeline

For voice Agents, browser audio preprocessing mainly provides:

```
Microphone input
    │
    ▼
┌─────────────────────────┐
│  AEC (Acoustic Echo Cancellation) │ Removes speaker playback
└─────────────────────────┘
    │
    ▼
┌─────────────────────────┐
│  NS (Noise Suppression)           │ Reduces background noise
└─────────────────────────┘
    │
    ▼
┌─────────────────────────┐
│  AGC (Automatic Gain Control)      │ Stabilizes volume
└─────────────────────────┘
    │
    ▼
┌─────────────────────────┐
│  VAD (Voice Activity Detection)    │ Detects speech
└─────────────────────────┘
    │
    ▼
Encoded output
```

### Choosing `getUserMedia` Settings

interview-guide uses a basic `getUserMedia` configuration:

```typescript
navigator.mediaDevices.getUserMedia({
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 16000,
  },
});
```

This is not the only option; settings involve tradeoffs:

| Parameter          | `true`                                                      | `false`                                                   | Guidance                                                                  |
| ------------------ | ----------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------- |
| `echoCancellation` | Removes speaker echo but may reduce audio quality           | Preserves raw audio quality but requires implementing AEC | Enable it                                                                 |
| `noiseSuppression` | Reduces noise but may also suppress the user's voice        | Requires implementing NS                                  | Enable in noisy environments; disable in quiet ones                       |
| `autoGainControl`  | Automatically adjusts volume                                | Uses the microphone's raw volume                          | Enable it                                                                 |
| `sampleRate`       | A higher rate may improve quality but increases data volume | 16 kHz is sufficient for many ASR models                  | Follow model requirements; browsers may not strictly honor the constraint |

AEC, NS, and AGC vary across browsers and devices. Test desktop Chrome, Safari, and mobile separately, covering speaker playback, headphones, meeting rooms, and mobile networks.

### Where WebRTC Fits

WebRTC works well for real-time browser audio. For an app or hardware product, consider platform capabilities and power constraints.

For native mobile development, consider:

- **iOS:** `AVAudioEngine` and built-in system audio processing.
- **Android:** `AudioRecord` with Oboe/AAudio, or Google's WebRTC library.

Hardware products such as smart speakers and in-car systems usually need dedicated DSP or audio-front-end algorithms for echo cancellation, microphone-array beamforming, and far-field pickup. Browser-style software preprocessing alone is not enough.

## Cascaded Pipelines vs. Native Real-Time Models

This is a key architectural decision.

### Option 1: Cascaded ASR + LLM + TTS

```
Audio → VAD → streaming ASR → LLM → streaming TTS → audio
```

Advantages:

- ASR transcripts can be stored, audited, and corrected.
- The LLM uses text input and output, making it easy to reuse existing Agent frameworks.
- TTS voices and providers can be replaced independently.
- Each component can be load-tested and optimized separately.

Disadvantages:

- Each stage adds latency.
- ASR errors propagate to the LLM.
- The intermediate text loses tone, pauses, and emotion.
- Interruption handling must coordinate cancellation across ASR, LLM, TTS, and the player.

interview-guide uses this architecture. It suits enterprise knowledge assistants, customer-support workflows, and business systems that require compliance audits.

### Option 2: Native Real-Time Speech-to-Speech

```
Audio → native multimodal model → audio
```

Examples include OpenAI Realtime API, Gemini Live API, and Alibaba Qwen-Omni.

Advantages:

- Lower end-to-end latency.
- Better preservation of paralinguistic signals such as tone, pauses, and emotion.
- Unified handling of audio input, text events, and tool calls.

Disadvantages:

- The internal process is more of a black box, so troubleshooting depends more on provider logs.
- Text auditing and response control require additional design.
- Pricing may be based on audio tokens or duration.
- Provider APIs may not meet requirements for private deployment.

**Connection options:**

The current OpenAI Realtime API documentation describes three connection types:

| Connection | Suitable use                                                                        |
| ---------- | ----------------------------------------------------------------------------------- |
| WebRTC     | Browser and mobile apps that capture microphone input and play model audio directly |
| WebSocket  | Server-to-server middleware with low latency and more control                       |
| SIP        | VoIP integration for call centers and telephone support                             |

### Recommendations

For high-volume, real-time products that prioritize natural interaction, evaluate a native Realtime API first. If you need to audit ASR transcripts step by step, control response wording, or deploy privately, a cascaded pipeline is usually easier to observe and modify. However, more components also mean more timeouts and failure points.

**Do not build a client-cloud hybrid on day one.** Get one pipeline working first, then replace components incrementally.

## How Can You Optimize a Voice System in Production?

### 1. Tune Audio Frames and Upload Chunks

Codecs and speech processing often use frame lengths such as 10, 20, or 30 ms. The application can combine several frames into one network chunk. Frame length and upload-chunk size are different: large processing frames add algorithmic latency, while very small network chunks increase message and encoding overhead.

interview-guide uses **200 ms chunks**:

```typescript
// pcm-processor.js
this.targetSampleRate = 16000;
this.samplesPerChunk = 3200; // 200 ms at 16 kHz
```

This does not make ASR wait for the whole sentence, but it can add up to one chunk interval to audio upload. Combined with the server-side VAD silence threshold, users may still notice a delay after they finish speaking. Improvements include:

- Reduce chunks to 100 ms.
- Send a short initial segment from the frontend to warm up ASR.
- Use stable ASR partials for early intent prediction; use VAD events only for speech activity and turn boundaries.

### 2. Have the LLM Speak in Short Sentences First

A spoken response is not an essay. Users do not need to hear a 500-word answer up front.

Better strategies include:

- Start with an acknowledgement: "Let me check."
- Play a transition while a tool runs: "I'm checking your most recent order."
- Give the result once it is available.
- Break long explanations into sentences that can be synthesized independently.

### 3. Split TTS at Semantic Boundaries

If TTS segments are too short, speech sounds choppy; if they are too long, time to first audio increases.

Split text in this order of preference:

1. Periods, question marks, and exclamation points.
2. Semicolons and colons.
3. Longer comma-separated phrases.
4. Force-split unusually long sentences.

Avoid splitting numbers, English abbreviations, or code names incorrectly. For example, do not break `GPT-4o-mini-tts` into arbitrary fragments.

interview-guide follows this approach: as the LLM streams output, each complete sentence is immediately passed to `OrderedTtsChunkEmitter` for sentence-level synthesis. The frontend queues and plays each `audio_chunk` as it arrives, then waits for the queue to drain after `audio_complete`. The first spoken segment no longer has to wait for the entire response to be generated and synthesized.

### 4. Control Context Length

Voice Agents can easily put every transcript, tool result, and playback state into context. This may be manageable at first, but in long sessions it increases both latency and cost.

Separate context into three layers:

- **Recent transcript:** Full transcripts and responses from the latest turns.
- **Session summary:** User goals, confirmed facts, and unfinished tasks.
- **Event state:** Current playback position, interruption status, and tool results.

The LLM does not need details of every audio frame. It needs high-signal state relevant to the current decision.

### 5. Instrument the Full Pipeline

interview-guide uses Redis to cache session state:

```java
// VoiceInterviewService.java
private static final String SESSION_CACHE_KEY_PREFIX = "voice:interview:session:";

private void cacheSession(VoiceInterviewSessionEntity session) {
    String cacheKey = getSessionCacheKey(session.getId());
    RBucket<VoiceInterviewSessionEntity> bucket = redissonClient.getBucket(cacheKey);
    bucket.set(session, Duration.ofHours(CACHE_TTL_HOURS));
}
```

In production, also record:

- Duration of uploaded audio.
- Duration of detected speech.
- ASR tokens or minutes processed.
- LLM input and output tokens.
- TTS characters, audio duration, and interrupted duration.
- End-to-end latency and cancellations per turn.

Without these metrics, it is difficult to control the cost of a voice Agent.

## How Could the Voice Agent Evolve?

interview-guide is a basic implementation with room for improvement.

### Client-Cloud Hybrid

interview-guide is currently designed to rely mostly on the cloud. One direction for improvement is to move more capabilities to the client:

| Stage | Current                       | Possible evolution                                                        |
| ----- | ----------------------------- | ------------------------------------------------------------------------- |
| VAD   | Client-side + server-side VAD | Use client-side VAD to reduce server load                                 |
| ASR   | Cloud only                    | Handle simple commands on the client and complex recognition in the cloud |
| LLM   | Cloud only                    | Use a small client-side model as a fallback during network outages        |
| TTS   | Cloud only                    | Keep fixed prompts on the client and natural conversation in the cloud    |

Hybrid deployment does not mean moving every model to the client. A safer approach is to move latency-sensitive, privacy-sensitive, and offline-fallback capabilities to the client, while keeping tasks that need large-model understanding, complex reasoning, or centralized auditing in the cloud.

### Local Model Deployment

If you have data-compliance requirements, consider deploying ASR and TTS locally:

- **ASR**：faster-whisper、FunASR、SenseVoice
- **TTS:** piper1-gpl (the original Piper project is archived), Fish Speech, CosyVoice

**Note:** The original Piper repository (`rhasspy/piper`) was archived in October 2025, and development moved to [OHF-Voice/piper1-gpl](https://github.com/OHF-Voice/piper1-gpl). piper1-gpl uses GPL-3.0, so commercial projects must assess open-source compliance. The project is also seeking new maintainers, making long-term support uncertain. Fish Speech is not Apache 2.0: its current models, code, and documentation are governed by the [Fish Audio Research License](https://github.com/fishaudio/fish-speech/blob/main/LICENSE). Research and non-commercial use are free; commercial use requires written permission from Fish Audio. Check the licenses for CosyVoice code, model weights, and voice assets separately as well.

Local deployment offers control and offline operation. Its main disadvantage is **high engineering cost**: you must load-test GPU, memory, and concurrency capacity, and implement streaming inference, model hot-loading, and GPU-memory reclamation.

### Native Realtime APIs

If latency and naturalness remain poor in a cascaded pipeline, evaluate a native Realtime API:

- OpenAI Realtime API (supports WebRTC, WebSocket, and SIP; read the model name from configuration or a model gateway)
- Gemini Live API
- Alibaba Qwen-Omni

These APIs combine ASR, LLM, and TTS in a unified multimodal pipeline, often improving latency and naturalness. The tradeoffs are real: the process is more of a black box, pricing changes quickly, and debugging and auditing need additional design.

OpenAI made the Realtime API generally available in August 2025 and released the dedicated voice model `gpt-realtime`. Realtime models change quickly. Do not scatter model names through production business logic; manage them through a configuration service or model gateway, and check the current model catalog before release.

At general availability, the Realtime API also introduced or expanded several capabilities:

1. **Remote MCP server support**, allowing external tools to be called as in a cascaded pipeline.
2. **Image input**, allowing the model to discuss content visible on the user's screen.
3. **SIP telephony integration**, connecting to traditional telephone networks.

Do not hard-code prices. Realtime models may have separate rates for text, audio, cached input, and output. Check the official pricing page before integration.

### Improving Interruption Handling

interview-guide currently uses "silent discard" for interruptions: it does not send the user's voice while the AI is speaking. This is simple but does not feel natural.

Better approaches include:

- Continue capturing audio while the AI speaks, but do not send it to ASR.
- When user speech is detected, lower the AI's playback volume gradually instead of stopping abruptly.
- Preserve the context of content that has already played after an interruption.

### Multimodal Extensions

interview-guide currently supports only voice. It could be extended with:

- **Voice + screen sharing:** Let the interviewer see the candidate's IDE.
- **Voice + camera:** Observe the candidate's facial expressions and body language.
- **Voice + whiteboard:** Draw architecture diagrams together.

These multimodal capabilities require more complex stream management and state synchronization.

## How Should You Answer AI Voice-System Interview Questions?

If an interviewer asks, "How would you design a real-time voice Agent?"

Structure your answer like this:

1. **Describe the pipeline:** The client captures audio, VAD detects speech boundaries, ASR transcribes in a stream, the LLM understands intent and calls tools, TTS synthesizes speech incrementally, and the client plays audio as it arrives.
2. **Explain the challenges:** End-to-end latency, user interruptions, noisy environments, conversation state, and client-cloud coordination.
3. **Discuss the state machine:** Manage states such as `listening`, `thinking`, `speaking`, and `interrupted`. On interruption, cancel playback and generation, and track played and unplayed content.
4. **Explain the architecture choice:** Cloud APIs are quick to launch; local models offer control but cost more to engineer. Evaluate hybrid architectures and speech-to-speech APIs against latency, compliance, cost, and observability requirements.

## Summary

An AI voice Agent is a real-time audio pipeline. VAD controls turn-taking; ASR, LLM, and TTS must work together as streams; and playback, interruption, cancellation, and session state must be coordinated. A cascaded pipeline is easier to control and audit, while a native real-time model may offer lower latency and more natural interaction. Choose how to divide work between client and cloud based on real-time requirements, privacy, offline fallback, cost, and operational capacity. Whichever architecture you choose, design it to support cancellation, observability, and graceful degradation rather than treating it as three API calls in sequence.
