## React fiber算法原理 相比之前的stack算法有什么优化

`fiber`是React16的新特性，是对之前`diff`算法的重写，主要是把一次计算，改变为多次计算，在浏览器有高级任务时，暂停计算。`fiber`的问世就是为了解决之前大量计算导致浏览器掉帧的现象。

相对于之前`stack`，源码上核心的变化就是讲原先递归改为循环。

旧版`stack`算法是一条路走到黑，运作的过程是不能被打断的，通过递归的方式进行渲染，使用的是JS引擎自身的函数调用栈，它会一直执行到栈空为止，犹豫JS是单线程的，所以大量计算会导致主线程长时间被占用。

新版`fiber`实现了自己的调用栈，它以链表的形式遍历组件树，可以灵活的暂停、继续和丢弃执行的任务。实现方式是使用了浏览器的`requestIdleCallback`这一 API，在主线程空闲时计算。

为了达到这种效果，就需要有一个调度器 (Scheduler) 来进行任务分配。任务的优先级有六种：

    - synchronous，与之前的Stack Reconciler操作一样，同步执行
    - task，在next tick之前执行
    - animation，下一帧之前执行    
    - high，在不久的将来立即执行
    - low，稍微延迟执行也没关系
    - offscreen，下一次render时或scroll时才执行

优先级高的任务（如键盘输入）可以打断优先级低的任务（如Diff）的执行，从而更快的生效

 `fiber`实际上是一种数据结构，用`js`对象表示就是：

```
const fiber = {
    stateNode,    // 节点实例    
    child,        // 子节点
    sibling,      // 兄弟节点
    return,       // 父节点
}
```

Fiber Reconciler 在执行过程中，会分为 2 个阶段。

    - 阶段一，生成`Fiber tree`，得出需要更新的节点信息。这一步是一个渐进的过程，可以被打断。
    - 阶段二，将需要更新的节点一次过批量更新，这个过程不能被打断。

阶段一可被打断的特性，让优先级更高的任务先执行，从框架层面大大降低了页面掉帧的概率。

### 总结

旧版React在一些响应体验要求较高的场景不适用，比如动画，布局和手势。
根本原因是渲染/更新过程一旦开始无法中断，持续占用主线程，主线程忙于执行JS，无暇他顾（布局、动画），造成掉帧、延迟响应（甚至无响应）等不佳体验。`Fiber`就是用来解决这类问题的，把渲染/更新过程拆分为小块任务，通过合理的调度机制来控制时间，更细粒度、更强的控制力。
