---
title: How the @Async Annotation Works
description: Learn how Spring's @Async annotation works, including async task configuration, thread pools, @EnableAsync, and common pitfalls.
category: Frameworks
tag:
  - Spring
head:
  - - meta
    - name: keywords
      content: Spring async,@Async,EnableAsync,thread pool,TaskExecutor,async tasks,Spring annotations,asynchronous methods
---

Spring provides the `@Async` annotation to run annotated classes or methods on an **asynchronous thread**. When the method is called, the caller does not wait for it to finish and can continue with subsequent code.

Using `@Async` requires two steps:

1. Add `@EnableAsync` to the application class to enable async execution.
2. Add `@Async` to the method or class that should run asynchronously.

```java
@SpringBootApplication
// Enable async execution.
@EnableAsync
public class YourApplication {

    public static void main(String[] args) {
        SpringApplication.run(YourApplication.class, args);
    }
}

// Async service.
@Service
public class MyService {

    // A custom thread pool is recommended; this example shows basic usage.
    @Async
    public CompletableFuture<String> doSomethingAsync() {

        // Perform time-consuming business logic here.
        // ...
        // CompletableFuture makes it easier to handle the result without blocking the main thread.
        return CompletableFuture.completedFuture("Async Task Completed");
    }

}
```

Next, let's look at how `@Async` works internally.

## How @Async Works

`@Async` runs tasks asynchronously by using **dynamic proxies**. A Spring `BeanPostProcessor` creates a proxy for classes that use `@Async`. The proxy intercepts calls to annotated methods, wraps their execution in an async task, and submits it to a thread pool.

Let's examine the process in detail.

### Enabling Async Execution

Before using `@Async`, add `@EnableAsync` to the application class. The annotation is defined as follows:

```JAVA
// Other annotations omitted ...
@Import(AsyncConfigurationSelector.class)
public @interface EnableAsync { /* ... */ }
```

`@EnableAsync` uses `@Import` to bring in `AsyncConfigurationSelector`, so Spring loads the imported class.

`AsyncConfigurationSelector` implements `ImportSelector` and overrides `selectImports()` to customize Bean loading:

```JAVA
public class AsyncConfigurationSelector extends AdviceModeImportSelector<EnableAsync> {
	@Override
	@Nullable
	public String[] selectImports(AdviceMode adviceMode) {
		switch (adviceMode) {
	   // Proxy-based Spring AOP; this may use JDK dynamic proxies or CGLIB.
			case PROXY:
				return new String[] {ProxyAsyncConfiguration.class.getName()};
   // AspectJ-based weaving.
			case ASPECTJ:
				return new String[] {ASYNC_EXECUTION_ASPECT_CONFIGURATION_CLASS_NAME};
			default:
				return null;
		}
	}
}
```

`selectImports()` selects a class based on the advice mode. The default value of `adviceMode` is `PROXY`.

For proxy-based Spring AOP, Spring loads `ProxyAsyncConfiguration`:

```JAVA
@Configuration
@Role(BeanDefinition.ROLE_INFRASTRUCTURE)
public class ProxyAsyncConfiguration extends AbstractAsyncConfiguration {
	@Bean(name = TaskManagementConfigUtils.ASYNC_ANNOTATION_PROCESSOR_BEAN_NAME)
	@Role(BeanDefinition.ROLE_INFRASTRUCTURE)
	public AsyncAnnotationBeanPostProcessor asyncAdvisor() {
			 // ...
  // Load the post-processor.
		AsyncAnnotationBeanPostProcessor bpp = new AsyncAnnotationBeanPostProcessor();

  // ...
		return bpp;
	}
}
```

### The Post-Processor

`ProxyAsyncConfiguration` uses `@Bean` to register `AsyncAnnotationBeanPostProcessor`, the post-processor that makes `@Async` work.

If a class or method uses `@Async`, `AsyncAnnotationBeanPostProcessor` creates a dynamic proxy for the class.

When a method on that class is called, the proxy's interceptor catches the call and runs methods annotated with `@Async` asynchronously.

Here is the `AsyncAnnotationBeanPostProcessor` code:

```JAVA
public class AsyncAnnotationBeanPostProcessor extends AbstractBeanFactoryAwareAdvisingPostProcessor {
	@Override
	public void setBeanFactory(BeanFactory beanFactory) {
		super.setBeanFactory(beanFactory);
  // Create an AsyncAnnotationAdvisor to intercept @Async methods and run them asynchronously.
		AsyncAnnotationAdvisor advisor = new AsyncAnnotationAdvisor(this.executor, this.exceptionHandler);
		// Set a custom asyncAnnotationType on the advisor, if configured.
		// This can specify a custom async annotation, such as @MyAsync.
		if (this.asyncAnnotationType != null) {
			advisor.setAsyncAnnotationType(this.asyncAnnotationType);
		}
		advisor.setBeanFactory(beanFactory);
		this.advisor = advisor;
	}
}
```

The parent class of `AsyncAnnotationBeanPostProcessor` implements `BeanFactoryAware`. Its `setBeanFactory()` method is overridden as an extension point to load `AsyncAnnotationAdvisor`.

#### Creating the Advisor

In Spring AOP, an `Advisor` combines `Advice` and a `Pointcut`. `Advice` is the logic to apply; the `Pointcut` selects where to apply it.

`AsyncAnnotationBeanPostProcessor` creates an `AsyncAnnotationAdvisor`, whose constructor builds the corresponding `Advice` and `Pointcut`:

```JAVA
public class AsyncAnnotationAdvisor extends AbstractPointcutAdvisor implements BeanFactoryAware {

    private Advice advice; // Advice for asynchronous execution.
    private Pointcut pointcut; // Pointcut matching @Async methods.

    // Constructor.
    public AsyncAnnotationAdvisor(/* parameters omitted */) {
        // 1. Create Advice for asynchronous execution.
        this.advice = buildAdvice(executor, exceptionHandler);
        // 2. Create a Pointcut to select target methods for interception.
        this.pointcut = buildPointcut(asyncAnnotationTypes);
    }

    // Create Advice.
    protected Advice buildAdvice(/* parameters omitted */) {
        // Create the interceptor for asynchronous execution.
        AnnotationAsyncExecutionInterceptor interceptor = new AnnotationAsyncExecutionInterceptor(null);
        // Configure the interceptor with an executor and exception handler.
        interceptor.configure(executor, exceptionHandler);
        return interceptor;
    }

    // Create a Pointcut.
    protected Pointcut buildPointcut(Set<Class<? extends Annotation>> asyncAnnotationTypes) {
        ComposablePointcut result = null;
        for (Class<? extends Annotation> asyncAnnotationType : asyncAnnotationTypes) {
            // 1. Class-level pointcut: matches if the class has the annotation.
            Pointcut cpc = new AnnotationMatchingPointcut(asyncAnnotationType, true);
            // 2. Method-level pointcut: matches if the method has the annotation.
            Pointcut mpc = new AnnotationMatchingPointcut(null, asyncAnnotationType, true);

            if (result == null) {
                result = new ComposablePointcut(cpc);
            } else {
                // Combine this pointcut with the previous ones using union.
                result.union(cpc);
            }
            // Add the method-level pointcut to the composite pointcut.
            result = result.union(mpc);
        }
        // Return the composite pointcut, or Pointcut.TRUE if no annotation types were provided.
        return (result != null ? result : Pointcut.TRUE);
    }
}
```

The key task of `AsyncAnnotationAdvisor` is to build `Advice` and a `Pointcut`:

- Building `Advice`: creates an `AnnotationAsyncExecutionInterceptor`, which runs the advice logic in its `invoke()` method.
- Building a `Pointcut`: combines a `ClassFilter` and a `MethodMatcher` to select methods to which the advice should apply.

#### Post-Processing Logic

The `postProcessAfterInitialization()` method used by `AsyncAnnotationBeanPostProcessor` is implemented in its parent, `AbstractAdvisingBeanPostProcessor`. It performs post-processing after the Bean has been initialized.

The post-processing method checks whether the Bean matches the post-processor's `Advisor`. If it does, a proxy is created:

```JAVA
// AbstractAdvisingBeanPostProcessor
public Object postProcessAfterInitialization(Object bean, String beanName) {
	if (this.advisor == null || bean instanceof AopInfrastructureBean) {
		return bean;
	}
	if (bean instanceof Advised) {
		Advised advised = (Advised) bean;
		if (!advised.isFrozen() && isEligible(AopUtils.getTargetClass(bean))) {
			if (this.beforeExistingAdvisors) {
				advised.addAdvisor(0, this.advisor);
			}
			else {
				advised.addAdvisor(this.advisor);
			}
			return bean;
		}
	}
	// Check whether the Bean matches this post-processor's Advisor; create a proxy if it does.
	if (isEligible(bean, beanName)) {
		ProxyFactory proxyFactory = prepareProxyFactory(bean, beanName);
		if (!proxyFactory.isProxyTargetClass()) {
			evaluateProxyInterfaces(bean.getClass(), proxyFactory);
		}
	// Add the Advisor.
		proxyFactory.addAdvisor(this.advisor);
		customizeProxyFactory(proxyFactory);
	// Return the proxy.
		return proxyFactory.getProxy(getProxyClassLoader());
	}
	return bean;
}
```

### Intercepting @Async Methods

Calls to `@Async` methods are intercepted by `AnnotationAsyncExecutionInterceptor`. Its `invoke()` method wraps the annotated method in an async task and passes it to an executor.

The `invoke()` method is defined in `AnnotationAsyncExecutionInterceptor`'s parent class, `AsyncExecutionInterceptor`:

```JAVA
public class AsyncExecutionInterceptor extends AsyncExecutionAspectSupport implements MethodInterceptor, Ordered {
	@Override
	@Nullable
	public Object invoke(final MethodInvocation invocation) throws Throwable {
		Class<?> targetClass = (invocation.getThis() != null ? AopUtils.getTargetClass(invocation.getThis()) : null);
		Method specificMethod = ClassUtils.getMostSpecificMethod(invocation.getMethod(), targetClass);
		final Method userDeclaredMethod = BridgeMethodResolver.findBridgedMethod(specificMethod);

  // 1. Determine the executor for the async task.
		AsyncTaskExecutor executor = determineAsyncExecutor(userDeclaredMethod);

    // 2. Wrap the method call in a Callable async task.
		Callable<Object> task = () -> {
			try {
    // 2.1. Execute the method.
				Object result = invocation.proceed();
    // 2.2. If the method returns a Future, wait for its result.
				if (result instanceof Future) {
					return ((Future<?>) result).get();
				}
			}
			catch (ExecutionException ex) {
				handleError(ex.getCause(), userDeclaredMethod, invocation.getArguments());
			}
			catch (Throwable ex) {
				handleError(ex, userDeclaredMethod, invocation.getArguments());
			}
			return null;
		};
		// 3. Submit the task.
		return doSubmit(task, executor, invocation.getMethod().getReturnType());
	}
}
```

The `invoke()` method has three main steps:

1. Determine the executor for the async task.
2. Wrap the `@Async` method in a `Callable` task.
3. Submit the task to the executor.

#### 1. Get the Async Task Executor

The `determineAsyncExecutor()` method gets the async task executor (that is, the **thread pool**):

```JAVA
// Determine the async task executor.
protected AsyncTaskExecutor determineAsyncExecutor(Method method) {
 // 1. Check the cache first.
	AsyncTaskExecutor executor = this.executors.get(method);
	if (executor == null) {
		Executor targetExecutor;
  // 2. Get the executor qualifier.
		String qualifier = getExecutorQualifier(method);
		if (StringUtils.hasLength(qualifier)) {
   // 3. Get the executor that matches the qualifier.
			targetExecutor = findQualifiedExecutor(this.beanFactory, qualifier);
		}
		else {
   // 4. Without a qualifier, use the default executor: Spring's SimpleAsyncTaskExecutor.
			targetExecutor = this.defaultExecutor.get();
		}
		if (targetExecutor == null) {
			return null;
		}
  // 5. Wrap the executor in a TaskExecutorAdapter.
  // This Spring adapter wraps a JDK Executor. For now, it is enough to know it is an executor.
		executor = (targetExecutor instanceof AsyncListenableTaskExecutor ?
				(AsyncListenableTaskExecutor) targetExecutor : new TaskExecutorAdapter(targetExecutor));
		this.executors.put(method, executor);
	}
	return executor;
}
```

`determineAsyncExecutor()` selects the executor (thread pool) for the task. It gets the executor qualifier from the `value` of `@Async`, then looks up the matching executor in the `BeanFactory`.

If `@Async` does not specify a thread pool, `this.defaultExecutor.get()` retrieves the default executor. `defaultExecutor` is set by the following method:

```JAVA
// AsyncExecutionInterceptor
protected Executor getDefaultExecutor(@Nullable BeanFactory beanFactory) {
 // 1. Try to get an executor from the BeanFactory.
	Executor defaultExecutor = super.getDefaultExecutor(beanFactory);
 // 2. If none is registered, create a SimpleAsyncTaskExecutor.
	return (defaultExecutor != null ? defaultExecutor : new SimpleAsyncTaskExecutor());
}
```

`super.getDefaultExecutor()` tries to get an `Executor` bean from the `BeanFactory`:

```JAVA
protected Executor getDefaultExecutor(@Nullable BeanFactory beanFactory) {
	if (beanFactory != null) {
		try {
   // 1. Get a TaskExecutor from the BeanFactory.
			return beanFactory.getBean(TaskExecutor.class);
		}
		catch (NoUniqueBeanDefinitionException ex) {
			try {
				// 2. If there are several, try to get an Executor by its conventional bean name.
				return beanFactory.getBean(DEFAULT_TASK_EXECUTOR_BEAN_NAME, Executor.class);
			}
			catch (NoSuchBeanDefinitionException ex2) {
				if (logger.isInfoEnabled()) {
					// ...
				}
			}
		}
		catch (NoSuchBeanDefinitionException ex) {
			try {
    // 3. If none is found, try to get an Executor by its conventional bean name.
				return beanFactory.getBean(DEFAULT_TASK_EXECUTOR_BEAN_NAME, Executor.class);
			}
			catch (NoSuchBeanDefinitionException ex2) {
				// ...
			}
		}
	}
	return null;
}
```

If `getDefaultExecutor()` cannot find a thread pool in the `BeanFactory`, it creates a `SimpleAsyncTaskExecutor`.

This executor creates a new thread for every async task instead of reusing threads, which can make task execution expensive. A sudden increase in concurrent calls to an `@Async` method can create many threads, degrade service quality, or make the application unavailable.

If 10,000 tasks are submitted to `SimpleAsyncTaskExecutor` at once, it creates 10,000 threads. Its `execute()` method works as follows:

```JAVA
// SimpleAsyncTaskExecutor: execute() calls doExecute() internally.
protected void doExecute(Runnable task) {
    // Create a new thread.
    Thread thread = (this.threadFactory != null ? this.threadFactory.newThread(task) : createThread(task));
    thread.start();
}
```

**Recommendation: Configure your own thread pool when using `@Async` to avoid risks from Spring's default executor.**

The `value` in `@Async` specifies the thread pool qualifier, which is used to get a **custom thread pool**. The qualifier is retrieved as follows:

```JAVA
// AnnotationAsyncExecutionInterceptor
protected String getExecutorQualifier(Method method) {
 // 1. Get the Async annotation from the method.
	Async async = AnnotatedElementUtils.findMergedAnnotation(method, Async.class);
 // 2. If the method has no @Async annotation, check its declaring class.
	if (async == null) {
		async = AnnotatedElementUtils.findMergedAnnotation(method.getDeclaringClass(), Async.class);
	}
 // 3. Return the annotation's value as the thread pool qualifier.
 //    An empty value or no @Async annotation means the default executor is used.
	return (async != null ? async.value() : null);
}
```

#### 2. Wrap the Method in an Async Task

After `invoke()` gets the executor, it wraps the method in an async task:

```JAVA
// Wrap the method call in a Callable async task.
Callable<Object> task = () -> {
    try {
        // 2.1. Execute the intercepted method; in AOP, proceed() invokes the target method.
        Object result = invocation.proceed();

        // 2.2. The proxy returns the actual async Future to the caller. The target method,
        //     constrained by its signature, returns a temporary Future, so unwrap its result here.
        if (result instanceof Future) {
            return ((Future<?>) result).get(); // Block until the Future completes.
        }
    }
    catch (ExecutionException ex) {
        // 2.3. Handle ExecutionException, which is thrown by Future.get().
        handleError(ex.getCause(), userDeclaredMethod, invocation.getArguments()); // Handle the original exception.
    }
    catch (Throwable ex) {
        // 2.4. Handle other exceptions by passing the exception, method, and arguments to handleError().
        handleError(ex, userDeclaredMethod, invocation.getArguments());
    }
    // 2.5. Return null if the method does not return a Future or an exception occurs.
    return null;
};
```

Unlike `Runnable`, `Callable` can return a result and throw an exception.

Execution of `invocation.proceed()` (the original method) is wrapped in a `Callable` async task. Only a `Future` result is returned; other result types return `null`.

Therefore, an `@Async` method must return a `Future` to let the caller retrieve its result.

#### 3. Submit the Async Task

After `AsyncExecutionInterceptor#invoke()` wraps the method in a `Callable`, it submits the task to the executor. The following excerpt is from Spring Framework 5.3.x and includes `ListenableFuture` APIs that were later deprecated and removed:

```JAVA
protected Object doSubmit(Callable<Object> task, AsyncTaskExecutor executor, Class<?> returnType) {
    // Select an async execution strategy based on the method's return type.
    // 1. If the method returns CompletableFuture.
    if (CompletableFuture.class.isAssignableFrom(returnType)) {
        // Run the task asynchronously with CompletableFuture.supplyAsync().
        return CompletableFuture.supplyAsync(() -> {
            try {
                return task.call();
            }
            catch (Throwable ex) {
                throw new CompletionException(ex); // Wrap the exception so future.get() can throw it.
            }
        }, executor);
    }
    // 2. If the method returns ListenableFuture.
    else if (ListenableFuture.class.isAssignableFrom(returnType)) {
        // Cast AsyncTaskExecutor to AsyncListenableTaskExecutor and submit with submitListenable().
        // This executor returns a ListenableFuture, which supports callbacks when the task completes.
        return ((AsyncListenableTaskExecutor) executor).submitListenable(task);
    }
    // 3. If the method returns Future.
    else if (Future.class.isAssignableFrom(returnType)) {
        // Submit the task and return a Future.
        return executor.submit(task);
    }
    // 4. If the method returns void or another type.
    else {
        // Submit the task. No result is returned for a void method.
        executor.submit(task);
        return null;
    }
}
```

`doSubmit()` selects how to submit the task based on the return type of the `@Async` method. The executor (thread pool) then runs it.

### Summary

![Summary of @Async internals](./images/async/async.png)

To understand `@Async`, start with `@EnableAsync`, which enables async task execution.

As shown above, a post-processor creates a proxy. Calls to `@Async` methods pass through an interceptor in the `Advice`, which wraps each method call in an async task and submits it to a thread pool.

## Recommendations for Using @Async

### Configure a Custom Thread Pool

If no thread pool is configured, `@Async` first tries to get one from the `BeanFactory`. If none is found, it creates a `SimpleAsyncTaskExecutor`. This is not a true thread pool: it starts a new thread for each request instead of reusing existing threads, which can consume excessive resources.

For details on how the executor is selected, see [How Spring's Async Annotation Selects a Thread Pool](https://mp.weixin.qq.com/s/FySv5L0bCdrlb5MoSfQtAA) (Chinese).

Always configure a thread pool explicitly. `ThreadPoolTaskExecutor` is a good choice. You can also assign different thread pools to async methods based on their workloads and requirements.

```java
@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "executor1")
    public Executor executor1() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(3);
        executor.setMaxPoolSize(5);
        executor.setQueueCapacity(50);
        executor.setThreadNamePrefix("AsyncExecutor1-");
        executor.initialize();
        return executor;
    }

    @Bean(name = "executor2")
    public Executor executor2() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(4);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("AsyncExecutor2-");
        executor.initialize();
        return executor;
    }
}
```

Specify the thread pool Bean name in the `@Async` annotation:

```java
@Service
public class AsyncService {

    @Async("executor1")
    public void performTask1() {
        // Task 1 logic.
        System.out.println("Executing Task1 with Executor1");
    }

    @Async("executor2")
    public void performTask2() {
        // Task 2 logic.
        System.out.println("Executing Task2 with Executor2");
    }
}
```

### Avoiding Common @Async Pitfalls

The `@Async` annotation does not work in the following cases:

**1. Calling an async method from the same class**

Calling an `@Async` method from within the same class does not run it asynchronously.

```java
@Service
public class MyService {

    public void myMethod() {
        // Calling through this bypasses Spring's proxy, so async execution does not apply.
        asyncMethod();
    }

    @Async
    public void asyncMethod() {
        // Async logic.
    }
}
```

Spring implements async execution with **proxies**. A call from one method to another in the same class bypasses the proxy and invokes the method through `this`. Without the proxy, the task is not submitted to the thread pool.

To avoid this, move the async method to another Spring Bean.

```java
@Service
public class AsyncService {
    @Async
    public void asyncMethod() {
        // Async logic.
    }
}

@Service
public class MyService {
    @Autowired
    private AsyncService asyncService;

    public void myMethod() {
        asyncService.asyncMethod();
    }
}
```

**2. Declaring an async method as `static`**

An `@Async` method will not run asynchronously if it is declared `static`.

Spring implements async execution with proxies. A static method belongs to the class rather than an instance and is not inherited, so neither JDK dynamic proxies nor CGLIB can intercept it to add async behavior.

For more on proxies, see [Java Proxy Patterns Explained](https://javaguide.cn/java/basis/proxy.html).

To run the logic of a static method asynchronously, create a non-static wrapper method, annotate it with `@Async`, and call the static method from it.

```java
@Service
public class AsyncService {

    @Async
    public void asyncWrapper() {
        // Call the static method.
        SClass.staticMethod();
    }
}

public class SClass {
    public static void staticMethod() {
        // Perform operations.
    }
}
```

**3. Forgetting to enable async support**

Spring Boot does not enable async support by default. Add `@EnableAsync` to the main `Application` configuration class to enable it.

```java
@SpringBootApplication
@EnableAsync
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

**4. The class with an `@Async` method must be a Spring Bean**

An `@Async` method must be in a Spring-managed Bean so Spring can apply a proxy when creating it. The proxy intercepts method calls and runs them asynchronously. If the method is not in a Spring-managed Bean, Spring cannot create the required proxy and `@Async` has no effect.

### Return Types

Use `void` or `Future` as the return type of an `@Async` method.

- If the caller does not need a result, use `void`.
- If the caller needs a result, use `Future` (usually `CompletableFuture`). `ListenableFuture` is an older Spring API and should not be used with Spring 6.1 or later.

If an `@Async` method returns another type, such as `Object` or `String`, the caller cannot get its result.

This follows a basic principle of async programming: callers should not expect an immediate result, but should be able to retrieve it later. With a `Future`, the caller can check the task's status, cancel it, or get its result when it completes.

### Handling Exceptions in Async Methods

Exceptions thrown by an async method are not caught directly by the calling thread. Methods that return `Future` or `CompletableFuture` expose exceptions through the Future; handle them with `get()`, `join()`, or `CompletableFuture`'s exception-handling methods. A `void` async method cannot pass exceptions to the caller, so configure a global `AsyncUncaughtExceptionHandler`.

```java
@Configuration
@EnableAsync
public class AsyncConfig implements AsyncConfigurer{

    @Override
    public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
        return new CustomAsyncExceptionHandler();
    }

}

// Custom exception handler.
class CustomAsyncExceptionHandler implements AsyncUncaughtExceptionHandler {

    @Override
    public void handleUncaughtException(Throwable ex, Method method, Object... params) {
        // Log the exception or handle it another way.
    }
}
```

### Transaction Management

If an `@Async` method needs a transaction, configure the transaction on that async method itself.

```java
@Service
public class AsyncTransactionalService {

    @Async
    // Propagation.REQUIRES_NEW starts a new transaction for the async method, independent of the current transaction.
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void asyncTransactionalMethod() {
        // These operations run in the new transaction.
        // Perform database operations here.
    }
}
```

### Ordering Async Methods

Methods annotated with `@Async` are non-blocking and may complete in any order. To process results in a specific order, return a `Future` or `CompletableFuture` and use it to run one method after another completes.

```java
@Async
public CompletableFuture<String> fetchDataAsync() {
    return CompletableFuture.completedFuture("Data");
}

@Async
public CompletableFuture<String> processDataAsync(String data) {
    // @Async already schedules this method on a Spring-managed executor; do not submit it to the common pool again.
    return CompletableFuture.completedFuture("Processed " + data);
}
```

Run `processDataAsync` after `fetchDataAsync` completes:

```java
CompletableFuture<String> dataFuture = asyncService.fetchDataAsync();
dataFuture.thenCompose(data -> asyncService.processDataAsync(data))
          .thenAccept(result -> System.out.println(result));
```

##
