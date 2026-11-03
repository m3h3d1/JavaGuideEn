---
title: "RAG Evaluation: From Offline Datasets to Production Observability"
description: An introduction to RAG evaluation, covering dataset construction, Hit@K, Evidence Recall, MRR, answer faithfulness, refusal evaluation, version comparison, and production observability.
category: AI Application Development
head:
  - - meta
    - name: keywords
      content: RAG evaluation,Hit@K,MRR,Faithfulness,refusal evaluation,LangSmith,Ragas,observability
---

If a knowledge-base Q&A system returns a fluent response, how can you tell whether it is good? You need to check whether it found the right information, whether the answer is supported, and whether it makes things up when the information is missing.

Starting with a knowledge-base Q&A example, this guide explains how to prepare evaluation samples, assess retrieval and generation separately, and use results to guide improvements. If you are not familiar with the Q&A workflow, start with [RAG Fundamentals](./rag-basis.md).

## What Is RAG Evaluation?

**RAG evaluation measures a retrieval-augmented generation system against criteria defined in advance.** It checks retrieval results and request execution as well as the final answer.

Suppose a sample product manual says:

> The Standard plan supports file uploads up to 20 MB; the Pro plan supports up to 100 MB. Uploaded files are retained for 7 days and deleted automatically after that.

The user asks, "What is the maximum file size for the Standard plan, and how long are uploaded files retained?" The system should find evidence for both the upload limit and retention period, then answer "20 MB, 7 days."

| What to check     | Question                                        | Example                                                                 |
| ----------------- | ----------------------------------------------- | ----------------------------------------------------------------------- |
| Retrieval results | Were the required facts retrieved?              | Were both "20 MB" and "7 days" found?                                   |
| Generated answer  | Is the answer correct, complete, and supported? | Was the Pro plan's 100 MB limit mistaken for the Standard plan's limit? |
| Execution         | Did the request complete at an acceptable cost? | Did it time out, and what were the total latency and Token usage?       |

If the user then asks whether a deleted file can be recovered, the manual does not provide an answer. Evaluation should check that the system identifies the missing information instead of making up "it can be recovered" or "it cannot be recovered."

An evaluation run generally needs a question set, a fixed corpus, scoring criteria, and actual results. Reference answers can guide scoring, but the output does not need to match them word for word: "one week" and "7 days" mean the same thing.

## Why Evaluate RAG?

If you change the chunk size from 800 to 400 and one answer improves, does that prove the configuration is better? No. The evidence may be easier to retrieve, or the generated response may simply be more complete this time. Other evidence may have been split across chunks, making results worse.

Compare the same questions and source material to see which samples were affected by a change. Evaluation is mainly used to:

- **Choose configurations**: Compare the benefits and costs of chunking, embeddings, Top-K, reranking, and prompts.
- **Diagnose errors**: Distinguish missed retrieval, evidence lost from context, generation errors, and failed calls.
- **Check for regressions**: After fixing one class of issue, recheck questions that previously worked.

An overall score alone rarely shows what to fix. If the manual includes a retention period but it was not retrieved, investigate retrieval. If the evidence was in the prompt but the model answered "stored permanently," investigate generation.

**Offline evaluation** uses prepared samples and is suitable for version comparisons. **Production observability** records the state, latency, and intermediate steps of real requests to help diagnose problems. Sampling and scoring those requests adds production quality evaluation. "Offline" does not mean the system is disconnected from the network; calls to external models may still incur costs.

[LangSmith's evaluation concepts guide](https://docs.langchain.com/langsmith/evaluation-concepts) describes the roles of offline experiments and online evaluation: find issues in production, then turn them into offline samples to verify fixes.

## How to Prepare an Evaluation Set

### Start with Questions, Evidence, and Reference Points

Start with a small set of questions that can be reviewed individually. Include direct facts, paraphrases, evidence across multiple passages, partially answerable questions, and questions outside the knowledge base. Increase the set gradually, making sure the basis for judging each question is clear.

Here is an example based on the product manual above. These fields illustrate one possible design; they are not a required format for any framework:

```json
{
  "id": "upload-01",
  "question": "What is the maximum file size for the Standard plan, and how long are uploaded files retained?",
  "corpusVersion": "manual-v1",
  "expectedEvidence": [
    {
      "id": "upload-limit",
      "text": "The Standard plan supports file uploads up to 20 MB"
    },
    {
      "id": "retention",
      "text": "Uploaded files are retained for 7 days and then deleted automatically"
    }
  ],
  "referenceKeyPoints": ["Upload limit is 20 MB", "Retained for 7 days"],
  "answerability": "FULL",
  "reviewStatus": "PENDING"
}
```

Evidence is used to judge whether retrieval found support; reference points are used to judge answer completeness. Both should be traceable to the same source version.

Chunk IDs often change when chunking is adjusted. To compare chunking strategies, label evidence by its source location, a short evidence anchor, or a stable fact ID, then map it to the retrieved passages. Do not use old Chunk IDs to judge whether a new chunking strategy retrieved the evidence.

Substring checks are easy to implement, but may miss evidence across chunks, table conversions, or paraphrases. If you use them, define normalization rules and manually inspect likely false negatives.

### Distinguish Fully Answerable, Partially Answerable, and Unanswerable Questions

Determine answerability based on the specified corpus version, access permissions, and information sources allowed by the business. For systems required to answer only from the knowledge base, use three categories:

| Category  | Available information                      | Expected behavior                                               |
| --------- | ------------------------------------------ | --------------------------------------------------------------- |
| `FULL`    | Covers the information needed              | Answer fully and provide evidence                               |
| `PARTIAL` | Covers only part of the question           | Answer the supported part and identify what is missing          |
| `NONE`    | Does not support the requested information | State that information is insufficient; do not invent an answer |

For example, "How long is a file retained after upload, and can it be recovered after deletion?" is partially answerable. The expected answer is "It is retained for 7 days; the manual does not say whether it can be recovered after deletion." Treating it as a full refusal omits information that is available; requiring an answer about recovery encourages fabrication.

Answerability, reference points, and evidence all need review. Automatically generated labels can initially be marked `PENDING` and changed to `REVIEWED` after human confirmation. **Pending review is neither a pass nor a failure.** Formal reports should show both the number of valid scored samples and the number awaiting review.

### Keep Development and Holdout Sets Separate

Use a development set to tune settings and analyze errors. Use a holdout set to evaluate questions that did not participate in tuning. Keep paraphrases of the same question and similar questions generated from the same template together on one side to avoid data leakage.

Questions repeatedly used to fix rules can remain in the regression set, but should no longer be described as independent blind tests. Keep distractor documents from the same domain as well. If a knowledge base has only five passages and Top-K is set to eight, returning the entire corpus may produce a high hit rate that cannot distinguish retrieval strategies.

## How to Evaluate Retrieval Quality

First define what is being evaluated: the initial retrieval candidates, the reranked Top-K, or the final context sent to the model. These stages can produce different results. Record them separately so high recall in the candidate pool is not mistaken for evidence coverage in the model's actual context.

For samples with reviewed expected evidence and at least one evidence item, start with three metrics:

| Metric            | Calculation                                                                                            | What it measures                            |
| ----------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------- |
| Hit@K             | Number of questions with at least one expected evidence item in Top-K / valid questions                | Whether anything relevant was found         |
| Evidence Recall@K | For each question, matched evidence items / all expected evidence items; then average across questions | How much of the required evidence was found |
| MRR@K             | Average reciprocal rank of the first relevant result for each question; a miss in Top-K scores 0       | How highly the first relevant result ranked |

Here, Evidence Recall deduplicates by evidence ID and uses macro-averaging across questions. Do not treat it as interchangeable with chunk-level Recall or a metric with the same name in another tool.

For the upload question, both "20 MB" and "7 days" are required. Suppose the Top 3 results are:

1. Account-editing instructions, unrelated to the question.
2. The Standard plan's upload limit is 20 MB.
3. Invoice-request instructions, unrelated to the question.

For this question, Hit@3 is 1, Evidence Recall@3 is 1/2, and reciprocal rank (RR@3) is 1/2. **MRR is the average RR across multiple questions.** Finding one piece of evidence does not mean all information needed for the answer was retrieved.

Precision@K can also measure how many returned results are relevant. It counts the selected result unit and differs from Evidence Recall, which counts facts. Define the denominator when fewer than K results are returned and keep it fixed across evaluations.

Questions outside the knowledge base have no expected evidence, so the Recall denominator is zero. Mark the metric as not applicable and evaluate refusal behavior instead. Do not treat these questions as perfect retrieval samples.

## How to Evaluate Generated Answers

### Evaluate Correctness, Completeness, and Faithfulness Separately

| Dimension        | Compare                                       | Typical error                                                                             |
| ---------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Correctness      | Answer vs. reviewed reference facts           | Stating the Standard plan's limit is 100 MB                                               |
| Completeness     | Answer vs. reference points                   | Giving the upload limit but omitting retention time                                       |
| Faithfulness     | Claims in the answer vs. the context provided | Claiming "it can be recovered within 30 days" when the context does not describe recovery |
| Relevance        | Answer vs. user question                      | Giving a long account-registration explanation when asked about retention                 |
| Citation support | Cited passage vs. the claim it supports       | Providing a source link that does not support the conclusion                              |

Correctness and faithfulness are easy to confuse. If the context is an outdated manual, an answer based on it may be faithful to that context but inconsistent with the current policy. Conversely, a model might happen to answer correctly from its parameters, but without supporting context the answer is not faithful to the provided evidence.

[Ragas's Faithfulness metric](https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/faithfulness/) splits an answer into factual claims and checks whether the context supports them. When using this scoring approach, handle empty answers and refusals without factual claims separately; do not score them as perfect complete answers.

### Track Programmatic and Semantic Refusals Separately

Programmatic refusal is a state recorded by the application, such as `NO_RESULT`. Semantic refusal is the meaning expressed in the answer, such as "The source does not explain how to recover the file, so I cannot confirm." These state names are implementation examples, not universal RAG standards.

The two can disagree: the model may clearly refuse while the application records `ANSWERED`, or the application may treat the phrase "not supported" as a refusal and misclassify a normal technical statement such as "The Standard plan does not support batch uploads."

Refusal evaluation can be split into two checks:

- **Programmatic classification accuracy**: Does the application's decision match an independent review of the answer's meaning? Track missed and false classifications separately.
- **Whether refusal was appropriate**: Did the system refuse unanswerable questions, incorrectly refuse answerable questions, or preserve supported information for partially answerable questions?

For example, the denominator for correct refusals on unanswerable samples should include only unanswerable samples with successful execution and reviewed answerability and answer semantics. The false-refusal rate for answerable samples uses a different denominator. Reports should show coverage counts for both groups.

Do not use the same production keyword detector both to generate the programmatic status and as the semantic scoring standard. Even if they agree, they may simply be repeating the same error. Rule-based tests suit known expressions; human review or a separately calibrated evaluator should assess answer meaning.

## How Should Execution Failures Be Counted?

Record network disconnections, model timeouts, user cancellations, and normal refusals separately. A normal refusal completes the request and can be evaluated for appropriateness. An execution failure has no complete answer and should not be included directly in the denominator for answer correctness or faithfulness.

Suppose ten questions were scheduled, two timed out, and the other eight passed review. The report should include:

- Execution success rate: 8/10, or 80%.
- Pass rate among valid answers: 8/8, or 100%.
- Timeout count: 2, with failure reasons and latency retained.

Reporting only 100% would hide failed requests. An end-to-end success rate across all requests can also be reported, but use a different name and state how timeouts are scored.

Each quality metric must also exclude not-applicable and unreviewed labels, so its valid sample count may differ. If there are no valid samples, return `null` or "not applicable"; do not substitute 0 or 100%.

Retry policies also affect comparisons. When retries are enabled, retain the number of attempts, the first failure, the final outcome, and cumulative latency and cost. Do not keep only successful retries.

## How to Run an Offline Evaluation

You do not need to integrate a full platform from the start. A script that reads JSONL can run this workflow:

```text
Load the fixed corpus, samples, and configuration
  -> Call the retrieval or Q&A workflow being evaluated
  -> Save candidate passages, final context, and full answers
  -> Record terminal state, stage latencies, and call costs
  -> Score each metric using valid labels
  -> Output per-question results and a summary report
```

Reuse the application's actual retrieval and context-building logic where possible; otherwise, you are evaluating a different implementation. For multi-turn questions, in addition to saving conversation history, specify whether the evaluation covers the real session's history loading, trimming, and persistence. Generating once from supplied history is not the same as testing continuous multi-turn interaction.

At minimum, pin and record the corpus and dataset versions, code version, model, chunking strategy, Top-K, filters, reranking configuration, prompt, and evaluator version for each experiment. Set a reasonable overall generation timeout and save failure reports before deciding whether the pipeline should exit with a failure.

Scoring methods can be combined. Code rules suit structure, evidence matching, and deterministic checks; human review helps establish standards and resolve disagreements; LLM-as-Judge can assist with batch scoring against a clear rubric. For model-based scores, retain the rationale, cited evidence, judge model, and prompt version. Check for bias using human-reviewed samples; do not label model scores as "human reviewed."

For a reference implementation, see [LangSmith's RAG evaluation tutorial](https://docs.langchain.com/langsmith/evaluate-rag-tutorial). It demonstrates separate checks for answer correctness, relevance, grounding, and retrieval relevance, and can help organize scoring inputs. You will still need your own standards for refusals and exceptions.

## How to Tell Whether an Optimization Helped

Save a baseline, then change one main factor at a time. To compare chunk sizes, keep the questions, corpus, model, Top-K, and scoring method fixed. To compare models, keep the actual context supplied to them as consistent as possible.

In addition to overall averages, comparison reports should retain per-question differences and category results. Overall metrics may improve even as cross-passage questions get worse or the system starts inventing answers to unanswerable questions. Investigate new errors through the workflow:

1. Does the source contain the information, and did parsing preserve the key conditions?
2. Did retrieval place the evidence in the initial candidate pool?
3. Did reranking place it outside the truncation limit?
4. Did deduplication, compression, or the Token budget remove the evidence?
5. If the evidence was provided, did the model omit or misread it?

Model outputs vary. When differences are small or there are few samples, run important samples multiple times and report each result and the variation. Do not claim a stable improvement based on one high score. Compare model latency, Token use, and cost as well.

Regression tests and evaluation of real generated answers serve different purposes. Saving a previously misclassified response can reliably check whether a refusal rule was fixed, but cannot prove that the model will classify other new phrasings correctly. After the development regression passes, evaluate new answers on independent samples.

## What to Monitor After Launch

Offline questions cannot cover every real request. In production, link the question, retrieval, context, model call, and result in the same trace to identify where a failure occurred.

| Data to record                                                      | Troubleshooting use                                                    |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Request ID, session ID, and version information                     | Connect feedback to a specific configuration                           |
| Original and rewritten questions                                    | Determine whether query rewriting changed the intent                   |
| Candidate passages, rankings, and filters                           | Check why evidence was missed or ranked too low                        |
| Actual context, full answer, and citations                          | Determine whether generation used and stayed faithful to the evidence  |
| Terminal business state, refusal reason, exceptions, and retries    | Distinguish normal refusals, misclassification, and execution failures |
| Retrieval, reranking, time to first token, total latency, and usage | Locate changes in latency and cost                                     |

When storing questions, answers, and passages, set masking, access permissions, and retention periods according to data sensitivity. Do not bypass existing access controls for troubleshooting. Use model, version, and bounded-state values as metric labels; do not use full questions or request IDs as time-series metric labels.

Start by monitoring execution success rate, timeout rate, refusal rate, latency percentiles, and call costs. An increase in refusals may be caused by poor knowledge coverage, a shift in question distribution, access filtering, or detector misclassification; this metric alone cannot identify the cause.

Answer quality needs further review through sampling. Include normal traffic as well as negative user feedback, refusals, and new question types. Reviewing only negative feedback provides an analysis of problems, not a representative measure of overall traffic quality. After masking confirmed errors, add them to the development regression set, rerun after fixes, and monitor production behavior.

## References

- [LangSmith: Evaluation Concepts](https://docs.langchain.com/langsmith/evaluation-concepts): Learn how datasets, experiments, evaluators, and offline/online evaluation relate.
- [LangSmith: Evaluate a RAG Application](https://docs.langchain.com/langsmith/evaluate-rag-tutorial): See an example of organizing RAG scores by dimension.
- [Ragas: Faithfulness](https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/faithfulness/): Learn how to check factual claims against context.
- [AI Application Evaluation](../llm-basis/llm-evaluation.md): Learn more about general evaluation sets, quality gates, and release validation.
- [RAG Optimization: Retrieval, Reranking, and Context Engineering](./rag-optimization.md): Use per-question evaluation results to locate and fix problems.
