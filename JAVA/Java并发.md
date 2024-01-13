# 并发编程
## 并发编程基础

### 为什么要使用并发编程

**目的是为了提升****多线程****的利用率：**一般一个电脑会有多个CPU核心，我们可以去创建多个线程，**理论上讲****操作系统****会将多个线程分配给不同的CPU核心去执行**，每一个CPU执行一个线程，这样就大大提高了CPU的使用效率，如果使用单线程的情况下只会有一个CPU核心被使用。

**案例**：比如我们在网上购物，为了提升响应速度，需要拆分，减库存，生成订单等操作，就可以利用多线程的技术对其进行拆分，面对复杂的业务模型，并行程序明显比串行程序更适应业务需求。

### 并发编程有什么缺点

可能会遇到很多问题：比如内存泄漏，上下文切换，线程安全，死锁。

上下文切换通常发生在多线程环境下，当操作系统决定将当前线程切换到另一个线程时。这可能会导致性能下降。

### 并发出问题的根源是什么？

- 线程切换带来的原子性问题 解决办法：使用多线程之间同步synchronized或使用锁（lock）
- 缓存导致带来的可见性问题 解决办法：synchronized、volatile、LOCK都可以解决可见性问题
- 编译优化带来的有序性问题 解决办法：Happens-Before规则可以解决有序性问题。

 happen-before规则：

1. 程序顺序规则： 在一个线程中，按照程序代码的顺序执行的操作，前一个操作的结果对后一个操作是可见的。
2. 锁定规则： 一个解锁操作happens-before于后续对同一个锁的加锁操作。这意味着在释放锁之前的所有操作都对获取锁的其他线程可见。
3. volatile变量规则： 对一个volatile变量的写操作happens-before于后续对这个变量的读操作。这确保了对volatile变量的写入对于其他线程是立即可见的。
4. 传递性规则： 如果操作A happens-before于B，且B happens-before于C，那么A happens-before于C。这通过链式的happens-before关系建立了顺序性。
5. start规则： 线程的启动操作happens-before于该线程的任何操作。
6. join规则： 线程的所有操作happens-before于其他线程调用该线程的join方法。
7. 线程中断规则： 对线程interrupt方法的调用happens-before于被中断线程的代码检测到中断事件的发生。

## JMM内存模型

### 理解线程之间的通信和同步

并发编程主要就是在处理两个问题，就是线程之间的**通信**和线程之间的**同步**。

通信是指线程之间应该如何交换信息，主要有两种机制：共享内存和消息传递。共享内存通信指线程A和B有共享的公共数据区，线程A写数据，线程B读数据，这样就完成了一次隐式通信。而消息传递通信是指线程之间没有公共数据，需要线程间显示的直接发送消息来进行通信。java主要采用的是第一种共享内存的方式，所以线程之间的通信对于开发人员来说都是隐式的，如果不理解这套工作机制，可能会碰到各种奇奇怪怪的内存可见性问题。

同步是指一种用来控制不同的线程之间操作发生相对顺序的机制。同步需要程序员显式的定义，主要是指定一个方法或者一段代码需要线程之间互斥执行。（java提供了很多用来做同步的工具，比如

Synchronized,Lock等)

### Java内存模型的抽象结构

java的内存模型，规定是把所有的共享变量存储到一个主内存中，当处于一个多线程的环境下， 每个线程要去对变量进行操作的时候，必须在工作内存中进行，首先是要将主内存中的变量拷贝一份到工作内存中，然后对这个变量进行操作，操作成功之后再刷新会主内存中，

![img](https://gvhh8pww7cu.feishu.cn/space/api/box/stream/download/asynccode/?code=YzVkNmUzNTNiYjhhZGFjOTVhMzNlN2U2MTE3MDJjNmFfak9GZ1R1a284SUpuenFNcElrdURZT3NTbWttU3Y5c2xfVG9rZW46S25VMWJvdEVYb2UxRkN4NkZOT2NiMEJvbmdoXzE3MDUxNDE0OTE6MTcwNTE0NTA5MV9WNA)

**例子：线程A和线程B之间的通信**

假设最开始的时候有一个共享变量x，并且为0，线程A在执行时，把更新后的值临时放在自己的本地内存A中，当线程A和线程B之间需要通信的时候，线程A首先会把自己本地内存中的值**刷新回主内存**，值变为1，随后线程B到主内存中去读取线程A更新后的x的值，此时线程B的本地内存的值也为1了。

JMM可能会带来的一些问题，可见性问题，原子性问题，有序性

### 重排序

在程序执行时，**为了提高性能**，编译器和处理器常常会对指令做重排序。主要有三种：编译器优化的重排序，指令级并行重排序，内存系统重排序。

![img](https://gvhh8pww7cu.feishu.cn/space/api/box/stream/download/asynccode/?code=NWU5Yzc5MjViZjFjNDBiODY3ZjA0MDQ2NzQwZjZiYzJfNmRUTExITk1mUXFnT2tIT1FCUmJEck9QbUlFOFViaVlfVG9rZW46TThRUGJjandpb0dYelh4SHJTVGNxUzdibjdiXzE3MDUxNDE0OTE6MTcwNTE0NTA5MV9WNA)

上述的1属于编译器重排序，2和3属于处理器重排序。这些重排序都可能导致**多线程****出现****内存****可见性问题**（比如读取数据的前置和后置问题）。**对于编译器**，JMM的编译器重排序规则会禁止特定类型的编译器重排序（不是所有的编译器重排序都要禁止）。**对于处理器重排序**，JMM的处理器重排序规则则会要求java编译器在生成指令序列时，插入特定类型的内存屏障指令（volatile），通过内存屏障指令来禁止特定类型的处理器重排序（不是所有的处理器重排序都要禁止）

### Volatile

作用

- 能够保证可见性和有序性
- 不能保证原子性
- 可以禁止指令重排

#### 可见性

1. 当写一个volatile变量的时候，JMM会把该线程对应本地内存中的共享变量值刷新到主内存。
2. 当读一个volatile变量的时候：JMM会把该线程对应的本地内存置为无效，线程接下来将从主内存中读取共享变量

#### 原子性

本身volatile是不能保证原子性的

原因：++操作并不是一个操作

- 读取操作：读取变量的当前值
- 增加操作：对读取的值进行增加
- 写回操作：将增加后的值写回到变量

如果是在多线程的情况下，可能产生相互竞争的操作，所以不是原子的。

**解决办法**：将这个交给AtomicInteger 保管。

案例编写

```Java
package com.sdy.juc;
import java.util.concurrent.atomic.AtomicInteger;
public class VolatileApply {
    public static void main(String[] args) {
        runNumber();
    }
    private static void runNumber() {
        MyData myData = new MyData();
        for (int i = 0; i < 20; i++) {
            new Thread(()->{
                for (int j = 0; j < 1000; j++) {
//                   myData.addPlusPlus();
                   myData.atomicPlus();
                }
            }).start();
        }
        //这一步一定要记得，保证20个线程都执行完成
        while(Thread.activeCount()>2){
            Thread.yield();
        }
        System.out.println(myData.number);
        System.out.println(myData.atomicInteger);
    }
}
class MyData{
    volatile int number =0;
    AtomicInteger atomicInteger = new AtomicInteger(number);
    public int getNumber() {
        return number;
    }
    public void setNumber(int number) {
        this.number = number;
    }
    public  void addPlusPlus(){
        number++;
    }
    public void atomicPlus(){
        atomicInteger.incrementAndGet();
    }
}
```

#### 有序性

计算机在执⾏程序时，为了提⾼性能，编译器和处理器常常会对指令做重排，⼀般分以下三种：

![img](https://gvhh8pww7cu.feishu.cn/space/api/box/stream/download/asynccode/?code=YTRjZGJlODcxNWMzNmRjZTc5MjQ0MTU1NmY2N2NjMWFfSnoydzdwNE1hNEtaNTNEN1lXYzBQMDduQ3pBSUdkZk9fVG9rZW46R0h1V2JTY1YzbzlyYk54ZXhGTWNrWHlobnRmXzE3MDUxNDE0OTE6MTcwNTE0NTA5MV9WNA)

**为什么要出现指令重排**

所谓指令重排序，就是出于优化考虑，CPU执⾏指令的顺序跟程序员⾃⼰编写的顺序不⼀致。就好⽐⼀

份试卷，题号是⽼师规定的，是程序员规定的，但是考⽣（CPU）可以先做选择，也可以先做填空。

**小的demo**

```Java
package com.sdy.juc;
public class ResortSeqDemo {
    int a = 0;
    volatile boolean flag = false;
    /*
    多线程下flag=true可能先执⾏，还没⾛到a=1就被挂起。
    其它线程进⼊method02的判断，修改a的值=5，⽽不是6。
    
/
    public void method01() {
        a = 1;
        //code2
        flag = true;
        /
        * 多线程下flag=true可能先执⾏，还没⾛到a=1就被挂起。
        其它线程进⼊method02的判断，修改a的值=5，⽽不是6。
        **/
        //code1
        //code3
    }
    public void method02() {
        if (flag) {
            a += 5;
            System.out.println("*****最终值a: " + a);
        }
    }
    public static void main(String[] args) {
        ResortSeqDemo resortSeq = new ResortSeqDemo();
        new Thread(() -> {
            resortSeq.method01();
        }, "ThreadA").start();
        new Thread(() -> {
            resortSeq.method02();
        }, "ThreadB").start();
    }
}
```

**为什么volatile 可实现禁⽌指令重排优化，从⽽避免多线程环境下程序出现乱序执⾏的现象？说说它的原理**

内存屏障：

- 一个是保证特定操作的顺序性
- 二是保证变量的可见性

我认为会出现两种情况

1. 通过volatile修饰的变量进行写操作，添加的屏障是StoreStore屏障，和StoreLoad屏障

![img](https://gvhh8pww7cu.feishu.cn/space/api/box/stream/download/asynccode/?code=ZDExM2M4NzRmYThjMjQ5NDAzMzU3M2QyZDFmNjNhNTVfQktFNGVCQldTbXBkWW1kbHlXSktzc2VsVlNSNXZlekNfVG9rZW46RUtlcGJYMzAzb25UQTF4cVhGWWMzYmxKbnRjXzE3MDUxNDE0OTE6MTcwNTE0NTA5MV9WNA)

1. 通过volatile修饰的变量进行读操作，添加的屏障是LoadLoad屏障，和LoadStore屏障

![img](https://gvhh8pww7cu.feishu.cn/space/api/box/stream/download/asynccode/?code=YjM4MDRiMGM3MmM0ZTZmZTNiNTMyZmM3OTFjNGU1M2VfOUJIa3NXUUlvYlZ2cU0yaHVWcmZTYnhNSVowem1udWRfVG9rZW46WTlBbGJubTdQb2x2SEx4NVpTcWNNRGF4bktmXzE3MDUxNDE0OTE6MTcwNTE0NTA5MV9WNA)

如果在指令间插⼊⼀条Memory Barrier则会告诉编译器和CPU，不管什么指令都不能和这条Memory Barrier指令重排序，也就是说通过插⼊内存屏障可以禁⽌在内存屏障前后的指令进⾏重排序优化。

内存屏障另外⼀个作⽤是强制刷出各种CPU的缓存数据，因此任何CPU上的线程都能读到这些数据的最新版本。

##### 应用

单例模式的安全问题

即使是通过了双重检查锁的方式进行一个编写，也会出现多线程安全的问题，问题的来源

**分析**

最主要的问题是会出现在instance=new Singleton（）；的这行代码，看似一行代码，其实是三行代码

源代码

```Java
instance = new SingletonDemo();
public static thread.SingletonDemo getInstance();
 Code:
 0: getstatic #11 // Field instance:Lthread/SingletonDemo;
 3: ifnonnull 37
 6: ldc #12 // class thread/SingletonDemo
 8: dup
 9: astore_0
 10: monitorenter
 11: getstatic #11 // Field instance:Lthread/SingletonDemo;
 14: ifnonnull 27
 17: new #12 // class thread/SingletonDemo 步骤1
 20: dup
 21: invokespecial #13 // Method "<init>":()V 步骤2
 24: putstatic #11 // Field instance:Lthread/SingletonDemo;步骤3
 
底层Java Native Interface中的C语⾔代码内容，开辟空间的步骤
memory = allocate(); //步骤1.分配对象内存空间
instance(memory); //步骤2.初始化对象
instance = memory; //步骤3.设置instance指向刚分配的内存地址，此时instance
!= null
```

通过对于源代码的观察发现，如果说发生了指令重排，那么

1. 此时内存已经分配了，那么instance=memory不为null
2. 碰巧，若遇到线程此时挂起，那么instace（memory）还未执行，对象还未初始化
3. 导致了instace≠null，所以两次判断都跳过了，最后返回的instace没有任何的内容，还未初始化。

**解决办法：**对这个单例对象添加上volatile关键字，禁止指令重排。

## Java并发线程基础

### 什么是进程和线程？

从**操作系统**层面理解：

- 进程就是运行着的程序，它是程序在操作系统的一次执行过程，是一个程序的动态概念，进程是操作系统**分配**资源的基本单位
- 线程可以理解为一个进程的执行实体，它是比进程力度更小的执行单元，也是真正运行在cpu上的执行单元，线程是操作系统**调度**资源的基本单位

进程中可以包含多个线程，需要记住进程和线程一个是操作系统**分配**资源的基本单位（进程），一个是操作系统**调度**资源的基本单位（线程）

**从Java程序理解：**

- 启动一个Java程序，操作系统就会创建一个Java进程
- 在一个进程里可以创建多个线程，所以在一个Java程序里，可以自定义创建多个线程，这些线程拥有各自独立的计数器，堆栈和局部变量等属性，并且能够访问共享的内存变量。

### 线程优先级

操作系统基本使用**时间分片**的形式来分配处理器资源给线程运行，一个线程如果用完了一个时间片就会发生线程调度，即便线程还没有执行完毕也需要**等待**下一次分配。所以线程能获得越多的时间片分配，也就能更多的使用处理器资源，而**优先级**就是一个可以指定线程应该多分还是少分时间片的属性。

Java线程可以通过setPriority()方法来设置优先级，默认是5，可以设置的范围是1-10。针对频繁阻塞（IO操作较多）的线程应该设置高优先级，而计算较多，耗CPU的线程应该设置为更低。

### 线程状态

**线程状态变迁：**

![img](https://gvhh8pww7cu.feishu.cn/space/api/box/stream/download/asynccode/?code=MzYxZTU1MWExZWUxMjY0MjE5ZDQ4Y2ZhMGIzMWI4MGFfS3RKWkwwQXdCcU5BT2xscVZKVkNON1JDNDFCM3ZmQUVfVG9rZW46RDNSVmJLOWpnb1lyN1d4Q0xSc2NvTW1ibjV6XzE3MDUxNDE0OTE6MTcwNTE0NTA5MV9WNA)

1. **NEW**：初始状态，线程被创建，但是还没有调用start（）方法。
2. **RUNNABLE**：运行状态，Java线程将操作系统中的就绪和运行状态笼统地称作为“运行中”。
3. **BLOCKED**：阻塞状态，表示线程阻塞于锁。
4. **WAITING**：等待状态，表示线程进入等待状态，进入该状态表示当前线程需要等待其他线程做出一些等待操作（wait，join方法）
5. **TIME_WAITING**：超时等待状态，该状态不同于WAITING状态，它可以在指定的时间自行返回。（Thread.sleep())
6. **TERMINATED**：终止状态，表示当前线程已经执行完毕。

> 阻塞状态**BLOCKED**是线程阻塞在进入synchronized关键字修饰的方法或代码块时的状态吗，但是如果是阻塞在java.concurrent包中的**Lock**接口的线程状态却是等待状态**WAITING**，因为Lock接口的阻塞实现均使用的是LockSupport类中的相关方法。

### 线程的构造方式

#### 线程常用的使用方法

- 实现Runable接口
- 实现Callable接口
- 继承Thread类

##### 实现Callable接口：

与Runable相比，Callable可以有返回值，通过FutureTask进行封装。

```Java

```

## CAS

通过volatile无法解决原子性问题，但是通过AtomicInteger就可以解决原子性问题

**核心思想**：比较并交换，通过判断主内存某个位置的值是否跟预期的值一样，相同就进行修改，否则一直重试，直到一致为止。这个过程是原子的。

CAS并发原语体现在JAVA语⾔中就是sum.misc.Unsafe类中的各个⽅法。看⽅法源码，调⽤UnSafe类中

的CAS⽅法，JVM会帮我们实现出CAS汇编指令。这是⼀种完全依赖于硬件的功能，通过它实现了原⼦操

作。再次强调，由于CAS是⼀种系统原语，原语属于操作系统⽤语范畴，是由若⼲条指令组成的，⽤于

完成某个功能的⼀个过程，并且原语的执⾏执⾏是连续的，在执⾏过程中不允许被中断，也就是说CAS

是⼀条CPU的原⼦指令，不会造成所谓的数据不⼀致问题

![img](https://gvhh8pww7cu.feishu.cn/space/api/box/stream/download/asynccode/?code=MDNiOWMxYThkYWE1YWEwNDAzZjNiMWEzYjhhODIxMGZfZ3p5ZExFWHVLenMwSURORlEzV1RRWUhXWTNocmwwV3BfVG9rZW46WEc3MWJsU0k1b05IZUh4RDNpdWNwdUNDbm1jXzE3MDUxNDE0OTE6MTcwNTE0NTA5MV9WNA)

### CAS底层原理

![img](https://gvhh8pww7cu.feishu.cn/space/api/box/stream/download/asynccode/?code=OWZiYzMzZTQ2OGJiMjc0NmI5ZGYzOWVjMzk1NGIyZWJfTzB3M0xnM0ZNeTlPbFh6QWFTQWZjRUlQMUhjVldxMWlfVG9rZW46T2loS2JSUEhrbzFReDh4alcyMGNNdUNWbkplXzE3MDUxNDE0OTE6MTcwNTE0NTA5MV9WNA)

想要理解底层原理就要了解底层的源码，先来看看几个重要的参数

1. Unsafe

> 是CAS的核⼼类，由于Java⽅法⽆法直接访问底层系统，需要通过本地（native）⽅法来访问，Unsafe相当于⼀个后⾯，基于该类可以直接操作特定内存的数据。Unsafe类存在于sum.misc包中，其内部⽅法操作可以像C的指针⼀样直接操作内存，因为Java中CAS操作的执⾏依赖于Unsafe类的⽅法。注意Unsafe类中的所有⽅法都是native修饰的，也就是说Unsafe类中的⽅法都直接调⽤操作系统底层资源执⾏相应任务

1. 变量valueOffset，

> 表示该变量值在内存中的偏移地址，因为Unsafe就是根据内存偏移地址获取数据的。

1. 变量value⽤volatile修饰，保证了多线程之间的内存可⻅性。

> AtomicInteger.getAndIncrement() 调⽤了 Unsafe.getAndAddInt() ⽅法。 Unsafe 类的⼤部分⽅法都是 native 的，⽤来像C语⾔⼀样从底层操作内存。

再来看看c的底层源码

C语句代码JNI，对应java⽅法 public final native boolean compareAndSwapInt(Object var1,

long var2, int var4, int var5)

```C++
UNSAFE_ENTRY(jboolean, Unsafe_CompareAndSwapInt(JNIEnv 
env, jobject
unsafe, jlong obj, jlong offset,jint e, jint x))
 UnsafeWrapper("Unsafe_CompareAndSwapInt");
 oop p = JNIHandles::resolve(obj);
* jint*
 add = (jint *)index_oop_from_field_offset_long(p, offset);
 return (jint)(Atomic::cmpxchg(x,addr,e))==e;
UNSAFE_END
//先想办法拿到变量value在内存中的地址addr。
//通过Atomic::cmpxchg实现⽐较替换，其中参数x是即将更新的值，参数e是原内存的值。
```

这个⽅法的var1和var2，就是根据对象和偏移量得到在主内存的快照值var5。然

后 compareAndSwapInt ⽅法通过var1和var2得到当前主内存的实际值。如果这个实际值跟快照值相

等，那么就更新主内存的值为var5+var4。如果不等，那么就⼀直循环，⼀直获取快照，⼀直对⽐，直

到实际值和快照值相等为⽌。

**举一个例子**

⽐如有A、B两个线程，⼀开始都从主内存中拷⻉了原值为3，A线程执⾏

到 var5=this.getIntVolatile ，即var5=3。此时A线程挂起，B修改原值为4，B线程执⾏完毕，由于

加了volatile，所以这个修改是⽴即可⻅的。A线程被唤醒，执⾏ this.compareAndSwapInt() ⽅法，

发现这个时候主内存的值不等于快照值3，所以继续循环，重新从主内存获取。

![img](https://gvhh8pww7cu.feishu.cn/space/api/box/stream/download/asynccode/?code=MzMxM2UxODYxOTAyOTdhNDQxMzFjYmQyYjk1NmQyOTdfZXdjR3F2a3JOaEdUbWdpbW9hMXlTWlI4eEFCZWo5VldfVG9rZW46R2dsUGJ0aDY4b0tuaEd4OTJ1dmNBdml4bk1iXzE3MDUxNDE0OTE6MTcwNTE0NTA5MV9WNA)

### CAS缺点

![img](https://gvhh8pww7cu.feishu.cn/space/api/box/stream/download/asynccode/?code=NmI1NzE0MzkyNzM4MzYwODQ4YTJhZTI4MjRkNGY0MmJfd29rSmZuOUJRWlFCbWNZbGFTZDRlWXpLMzhyYkNrSkpfVG9rZW46TGZlUGJFRWt5b0cxa0l4UVVMdmNPa0xFbmpnXzE3MDUxNDE0OTE6MTcwNTE0NTA5MV9WNA)

CAS实际上是⼀种⾃旋锁，

1. ⼀直循环，开销⽐较⼤。我们可以看到getAndAddInt⽅法执⾏时，有个do while，如果CAS失

败，会⼀直进⾏尝试。如果CAS⻓时间⼀直不成功，可能会给CPU带来很⼤的开销。

1. 对⼀个共享变量执⾏操作时，我们可以使⽤循环CAS的⽅式来保证原⼦操作，但是，对多个共享变

量操作时，循环CAS就⽆法保证操作的原⼦性，这个时候就可以⽤锁来保证原⼦性。

1. 引出了ABA问题

### ABA问题

所谓ABA问题，就是CAS算法实现需要取出内存中某时刻的数据并在当下时刻⽐较并替换，这⾥存在⼀

个时间差，那么这个时间差可能带来意想不到的问题。

**⽐如，⼀个线程B 从****内存****位置Value中取出2，这时候另⼀个线程A 也从内存位置Value中取出2，并且**

**线程A 进⾏了⼀些操作将值变成了5，然后线程A ⼜再次将值变成了2，这时候线程B 进⾏CAS操作发现**

**内存中仍然是2，然后线程B 操作成功。**

> 尽管线程B 的CAS操作成功，但是不代表这个过程就是没有问题的。
>
> 有这样的需求，比如CAS，只要头尾一致，就可以接收 
>
> 但是有的需求，还看重过程，中间不能发生任何修改，这里就引出了原子引用

#### AtomicReference原⼦引⽤

避免要对比的是一个对象

```Java
public class AtomicReferenceDemo {
   public static void main(String[] args) {
   User user1 = new User("Jack",25);
   User user2 = new User("Tom",21);
   AtomicReference<User> atomicReference = new AtomicReference<>();
   atomicReference.set(user1);
  System.out.println(atomicReference.compareAndSet(user1,user2)+"\t"+atomic
  Reference.get()); // true
  System.out.println(atomicReference.compareAndSet(user1,user2)+"\t"+atomic
  Reference.get()); //false
  }
}
```

#### ABA问题的解决

使⽤ AtomicStampedReference 类可以解决ABA问题。这个类维护了⼀个“版本号”Stamp，在进⾏CAS

操作的时候，不仅要⽐较当前值，还要⽐较版本号。只有两者都相等，才执⾏更新操作。

**关键方法的说明**

compareAndSet

V expectedReference, 预期值引⽤ V newReference, 新值引⽤ int expectedStamp， 预期值时间戳 int newStamp, 新值时间戳

解决方案代码

```Java
package com.sdy.juc;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicStampedReference;
public class ABADemo {
    public static void main(String[] args) {
        AtomicStampedReference atomicStampedReference = new AtomicStampedReference(100,1);
        new Thread(()->{
            int stamp = atomicStampedReference.getStamp();
            System.out.println("ThreadA===第⼀次获取的版本号===="+ stamp);
            System.out.println("ThreadA===第⼀次获取的数据===="+atomicStampedReference.getReference());
            //TODO,休息4s让线程B执行完
            try { TimeUnit.SECONDS.sleep(4); } catch
            (InterruptedException e) { e.printStackTrace(); }
            boolean b = atomicStampedReference.compareAndSet(100, 2000, stamp, stamp + 1);
            System.out.println("===对比结果==="+b);
            System.out.println("ThreadA===第二次获取的版本号===="+atomicStampedReference.getReference());
            System.out.println("ThreadA===第二次获取的版本号===="+atomicStampedReference.getStamp());
        },"ThreadA").start();
        new Thread(()->{
            int stamp = atomicStampedReference.getStamp();
            System.out.println("ThreadB===第⼀次获取的版本号===="+ stamp);
            System.out.println("ThreadB===第⼀次获取的数据===="+atomicStampedReference.getReference());
            atomicStampedReference.compareAndSet(100,111,stamp,stamp+1);
            try { TimeUnit.SECONDS.sleep(1); } catch
            (InterruptedException e) { e.printStackTrace(); }
            System.out.println("ThreadB===第二次获取的版本号===="+ atomicStampedReference.getStamp());
            System.out.println("ThreadB===第二次获取的数据===="+atomicStampedReference.getReference());
            atomicStampedReference.compareAndSet(111,100,atomicStampedReference.getStamp(),atomicStampedReference.getStamp()+1);
            try { TimeUnit.SECONDS.sleep(1); } catch
            (InterruptedException e) { e.printStackTrace(); }
            System.out.println("ThreadB===第三次获取的版本号===="+ atomicStampedReference.getStamp());
            System.out.println("ThreadB===第三次获取的数据===="+atomicStampedReference.getReference());
        },"ThreadB").start();
    }
}
```

## 集合类不安全问题

### ArrayList和CopyOnWriteArrayList

底层原理

这是JUC的类，通过写时复制来实现读写分离。⽐如其 **add() **⽅法，就是先复制⼀个新数组，⻓度为原

数组⻓度+1，然后将新数组最后⼀个元素设为添加的元素。

往⼀个容器添加元素的时候，不直接往当前容器Object[]添加，⽽是现将当前容器Object[]进Copy，复制出⼀个新的容器Object[] newElements，然后新的容器Object[] newElements⾥添加元素，添加完元素之后，再将原容器的引⽤指向新的容器setArray(newElements);。这样做的好处是可以对CopyOnWrite容器进⾏并发的读，⽽不需要加锁，因为当前容器不会添加任何元素。所以CopyOnWrite容器也是⼀种读写分离的思想，读和写不同的容器

底层add方法的源码

```Java
public boolean add(E e) {
   final ReentrantLock lock = this.lock;
   lock.lock();
   try {
     //得到旧数组
     Object[] elements = getArray();
     int len = elements.length;
     //复制新数组
     Object[] newElements = Arrays.copyOf(elements, len + 1);
     //设置新元素
     newElements[len] = e;
     //设置新数组
     setArray(newElements);
     return true;
   } finally {
     lock.unlock();
   }
}
```

案例

```Java
package com.sdy.juc;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CopyOnWriteArrayList;
public class CopyOnWriteArrayListDeo {
    public static void main(String[] args) {
        List<String> list = new CopyOnWriteArrayList<>();
        for (int i = 1; i <= 10; i++) {
            new Thread(()->{
                list.add(UUID.randomUUID().toString().substring(0,8));
                System.out.println(Thread.currentThread().getName() +"\t" + list);
            }, String.valueOf(i)).start();
        }
    }
}
```

### Set和CopyOnWriteArraySet

通过观察HashSet源码查看，Hashmap底层是用HashMap实现的，既然是HashMap实现的，那HashMap.put()需要上传两个参数，**而hashset的添加只需要要上传一个参数**，为什么呢？实际上是因为value被写死了，是一个private static final Object对象。

底层原理：

底层维护了一个CopyOnWriteArrayList数组

```Java
private final CopyOnWriteArrayList<E> al;
public CopyOnWriteArraySet() {
   al = new CopyOnWriteArrayList<E>();
}
```

demo

```Java
private static void setNoSafe() {
   Set<String> set = new CopyOnWriteArraySet<>();
   for (int i = 1; i <= 30; i++) {
     new Thread(()->{
     set.add(UUID.randomUUID().toString().substring(0,8));
     System.out.println(Thread.currentThread().getName() +"\t" + set);
     }, String.valueOf(i)).start();
   }
}
```

### Map和ConcurrentHashMap

底层原理

看集合那节

demo

```Java
private static void mapNotSafe() {
   // Map<String, String> map = new HashMap<>();
   Map<String, String> map = new ConcurrentHashMap<>();
   for (int i = 1; i <= 30; i++) {
     new Thread(()->{
     map.put(Thread.currentThread().getName()
    ,UUID.randomUUID().toString().substring(0,8));
     System.out.println(Thread.currentThread().getName() +"\t" +map);
     }, String.valueOf(i)).start();
   }
}
```

## **Synchronized**

### 关键字的使用

1. 对于普通的同步方法，锁是**当前实例对象**
2. 对于同步方法块，锁是Synchronized括号里面**指定的对象**（指定的对象也可以用this，即指定当前实例对象）
3. 对于静态同步方法，锁是当前类的Class对象

示例：

**示例1**：对于普通同步方法，锁是**当前实例对象**。

```Java
package org.example;

public class SynchronizedObject implements Runnable{
    @Override
    public void run() {
        method();
    }


    public synchronized void method(){
        System.out.println(Thread.currentThread().getName()+"开始");
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
        System.out.println(Thread.currentThread().getName()+"结束");
    }

    public static void main(String[] args) {
        SynchronizedObject instance = new SynchronizedObject();
        Thread thread1 = new Thread(instance);
        Thread thread2 = new Thread(instance);
        thread1.start();
        thread2.start();
    }
}
```

结果：

![img](https://gvhh8pww7cu.feishu.cn/space/api/box/stream/download/asynccode/?code=N2UzMGFhYTQxZjliODdkNDA1ODUwYjgwOGQ0NzVhYjlfOVNHNkd0WGc5ejRCTTBVdlFTaGF2cXBMWGZHb1BrVnNfVG9rZW46R3hva2JjdlB1b0FUdGd4ZlB0bGNzdmc2bkJkXzE3MDUxNDE0OTE6MTcwNTE0NTA5MV9WNA)

说明：

- synchronized定义普通同步方法，默认锁的是当前实例对象，即instance。
- 而两个线程t1和t2使用的是同一个instace，所以线程会在此处竞争锁，竞争成功的线程运行成功之后下一个线程才会执行。

**示例2**：对于同步方法块，锁是Synchronized括号里面**指定的对象**

```Java
package org.example;

public class SynchronizedObjectThis implements Runnable{
    Object lockObject = new Object();
    @Override
    public void run() {
        synchronized (lockObject){
            System.out.println(Thread.currentThread().getName()+"开始");
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                throw new RuntimeException(e);
            }
            System.out.println(Thread.currentThread().getName()+"结束");
        }

    }



    public static void main(String[] args) {
        SynchronizedObjectThis instance = new SynchronizedObjectThis();
        SynchronizedObject instance1 = new SynchronizedObject();
        Thread thread1 = new Thread(instance);
        Thread thread2 = new Thread(instance);
        Thread thread3 = new Thread(instance1);
        thread1.start();
        thread2.start();
        thread3.start();
    }
}
```

结果：

![img](https://gvhh8pww7cu.feishu.cn/space/api/box/stream/download/asynccode/?code=ODBlMGI2NmRiODFiOWZmYjJmOTVkNGViZWI5MjNjYmJfam02SmF1ajN1M210Mkk3NzBOZkRCc3VaRmlRWG14Q1BfVG9rZW46R3pYZmJVcWRvbzFib2N4YTg2NmM5enZQbjNjXzE3MDUxNDE0OTE6MTcwNTE0NTA5MV9WNA)

解释：

用了三个线程，线程0和1其实锁的是SynchronizedObjectThis这个对象，线程2其实锁的是SynchoronizedObject这个对象，所以线程2和他俩没关系。

**示例3：**对于静态同步方法，锁是当前类的Class对象

```Java
package org.example;

public class SynchronizedObject implements Runnable{
    @Override
    public void run() {
        method();
    }


    public static synchronized void method(){
        System.out.println(Thread.currentThread().getName()+"开始");
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
        System.out.println(Thread.currentThread().getName()+"结束");
    }

    public static void main(String[] args) {
        SynchronizedObject instance1 = new SynchronizedObject();
        SynchronizedObject instance2 = new SynchronizedObject();
        Thread thread1 = new Thread(instance1);
        Thread thread2 = new Thread(instance2);
        thread1.start();
        thread2.start();
    }
}
```

结果

![img](https://gvhh8pww7cu.feishu.cn/space/api/box/stream/download/asynccode/?code=NTU4NmVmOWFlYzAwOGRmNjkxZjdiYjU4YmM5YjQwZjVfVllodGNRN3prQWI5MzYxOGMxV05yd1VRcFJVbjk1MmFfVG9rZW46TmY1aGJFWkRLb2tEMDB4NzNDRWNsRk1kbkFnXzE3MDUxNDE0OTE6MTcwNTE0NTA5MV9WNA)

解释：

- synchronized用在静态方法上，默认的锁就是**当前实例对应的Class类**
- 别看是new了两个对象，**但是对应的Class对象是同一个**，所以t1和t2会竞争同一把锁，竞争成功的线程运行完成才会执行下一个线程。
- 进一步理解就是如果把static理解，就会变成自己去执行自己的，互相不干预

### 底层原理

#### 加锁和释放锁的原理

通过一段示例代码来观察生成的class文件信息来分析细节

示例代码:

```Java
package org.example;

public class Target implements Runnable{
    @Override
    public void run() {
        synchronized (this){
            System.out.println("这里是代码块");
        }
    }
    public static synchronized void method(){

    }

}
```

进入工作目录后，通过在控制台输入以下两个命令，可以查看Target类生成的class文件

```Java
javac Target.java //编译生成class文件
javap -v Target.class //查看class文件
```

class文件中的**run()**方法部分的指令，同步块的实现。

![img](https://gvhh8pww7cu.feishu.cn/space/api/box/stream/download/asynccode/?code=NDUxZjM3NTJkNjA2NzgxMmNmZDc5ZjQ0ZDZmNjljNThfWjZiRm1RSWtsd3BGWHBpeEh0eXU1TEVTcHpYQ2dwTllfVG9rZW46TGNrN2JjRUlQb005RzN4SG1xQWNFMWV1bmZkXzE3MDUxNDE0OTE6MTcwNTE0NTA5MV9WNA)

class文件中的**target()**同步方法部分

![img](https://gvhh8pww7cu.feishu.cn/space/api/box/stream/download/asynccode/?code=NDMxNGFiMjY0ZmIwM2Y3MmU0MjA0ZmEyN2E1YTMyYWZfV1VGZ2JXN09JQkM5SWVOenFKenZvZ2RqaFVKRDlISURfVG9rZW46SFNOS2JnQ3oybzl6bmt4ZFVPcmN6Vkg0blFmXzE3MDUxNDE0OTE6MTcwNTE0NTA5MV9WNA)

通过上面可以看出，class信息中，对于同步块的实现使用了monitorenter和monitorexit指令，而同步方法则是依靠方法修饰符上的ACC_SYNCHRONIZED来完成的。无论采取哪种方式，其实本质上是对一个对象的监视器（monitor）进行获取，而这个获取过程是排他的，也就是同一时刻一个线程获取到由synchronized锁保护对象的监视器。下面通过一个图来展示线程，对象Object，监视器Mointor，同步队列SynchronizedQueue之间的关系。

![img](https://gvhh8pww7cu.feishu.cn/space/api/box/stream/download/asynccode/?code=YWQyZDY5ZjEyNzgzMjBlMzljODMwODI1Y2MyNWNhYTRfWmVqbVBaYUo5T2lZVXZ2TmxFeWQ2WFhKY21DTDJlZjRfVG9rZW46Tm5oa2JuWlVWb3g0Rll4OVl6VGMyUURUbmtmXzE3MDUxNDE0OTE6MTcwNTE0NTA5MV9WNA)

图中可以看到，任意线程对Object（Object由synchronized保护）的访问，首先要获得Object的监视器Monitor。如果获取失败，线程进入同步队列，线程状态变为BLOCKED。当访问Object的前驱(获得了锁的线程)释放了锁，则该释放操作唤醒阻塞在同步队列中的线程，使其重新尝试对监视器的获取。

#### 可重入的实现原理

synchronized对于一个对象加锁后是可以重入的，就是说同一个线程可以反复给该对象加锁，且**并不会因为前一次加的锁还没有释放而阻塞**。

原理：Synchronized加锁的对象拥有一个monitor计数器，当线程获取该对象锁后，monitor计数器就会加一，释放锁之后就会减一。所以同一个线程反复对该对象加锁时，只会引起monitor计数器加一，并不会触发Moitor.Enter失败的流程，即线程不会被阻塞。释放锁也是一样，每触发一次释放操作锁monitor计数器会减1，当最终monitor计数器重新减为0之后，才真正释放了锁。

示例代码：

```Java
package org.example;

public class MethodDemo {
    public static void main(String[] args) {
        MethodDemo methodDemo = new MethodDemo();
        methodDemo.method1();
    }

    private synchronized void method1() {
        System.out.println(Thread.currentThread().getName()+":method1");
        method2();
    }

    private synchronized void method2() {
        System.out.println(Thread.currentThread().getName()+":method2");
        method3();
    }

    private synchronized void method3() {
        System.out.println(Thread.currentThread().getName()+":method3");

    }
}
```

因为持有的是同一个监视器，所以彼此之间不会产生排斥反应

#### 保证可见性的原理-锁的内存原语

Synchronized的happens-before规则，即监视器锁规则：对同一个监视器的解锁，happens-before于对该监视器的加锁。继续来先看下代码：

```Java
package org.example;

public class MonitorDemo1 {
    private int a = 0;

    public synchronized void writer() {
        a++;
    }

    public synchronized void reader() {
        int i = a;
    }
}
```

该代码的happens-before关系图如下

![img](https://gvhh8pww7cu.feishu.cn/space/api/box/stream/download/asynccode/?code=ODJhODY3NTNjMDNmMWMwYWIwODI2MjcyYTg0YmY5ODdfVTRqYm9Vc0Y4bGluMWJHNXVuZWcyWVN4Z3JZdmlaRkFfVG9rZW46VjdEUGJWSkRqbzN4bWx4NUMwbGNQbkV0bndkXzE3MDUxNDE0OTE6MTcwNTE0NTA5MV9WNA)

在图中的每一个箭头连接的两个节点就代表之间的happens-before关系，黑色的是通过程序顺序规则推导出来的，红色的为监视器锁规则推导而出：线程A释放锁happens-before线程B加锁，蓝色的则是通过程序顺序规则和监视器锁规则推测出来happens-before关系，通过传递性规则进一步推导的happens-before关系。现在我们来重点关注2 happens-before 5，通过这个关系我们可以得出什么结论？

根据happens-before的定义中的一条:如果A happens-before B，则A的执行结果对B可见，并且A的执行顺序先于B。线程A先对共享变量A进行加一，由2happens-before5关系可知线程A的执行结果对线程B可见即线程B所读取到的a的值为1。

面试回答：当一个线程释放锁时，它之前对共享变量的修改会被**刷新到主内存**。另一个线程获取同一把锁时，它会将工作内存中的共享变量值置为**无效**，强制从主内存重新加载**最新的值**。这确保了在多线程环境下，一个线程对共享变量的修改对其他线程是可见的。

#### 锁的优化（锁升级于对比）

##### Java对象头

Synchronized用的锁是存在Java对象头里面的

Java对象头中主要存储三类数据：第一类叫做Mark Word，主要存储对象的hashcode，分代年龄，锁信息等运行数据；第二类是Class Pointer，指向方法区中该class的对象，JVM通过此字段判断当前对象是哪个类的实例；第三类，数组的长度，就是如果当前对象是数组的话才会有。重点关注Mark Word

| **锁状态** | **25bit**      | **4bit**     | **1bit是否是偏向锁** | **2bit锁标志位** |
| ---------- | -------------- | ------------ | -------------------- | ---------------- |
| 无锁状态   | 对象的hashCode | 对象分代年龄 | 0                    | 01               |

![img](https://gvhh8pww7cu.feishu.cn/space/api/box/stream/download/asynccode/?code=ZTE5YzkwNDBlZGQ0OWMxODNlZGU4ZGNmYmVlMWM3OTlfRUE5YWVNSnhXVk9Za0x1b2t4dnh4ZjZOb29KeE5lMVJfVG9rZW46V1ZyMmJMa2VEb2FqVnV4Rk5lcmNWTHRPbmhoXzE3MDUxNDE0OTE6MTcwNTE0NTA5MV9WNA)

发现，无锁和偏向锁的锁标志位是一样的，即都是**01**，这是因为无锁和偏向锁是靠字段是否是偏向锁来区分的，0代表没有启用偏向锁，1代表启用了偏向锁，可以通过JVM参数（XX:UseBiasedLocking=true默认）控制。并且启动偏向锁还有延迟（默认4s），可以通过JVM参数（XX：BiasedLockingStartupDelay=0）关闭延迟。

##### 锁的升级与对比

锁只能升级不能降级，1.6开始为了降低锁的获取与释放带来的性能消耗，引入的偏向锁和轻量级锁。

- **偏向锁**

实际：在大多数实际环境中，同一个线程反复获取锁与释放锁，并没有锁的竞争，引入了偏向锁。

**偏向锁加锁**：当一个线程A访问同步块并获取锁时，会在对象头和栈帧中存储当前线程ID，以后该线程在进入和退出同步块时不需要进行CAS操作来加锁和解锁，只需要简单测试一下对象头的Mark Word里是否存储着指向当前线程A的偏向锁。如果测试成功，表示线程已经获得了锁。如果测试失败，则需要测试一下Mark Word中偏向锁的标识是否设置成1（表示当前是偏向锁）：如果设置了，则尝试使用CAS将对象头的偏向锁指向当前线程。如果没有设置，则使用CAS竞争锁（即轻量级锁）

![img](https://gvhh8pww7cu.feishu.cn/space/api/box/stream/download/asynccode/?code=MGFhZDE3YjAzZmFhYWQ3NGYwNGVhNDdjODAzMWQ1M2JfcnR1RlNOUUhTNlVKdGJ4RVZsR1VVZ01YWnZzaGlkNjBfVG9rZW46QUJEMmJ2emhvb1BCV2t4M2s3cmNJWnpTbjFlXzE3MDUxNDE0OTE6MTcwNTE0NTA5MV9WNA)

此时只有大呆自己要上WC，并没有其他人需要上WC，此时可以把自己的ID贴到门上，表示此时大呆占用了这个WC。

**偏向锁的撤销：**还是用上面的图进行一个解释，此时当前的厕所被大呆所占用，这时二呆来了也要使用这个WC,这时大呆和二呆都要通过CAS的方式来抢占WC。因为此时锁的状态是偏向锁的状态，二呆来了也要使用这个WC（这时有两个人同时要使用WC，这时就要将偏向锁升级成轻量级锁），在升级轻量级锁之前首先需要将WC上的标识大呆身份的ID撕下来（这一步叫做偏向锁的撤销）。

其实就是对象头中的偏向锁的标识，如果在没有升级到轻量级锁之前，这个标识是不会主动撕下来的。

- 轻量级锁

轻量级锁状态下两个人需要通过自旋+CAS的方式来抢锁，当其中一个线程抢锁成功后，会将LR贴到WC的门上，表示WC当前被某个线程占用，然后另一个没有抢到锁的线程就一直自旋获取锁。

LR:参与竞争的每个线程，会在自己的线程栈中生成一个LockRecord（LR）

![img](https://gvhh8pww7cu.feishu.cn/space/api/box/stream/download/asynccode/?code=MzZjZGZmMzBhN2VjMTcxYjJiZTc0NDcyM2VmMDBlYzdfcllwMzN1UUwwVE9VVEExSjhCbW9kb1dodXNUMWtnYkZfVG9rZW46SnI5V2I5bmIzb2pwak94Q0hIdmNRQjFhbm5mXzE3MDUxNDE0OTE6MTcwNTE0NTA5MV9WNA)

LR的锁记录中存储的是对象的Mark Word的备份，即拷贝进入的，而两个线程竞争的过程就是通过CAS的方式将对象本来的Mark Word位置存储的信息替换为指向自己LR记录的指针。谁替换成功了，谁就获得了锁，例如A成功了。那没有获取到锁的线程B，就在自旋一段时间。当自旋一段时间后，如果还没有获得锁，那B就只能将锁改为重量级锁了，然后自己进入阻塞状态，等待A执行完之后唤醒。 

![img](https://gvhh8pww7cu.feishu.cn/space/api/box/stream/download/asynccode/?code=ODMyNWEzZjcyNjc1OTc2OWY2ZDIwZjdmYzg1YzU4MmJfYlJqbzFlbTY4Vk1CNWEzRm5yUWJrelF0ZGV5RE9xWE1fVG9rZW46RWhseWJNOG03b0JXTTh4VHFxRWNPbWFwbmdjXzE3MDUxNDE0OTE6MTcwNTE0NTA5MV9WNA)

- 锁的对比

![img](https://gvhh8pww7cu.feishu.cn/space/api/box/stream/download/asynccode/?code=MjkwODFhMjFkY2JkZjM4MWQ3YWY5MGExZDhiZjc4Y2NfRXNlV1NyeHJVVVR2Nm50TVdTT3FSeFlUR1J4bXo5R21fVG9rZW46WlVid2JDSFE5b292Umt4dnRLUWN0aEdwbk1iXzE3MDUxNDE0OTE6MTcwNTE0NTA5MV9WNA)

synchronized是基于JVM内置锁实现的，通过内部对象Monitor实现，基于进入与退出Monitor对象实现方法与代码块同步，监视器锁的实现依赖于底层操作系统的Mutex lock实现。

![img](https://gvhh8pww7cu.feishu.cn/space/api/box/stream/download/asynccode/?code=ZTgyYjNkZTZiMjg2YTkwNGJjYjYxMDNlYTNiNWQ3YWZfTERJZXZQU2pTMkkyWkpZRzVVTkN3c2xrRTJZSVRscVdfVG9rZW46RTlRUWJaM05Eb1NLUWl4UFQ5RWNzWE1TbjdmXzE3MDUxNDE0OTE6MTcwNTE0NTA5MV9WNA)

加锁过程的底层原理实现

![img](https://gvhh8pww7cu.feishu.cn/space/api/box/stream/download/asynccode/?code=ZGRiNTUzY2YyOGFiNWE1ZGM0NmMxZmE0ZDRmZjQ3MmJfSEJVWEFzOURkTjVxOXJqOEtwU040RkZLWm93TnkxZkpfVG9rZW46T3FLdWJBb1VGb3h6NU14TTFkZGN1dmVUbnNlXzE3MDUxNDE0OTE6MTcwNTE0NTA5MV9WNA)

### Monitor

任何一个对象都有一个Monitor与之关联，当且一个Monitor被持有之后，它将处于锁定状态。Synchronized在JVM里的实现都是基于进入和退出Monitor对象来实现方法同步和代码块同步。

- monitorenter：每个对象都是一个监视器锁（monitor）。当monitor被占用时就会处于锁定状态，线程执行monitorenter指令时获取monitor的所有权，过程如下： 
  - **如果monitor的进入数为0**，则该线程进入monitor，然后将进入数设置为1，该线程即为monitor的所有者；
  - **如果线程已经占有该monitor**，只是重新进入，则进入monitor的进入数加1；
  - **如果其他线程已经占用了monitor**，则该线程进入阻塞状态，直到monitor的进入数为0，再重新尝试获取monitor的所有权；
- **monitorexit**：执行monitorexit的线程必须是objectref所对应的monitor的所有者。**指令****执行时，monitor的进入数减1，如果减1后进入数为0，那线程退出monitor，不再是这个monitor的所有者**。其他被这个monitor阻塞的线程可以尝试去获取这个 monitor 的所有权。
- **monitorexit，****指令****出现了两次，第1次为同步正常退出释放锁；第2次为发生异步退出释放锁**；

Synchronized的语义底层是通过一个monitor的对象来完成，其实wait/notify等方法也依赖于monitor对象，这就是为什么只有在同步的块或者方法中才能调用wait/notify等方法，否则会抛出java.lang.IllegalMonitorStateException的异常的原因。

#### 反编译源码

```Java
package it.yg.juc.sync;
public class SynchronizedMethod {
    public synchronized void method() {
        System.out.println("Hello World!");
    }
}
```

![img](https://gvhh8pww7cu.feishu.cn/space/api/box/stream/download/asynccode/?code=MzBiMTM5NWQ1ZDY4ZDcxOGIxNzJhMjg2YzNjNDVjYWNfYzNYMFd2Y1lNamdBNmgwRXJ0NFU5UWhhaEp4NXhNQlRfVG9rZW46VUxMc2JlMFVIb2JvUlZ4RmY2cGM2ZzZObkliXzE3MDUxNDE0OTE6MTcwNTE0NTA5MV9WNA)

**从编译的结果来看**，方法的同步并没有通过指令 **monitorenter** 和 **monitorexit** 来完成（理论上其实也可以通过这两条指令来实现），不过相对于普通方法，其常量池中多了 **ACC_SYNCHRONIZED** 标示符。**JVM****就是根据该标示符来实现方法的同步的**：

 当方法调用时，**调用****指令****将会检查方法的 ACC_SYNCHRONIZED 访问标志是否被设置**，如果设置了，**执行线程将先获取monitor**，获取成功之后才能执行方法体，**方法执行完后再释放monitor**。在方法执行期间，其他任何线程都无法再获得同一个monitor对象。

 两种同步方式本质上没有区别，只是方法的同步是一种隐式的方式来实现，无需通过字节码来完成。**两个****指令****的执行是****JVM****通过调用****操作系统****的****互斥****原语****mutex****来实现，被阻塞的线程会被挂起、等待重新调度**，会导致“用户态和内核态”两个态之间来回切换，对性能有较大影响。

图示

### 简单应用

抢票并发

```Java
/**
题⽬：三个售票员 卖出 30张票
*
*/
class Ticket{//资源类
   //票
   private int number = 30;
   public synchronized void saleTicket(){
     if (number > 0) {
     System.out.println(Thread.currentThread().getName()+"\t卖出第："+(number--)+"\t还剩下："+number);
     }
   }
}
public class SaleTicketDemo {
   public static void main(String[] args) {
     Ticket ticket = new Ticket();
     new Thread(()->{
       for (int i = 0; i < 30; i++) {
       ticket.saleTicket();
       }
     }, "窗⼝A").start();
     new Thread(()->{
       for (int i = 0; i < 30; i++) {
       ticket.saleTicket();
       }
     }, "窗⼝B").start();
     new Thread(()->{
       for (int i = 0; i < 30; i++) {
       ticket.saleTicket();
       }
     }, "窗⼝C").start();
   }
}
```

## ReetrentLock

想要了解这个锁，我们先看一下这个类的类图

![img](https://gvhh8pww7cu.feishu.cn/space/api/box/stream/download/asynccode/?code=MzkyMDhjODk5ZjM3NzQ0NjgzNzBhZTZkZTRhMDljOTlfdmU4Y3BydWUxaEtTanU3VUQ2dXRsU1BXODJOUzJOSzZfVG9rZW46Tk9La2J2RWVBb1VYeHN4bFVRZ2NWdHRnblEyXzE3MDUxNDE0OTE6MTcwNTE0NTA5MV9WNA)

详细的类图

![img](https://gvhh8pww7cu.feishu.cn/space/api/box/stream/download/asynccode/?code=ZTA5Zjc3MTM0MzlkMDRlZjQ0YTRiZDUwMmQ3N2ZiZGNfQ21HMklBRWRudjMxcEtnc0R2MUZWY1RUNVVEc1QzdFNfVG9rZW46SHd1cWJTSmprb2ROZ094UUxxSWNWWURMbm5mXzE3MDUxNDE0OTE6MTcwNTE0NTA5MV9WNA)

通过观察这个类图的发现：

实现了Lock接口的类，NonfairSync和FairSync都继承自抽象类Sync，在ReentrantLock中有非公平锁和公平锁的实现。

观察源码发现，Sync还继承自AQS

![img](https://gvhh8pww7cu.feishu.cn/space/api/box/stream/download/asynccode/?code=ODc4NGI4MTBhOTlhZDI2NTJiMTNlNjgyOWViODQ5YzlfTDZpbUNITmk4Q0tUaTVodXFSYXY0bVpxMlhPNnVubnpfVG9rZW46UTliYmJuMEZOb01SOHd4Z0tYQmNlRkdBbkllXzE3MDUxNDE0OTE6MTcwNTE0NTA5MV9WNA)

其实现类

![img](https://gvhh8pww7cu.feishu.cn/space/api/box/stream/download/asynccode/?code=YWFjMWE4MmVjYWVhODQ1MWIwNjZkZDEyZGFiOGY3OWRfWnRGbVhQNzh1R2lEQW5NMmR5M241RzgzNDFrYkVWTllfVG9rZW46UzhaUGJiaVZ1b0tuWnZ4R1VPdmMxTGNwbmdlXzE3MDUxNDE0OTE6MTcwNTE0NTA5MV9WNA)

### AQS

#### 定义

AQS（全称AbstractQueuedSynchronizer）即**队列同步器**。它是构建锁或者其他同步组件的基础框

架（如ReentrantLock、ReentrantReadWriteLock、Semaphore等）。AQS是JUC并发包中的核心基础

组件，其本身是一个**抽象类**。理论上还是利用管程实现的，在AQS中，有一个volatile修饰的state，获取

锁的时候，会读写state的值，解锁的时候，也会读写state的值。

结构图

![img](https://gvhh8pww7cu.feishu.cn/space/api/box/stream/download/asynccode/?code=NTgzYjA1MWIyMTM2ZDgzYzZhNzNiNDg5NTlhOGFjZGJfUEVIZjVWVjlXeXdHNzNyT2FkOWF2Nzc2MzF5V1BaSThfVG9rZW46WWhld2JSWVNlb2N0NXB4UHZQNWNibjZzbmVkXzE3MDUxNDE0OTE6MTcwNTE0NTA5MV9WNA)

**AQS****是一个FIFO的双向队列**，其内部通过节点head和tail记录队首和队尾元素，队列元素的类型为Node。

**Node**中的thread变量用来存放进入AQS队列里面的线程，Node节点内部:

**prev**记录当前节点的前驱节点

**next** 记录当前节点的后继节点

**SHARED**用来标记该线程是获取共享资源时被阻塞挂起后放入AQS队列的

**EXCLUSIVE**用来标记线程是获取独占资源时被挂起后放入AQS队列的

**waitStatus **记录当前线程等待状态，可以为①CANCELLED (线程被取消了)、②SIGNAL(线程需要被

唤醒)、③CONDITION(线程在CONDITION条件队列里面等待)、④PROPAGATE(释放共享资源时需

要通知其他节点);

在AQS中维持了一个单一的状态信息state，对于ReentrantLock的实现来说，state 可以用来表示当前线

程获取锁的可重入次数；AQS继承自AbstractOwnableSynchronizer，其中的exclusiveOwnerThread

变量表示当前共享资源的持有线程

#### 核心原理

AQS是一个同步队列，内部使用的是一个FIFO的**双向链表**，管理线程同步时的所有被阻塞的线程。双向链表这种数据结构，它的每个数据节点中都有两个指针，分别指向**直接后继节点**和**直接前驱节点**。所以，从双

向链表中的任意一个节点开始，都可以很方便地访问它的前驱节点和后继节点。

我们看下面的AQS的数据结构，AQS有两个节点head，tail分别是头节点和尾节点指针，默认为null。

AQS中的内部静态类Node为**链表****节点**，AQS会在线程获取锁失败后，线程会被阻塞并被封装成Node加

入到AQS队列中；当获取锁的线程释放锁后，会从AQS队列中唤醒一个线程（节点）

![img](https://gvhh8pww7cu.feishu.cn/space/api/box/stream/download/asynccode/?code=YzAyMzE4ZGFiMjMzYTkxMmU0OTNmMDA1NGZkNTk1YjlfdmNXMWd1R2pCc0xLVmtlbDZzaWNOTkg3Q1pUTGd5anVfVG9rZW46T2dwSWJGanBwb0s1QzZ4cGlKMWNHWGJTbnloXzE3MDUxNDE0OTE6MTcwNTE0NTA5MV9WNA)

### 场景

#### 场景01-线程抢夺锁失败时，AQS队列的变化

1. AQS的head，tail分别代表同步队列头节点和尾节点指针，默认为null。

![img](https://gvhh8pww7cu.feishu.cn/space/api/box/stream/download/asynccode/?code=MWExNTQzOTg1ZjQxMTQ3YzU1ZDIwNDA3NmQ5NjY2NTRfNXVxc21kMTVHaDF2NWg2a2pQN2JxN2xReE5PQU4wOVBfVG9rZW46RzZVcmJOZTVUb21yY1J4cU1tS2NJd1N1bmpjXzE3MDUxNDE0OTE6MTcwNTE0NTA5MV9WNA)

1. 当第一个线程抢夺锁失败，同步队列会先初始化，随后线程会被封装成Node节点追加到AQS队列中。假设当前独占锁的的线程为ThreadA，抢占锁失败的线程为ThreadB。
   1.  （1）同步队列初始化，首先会在队列中添加一个空Node，这个节点中的thread=null，代表当前获取锁成功的线程。随后，AQS的head和tail会同时指向这个节点

![img](https://gvhh8pww7cu.feishu.cn/space/api/box/stream/download/asynccode/?code=NWM2MzY2MjcyNTJkMDFmODAzYzE5ZWU1ZDI1NWRjYzBfUURTVVNCb3hzTTRTMDluSUwyTHNYUmhtUkJSem5LZUpfVG9rZW46Q2N1TGIxTXkyb1BJaW14UkRLTGNESEVabnNlXzE3MDUxNDE0OTE6MTcwNTE0NTA5MV9WNA)

（2）接下来将ThreadB封装成Node节点，追加到AQS队列。设置新节点的prev指向AQS队尾节点；将队尾节点的next指向新节点；最后将AQS尾节点指针指向新节点。此时AQS变化

![img](https://gvhh8pww7cu.feishu.cn/space/api/box/stream/download/asynccode/?code=NzhkNGI2Yjc3M2RjNTk0NWRkZWE5MDBmZGIxN2U5MDRfMGNqQU5jd01neXZEMGdDcFA0b2ZqMDZFOEd2MzhmQTBfVG9rZW46UWdVb2JIUmM3b2xjWE94WnFQNGNoakdSbjIzXzE3MDUxNDE0OTE6MTcwNTE0NTA5MV9WNA)

1. 当下一个线程抢夺锁失败时，重复上面步骤即可。将线程封装成Node，追加到AQS队列。假设此次抢占锁失败的线程为ThreadC，此时AQS变化

![img](https://gvhh8pww7cu.feishu.cn/space/api/box/stream/download/asynccode/?code=MjU0MGE4M2MzMGViYzgxZWE4ZWZmMmQ2MzNmYmRiZmRfV1ZzeTNJWk5NN2VKYWpMaGxHVGhxOWFQeDdBS1VUMzZfVG9rZW46REdHbGJaOVhzb29kejB4bW9jaGNKOEsybnpmXzE3MDUxNDE0OTE6MTcwNTE0NTA5MV9WNA)

#### 场景02-线程被唤醒时，AQS队列的变化

ReentrantLock唤醒阻塞线程时，会按照**FIFO的原则从****AQS****中head头部开始唤醒首个节点中线程**。

head节点表示当前获取锁成功的线程ThreadA节点。

当ThreadA释放锁时，他会唤醒后继节点线程ThreadB，ThreadB开始尝试获得锁，如果ThreadB获得锁成功，会将自己设置为AQS的头节点。ThreadB获取锁成功后，AQS变化如下：

1. head指针指向ThreadB节点。
2. 将原来的头节点的next指向NULL，从AQS中删除
3. 将ThreadB节点的prev指向NULL，设置节点的thread=null。

![img](https://gvhh8pww7cu.feishu.cn/space/api/box/stream/download/asynccode/?code=YzllNTEzOWRmMDJjYjBhMWNjZmVlZTljZjBjNGRkN2VfdWFKWFFRSnBMSnJKZ2VlUHJrV1U4emxWZ093YUJaY01fVG9rZW46VDJtVGJGZFpBbzZ6NUh4UWc5dmN2Sk4wbmJlXzE3MDUxNDE0OTE6MTcwNTE0NTA5MV9WNA)

上述过程就是，线程被阻塞和被唤醒时AQS同步队列的基本实现过程。

### 源码分析

#### 获取锁的源码分析

AQS其实使用了一种典型的设计模式：模板方法。我们如果查看AQS的源码可以看到，AQS为一个抽象

类，AQS中大多数方法都是final或private的，也就是说AQS并不希望用户覆盖或直接使用这些方法，而

是只能重写AQS规定的部分方法。

## 公平锁&非公平锁

### 定义

所谓公平锁，就是多个线程按照申请锁的顺序来获取锁，类似排队，先到先得。⽽⾮公平锁，则

是多个线程抢夺锁，会导致优先级反转或饥饿现象

### 区别

- **公平锁**在获取锁时先查看此锁维护的等待队列，为空或者当前线程是等待队列的队⾸，则直接占有锁，否则插⼊到等待队列，FIFO原则。
- **非公平锁**⽐较粗鲁，上来直接先尝试占有锁，失败则采⽤公平锁⽅式。⾮公平锁的优点是吞吐量⽐公平锁更⼤。

synchronized 和 juc.ReentrantLock 默认都是⾮公平锁。 ReentrantLock 在构造的时候传⼊ true则是公平锁。

### 应用

```Java
package com.sdy.juc;
import java.util.concurrent.locks.ReentrantLock;
/**
题⽬：三个售票员 卖出 30张票
*/
class Ticket {//资源类
 //票
 private int number = 30;
 private final ReentrantLock  reentrantLock = new ReentrantLock();
 public void saleTicket() {
        reentrantLock.lock();
        try {
            if (number > 0) {
                System.out.println(Thread.currentThread().getName() + "\t卖出第：" + (number--) + "\t还剩下：" + number);
            }
        } finally {
            reentrantLock.unlock();
        }
    }
}
public class SaleTicketDemo {
    public static void main(String[] args) {
        Ticket ticket = new Ticket();
        new Thread(() -> {
            for (int i = 0; i < 30; i++) {
                ticket.saleTicket();
            }
        }, "窗⼝A").start();
        new Thread(() -> {
            for (int i = 0; i < 30; i++) {
                ticket.saleTicket();
            }
        }, "窗⼝B").start();
        new Thread(() -> {
            for (int i = 0; i < 30; i++) {
                ticket.saleTicket();
            }
        }, "窗⼝C").start();
    }
}
```

## 可重入锁

### 定义

可重⼊锁⼜叫**递归****锁**，指的同⼀个线程在外层⽅法获得锁时，进⼊内层⽅法会⾃动获取锁。也就是说，

线程可以进⼊任何⼀个它已经拥有锁的代码块。⽐如 method01 ⽅法⾥⾯有 method02 ⽅法，两个⽅法

都有同⼀把锁，得到了 method01 的锁，就⾃动得到了 method02 的锁。

就像有了家⻔的锁，厕所、书房、厨房就为你敞开了⼀样。可重⼊锁可以避免死锁的问题。

### 应用

#### synchronized的方式

```Java
package com.sdy.juc;
class PhonePlus{
    public synchronized  void sendMsg(){
        System.out.println(Thread.currentThread().getName() + " : ====sendMsg" );
        sendEmail();
    }
    private synchronized void sendEmail() {
        System.out.println(Thread.currentThread().getName() + " : =====sendEmail" );
    }
}
public class ReentrantLockDemo {
    public static void main(String[] args) {
        PhonePlus phonePlus = new PhonePlus();
        new Thread(()->{
            phonePlus.sendMsg();
        },"A").start();
        new Thread(()->{
            phonePlus.sendMsg();
        },"B").start();
    }
}
```

#### Lock的方式

注意：要注意这个lock是同一把锁

```Java
package com.sdy.juc;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;
class PhonePlus{
    private final Lock lock = new ReentrantLock();
    public   void sendMsg(){
        lock.lock();
        try{
            System.out.println(Thread.currentThread().getName() + " : ====sendMsg" );
            sendEmail();
        }finally {
            lock.unlock();
        }
    }
    private  void sendEmail() {
        lock.lock();
        try{
            System.out.println(Thread.currentThread().getName() + " : =====sendEmail" );
        }finally {
            lock.unlock();
        }
    }
}
public class ReentrantLockDemo {
    public static void main(String[] args) {
        PhonePlus phonePlus = new PhonePlus();
        new Thread(()->{
            phonePlus.sendMsg();
        },"A").start();
        new Thread(()->{
            phonePlus.sendMsg();
        },"B").start();
    }
}
```

## 自旋锁

### 定义

所谓⾃旋锁，就是尝试获取锁的线程不会⽴即阻塞，⽽是采⽤**循环**的⽅式去尝试获取。⾃⼰在那⼉⼀直

循环获取，就像“⾃旋”⼀样。这样的好处是减少线程切换的上下⽂开销，缺点是会消耗CPU。CAS底层

的 getAndAddInt 就是⾃旋锁思想。

### 应用

```Java
package com.sdy.juc;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;
/**
题⽬：实现⼀个⾃旋锁
⾃旋锁好处：循环⽐较获取直到成功为⽌，没有类似wait的阻塞。
*
通过CAS操作完成⾃旋锁，A线程先进来调⽤myLock⽅法⾃⼰持有锁5秒钟，
B随后进来后发现当前有线程持有锁，不是null，所以只能通过⾃旋等待，直到A释放锁后B随后
抢到。
*/
class Wc{
  AtomicReference<Thread> atomicReference = new AtomicReference<>();
    public void lock() {
        Thread currentThread = Thread.currentThread();
        while (!atomicReference.compareAndSet(null, currentThread)) {
            System.out.println(Thread.currentThread().getName()+"在厕所中");
            try {
                TimeUnit.SECONDS.sleep(1);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
        System.out.println(currentThread.getName()+"进入厕所");
    }
    public void unlock() {
        Thread currentThread = Thread.currentThread();
        if (atomicReference.compareAndSet(currentThread, null)) {
            System.out.println(currentThread.getName()+"离开厕所===");
        }
    }
}
public class SpinLockDemo {
    public static void main(String[] args) {
        Wc wc = new Wc();
        new Thread(()->{
            wc.lock();
            try{
                TimeUnit.SECONDS.sleep(5);
            }catch (Exception e){
                e.printStackTrace();
            }
            wc.unlock();
        },"A").start();
        new Thread(()->{
            wc.lock();
            try{
                TimeUnit.SECONDS.sleep(1);
            }catch (Exception e){
                e.printStackTrace();
            }
            wc.unlock();
        },"B").start();
    }
}
```

## 读写锁

### 定义

其读写锁存在的意义是更好的可以提高并发性能，让读读不互斥

**独占锁**：指该锁⼀次只能被⼀个线程所持有。对ReentrantLock和Synchronized⽽⾔都是独占锁

**共享锁**：指该锁可被多个线程所持有

**总结**：

读读可以共存

读写不可共存

写写不可共存

### 应用

```Java
package com.sdy.juc;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.ReentrantReadWriteLock;
/**
@author sdy
思路：写线程创建3个，读线程创建5个，然后在写线程中对于共享变量进行5次的++操作，如果能出现写锁是逐渐递增就可，读锁出现好几个
*/
public class ReentrantLockReadWriteLockDemo {
 private volatile static  int count = 0;
 public static void main(String[] args) {
     ReentrantReadWriteLock reentrantReadWriteLock = new ReentrantReadWriteLock();
     for (int i = 0; i < 3; i++) {
         new Thread(()->{
             for (int j = 0; j < 5; j++) {
                    try {
                        TimeUnit.SECONDS.sleep(1);
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                    reentrantReadWriteLock.writeLock().lock();
                    count++;
                    System.out.println("写锁" + count);
                    reentrantReadWriteLock.writeLock().unlock();
                }
            }).start();
        }
        for (int i = 0; i < 5; i++) {
            new Thread(()-> {
                for (int j = 0; j < 5; j++) {
                    try {
                        TimeUnit.SECONDS.sleep(1);
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                    reentrantReadWriteLock.readLock().lock();
                    System.out.println("读锁" + count);
                    reentrantReadWriteLock.readLock().unlock();
                }
            }).start();
        }
    }
}
```

## 并发工具类

### CountDownLatch

#### 定义

CountDownLatch 内部维护了⼀个计数器，只有当计数器==0时，某些线程才会停⽌阻塞，开始执⾏

countDown() 来让计数器-1， await() 来让线程阻塞。

当 count==0 时，阻塞线程⾃动唤醒

#### 应用

```Java
package com.sdy.juc;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
/**
案例：假设有六个程序员，然后卷王必须等待其他人都走了之后才走
应用：拼团，分布式锁
*/
public class CountDownLatchDemo {
 public static void main(String[] args) throws InterruptedException {
     CountDownLatch countDownLatch = new CountDownLatch(6);
     for (int i = 1; i <=6; i++) {
         new Thread(()->{
             try {
                 TimeUnit.SECONDS.sleep(1);
             } catch (InterruptedException e) {
                 e.printStackTrace();
             }
             System.out.println("程序猿"+Thread.currentThread().getName()+"下班了");
             countDownLatch.countDown();
         },String.valueOf(i)).start();
     }
     new Thread(()->{
         try {
             countDownLatch.await();
             System.out.println("卷王"+Thread.currentThread().getName()+"最后走人");
         } catch (InterruptedException e) {
             throw new RuntimeException(e);
         }
        },String.valueOf(7)).start();
    }
}
```

不管中间发生了什么，最后的结果都是7最后走

![img](https://gvhh8pww7cu.feishu.cn/space/api/box/stream/download/asynccode/?code=MTU5ZTdmZWIyZTgxMmQzMTNkY2I5MzkwNzI2ODQ5MzhfN1lLaWExVFY1Tmg4ODBYaklHT0FscUd6UzB1cVVnZXZfVG9rZW46TXhwUWI1Z1k0b1U1TVB4aHdlQWNxMGYybm5jXzE3MDUxNDE0OTE6MTcwNTE0NTA5MV9WNA)

### Semaphore

#### 定义

CountDownLatch 的问题是不能复⽤。⽐如 count=3 ，那么减到0，就不能继续操作了。

⽽ Semaphore 可以解决这个问题，⽐如6辆⻋3个停⻋位，对于 CountDownLatch 只能停3辆⻋，

⽽ Semaphore 可以停6辆⻋，⻋位空出来后，其它⻋可以占有，

- cquire（获取）当⼀个线程调⽤acquire操作时，他要么通过成功获取信号量（信号量减1），要么⼀直等待下去，直到有线程释放信号量，或超时。
- release（释放）实际上会将信号量加1，然后唤醒等待的线程。

#### 应用

其实就是一个限流的作用，只有几个位置，只有当这几个位置腾出来了，才有机会去获取

```Java
package com.sdy.juc;
import java.util.concurrent.Semaphore;
import java.util.concurrent.TimeUnit;
/**
*案例：6个人抢三个坑
**/
public class SemaphoreDemo {
    public static void main(String[] args) {
        Semaphore  semaphore = new Semaphore(3);
        for (int i = 1; i <= 6; i++) {
            new Thread(()->{
                try {
                    semaphore.acquire();
                    System.out.println(Thread.currentThread().getName()+"\t 抢到了车位");
                    TimeUnit.SECONDS.sleep(3);
                    System.out.println(Thread.currentThread().getName()+"\t 停车了3s离开了车位");
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }finally {
                    semaphore.release();
                }
            },String.valueOf(i)).start();
        }
    }
}
```

结果

![img](https://gvhh8pww7cu.feishu.cn/space/api/box/stream/download/asynccode/?code=NzY3ZWZkYmZmZjQ3NTMzMmI3OTYxNjE3ZjE1YmY0OGRfbW9zQVBxc0Z5czQ2UDRsQVRHOWJIWVdNejVQeDh5R05fVG9rZW46UXBLRGJCb3Y3b3hTZ2t4YVJkdmN4eUM3blRmXzE3MDUxNDE0OTE6MTcwNTE0NTA5MV9WNA)

### CyclicBarrier

#### 定义

⽐如召集7颗⻰珠才能召唤神⻰

#### 应用

```Java
package com.sdy.juc;
import java.util.concurrent.BrokenBarrierException;
import java.util.concurrent.CyclicBarrier;
/**
*案例：集齐多少个人才去做什么
**/
public class CyclicBarrierDemo {
    public static void main(String[] args) {
        CyclicBarrier cyclicBarrier = new CyclicBarrier(6, ()->{
            System.out.println("集齐了6个人，去三亚旅游");
        });
        for (int i = 1; i <= 18; i++) {
            final int temp = i;
            new Thread(()->{
                System.out.println("第"+temp+"几个人报名");
                try {
                    cyclicBarrier.await();
                } catch (InterruptedException e) {
                    throw new RuntimeException(e);
                } catch (BrokenBarrierException e) {
                    throw new RuntimeException(e);
                }
            },String.valueOf(i)).start();
        }
    }
}
```

### LockSupport

#### 定义

**①什么是LockSupport?**

1. 通过park()和unpark(thread)⽅法来实现阻塞和唤醒线程的操作
2. LockSupport是⼀个线程阻塞⼯具类，所有的⽅法都是静态⽅法，可以让线程在任意位置阻塞，阻塞之后也有对应的唤醒⽅法。归根结底，LockSupport调⽤的Unsafe中的native代码。
3. 官⽹解释：
4. LockSupport是⽤来创建锁和其他同步类的基本线程阻塞原语
5. LockSupport类使⽤了⼀种名为Permit(许可）的概念来做到阻塞和唤醒线程的功能，每个线程都
6. 有⼀个许可(permit),permit只有两个值1和零，默认是零可以把许可看成是⼀种(0,1)信号量(Semaphore），但与Semaphore不同的是，**许可的累加上限是1**

**②阻塞⽅法**

1. permit默认是0，所以⼀开始调⽤park()⽅法，当前线程就会阻塞，直到别的线程将当前线程的permit设置为1时, park⽅法会被唤醒，然后会将permit再次设置为0并返回。
2. static void park( )：底层是unsafe类native⽅法
3. static void park(Object blocker)

**③唤醒⽅法(注意这个permit最多只能为1)**

1. 调⽤unpark(thread)⽅法后，就会将thread线程的许可permit设置成1(注意多次调⽤unpark⽅
2. 法，不会累加，permit值还是1)会⾃动唤醒thread线程，即之前阻塞中的LockSupport.park()⽅法
3. 会⽴即返回
4. static void unpark( )

**④LockSupport它能解决的痛点**

1. LockSupport不⽤持有锁块，不⽤加锁，程序性能好
2. 先后顺序，不容易导致卡死(因为unpark获得了⼀个凭证，之后再调⽤park⽅法，就可以名正⾔顺的凭证消费，故不会阻塞)

#### 应用

##### 先阻塞在唤醒：到收费站门口在缴费

```Java
package com.sdy.juc;
import java.util.concurrent.locks.LockSupport;
public class LockSupportDemo {
    public static void main(String[] args) {
        Thread t1 = new Thread(()->{
            System.out.println(Thread.currentThread().getName()+"向着收费站来了");
            LockSupport.park();
            System.out.println(Thread.currentThread().getName()+"可以通过收费站");
        },"线程1");
        t1.start();
        Thread t2 = new Thread(()->{
            try {
                Thread.sleep(3000);
            } catch (InterruptedException e) {
                throw new RuntimeException(e);
            }
            System.out.println("唤醒T1线程");
            LockSupport.unpark(t1);
        },"线程2");
        t2.start();
    }
}
```

##### 先唤醒在阻塞：先交完钱到收费站直接通过

```Java
package com.sdy.juc;
import java.util.concurrent.locks.LockSupport;
public class LockSupportDemo {
    public static void main(String[] args) {
        Thread t1 = new Thread(()->{
            try {
                Thread.sleep(3000);
            } catch (InterruptedException e) {
                throw new RuntimeException(e);
            }
            System.out.println(Thread.currentThread().getName()+"向着收费站来了");
            LockSupport.park();
            System.out.println(Thread.currentThread().getName()+"可以通过收费站");
        },"线程1");
        t1.start();
        Thread t2 = new Thread(()->{
            System.out.println("唤醒T1线程");
            LockSupport.unpark(t1);
        },"线程2");
        t2.start();
    }
}
```

#### 注意：

这个是上限是，也就是说连续的unpark最多也就是到了1，所以想要对应的park的时候，就有可能获取不到这个凭证了，要注意这个事情

#### 面试题

1. 为什么可以先唤醒线程后阻塞线程?(因为unpark获得了⼀个凭证，之后再调⽤park⽅法，就可以

名正⾔顺的凭证消费，故不会阻塞)

1. 为什么唤醒两次后阻塞两次，但最终结果还会阻塞线程?(因为凭证的数量最多为1，连续调⽤两次

unpark和调⽤⼀次unpark效果⼀样，只会增加⼀个凭证;⽽调⽤两次park却需要消费两个凭证，证

不够，不能放⾏)

## 死锁编码和定位

### 出现的原因

当两个或两个以上的线程并行执行的时候，争夺资源而造成的相互等待的现象，这时候就是发生了死锁

**死锁必要的四个必要条件**：

- 互斥资源：一个资源一次只能被一个进程所使用
- 持有并等待条件：一个进程因请求资源而阻塞时，对已获得资源保持不放
- 不剥夺条件：进程获得的资源，在未完全使用完之前，不能强行剥夺
- 环路等待条件：若干进程之间形成一种头尾相接的环形等待资源关系

解决方案：使用资源有序分配法来破坏环路等待条件。

> 线程 A 和 线程 B 获取资源的顺序要一样，当线程 A 是先尝试获取资源 A，然后尝试获取资源 B 的时候，线程 B 同样也是先尝试获取资源 A，然后尝试获取资源 B。也就是说，线程 A 和 线程 B 总是以相同的顺序申请自己想要的资源。
>
> 我们使用资源有序分配法的方式来修改前面发生死锁的代码，我们可以不改动线程 A 的代码。
>
> 我们先要清楚线程 A 获取资源的顺序，它是先获取互斥锁 A，然后获取互斥锁 B。
>
> 所以我们只需将线程 B 改成以相同顺序的获取资源，就可以打破死锁了。

![img](https://gvhh8pww7cu.feishu.cn/space/api/box/stream/download/asynccode/?code=NTE4ZmJlZjQ3MmZiNmQyYzgyMzgxYjk1YjlkZWI5NmVfNzZJcnBSUUg1T3Zod0pZRDZOSGpwS3JnTXc1cDczaXVfVG9rZW46SHZldmJKcmUwb0VRWHV4VjVYMmNIZVJ6bnJiXzE3MDUxNDE0OTE6MTcwNTE0NTA5MV9WNA)

死锁demo

```Java
package com.sdy.juc;
/**
创建两个线程，然后在run方法中实现逻辑：当前线程获取锁A，获取成功之后去获取锁B，最后出现死锁
*/
class Source implements Runnable{
    private String lockAA;
    private String lockBB;
    public Source(String lockA, String lockB) {
        this.lockAA = lockA;
        this.lockBB = lockB;
    }
    @Override
    public void run() {
        synchronized (lockAA){
            System.out.println(Thread.currentThread().getName()+"获取到了"+lockAA);
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            synchronized (lockBB){
                System.out.println(Thread.currentThread().getName()+"获取到了"+lockBB);
            }
        }
    }
}
public class DeathLockDemo {
    public static void main(String[] args) {
        String lockA = "LockA";
        String lockB = "LockB";
        new Thread(new Source(lockA,lockB),"ThreadA").start();
        new Thread(new Source(lockB,lockA),"ThreadB").start();
    }
}
```

### 解决办法

1. 首先先通过jps-l命令查看运行的java进程

![img](https://gvhh8pww7cu.feishu.cn/space/api/box/stream/download/asynccode/?code=YjFmNjRkYmIyMDQyMDMwZjI1Y2ZiOGViZTU5N2M4ODdfaGQzaUY2alRGajd2SDdiMFNwMTRGbXFhYmYzeXkwYXBfVG9rZW46U21weWJwWGZLb1E4UnR4Z1hDZmNySDF6bndmXzE3MDUxNDE0OTE6MTcwNTE0NTA5MV9WNA)

1. jstack指令： jstack pid 可以查看某个Java进程的堆栈信息，同时分析出死锁。

原因

![img](https://gvhh8pww7cu.feishu.cn/space/api/box/stream/download/asynccode/?code=NzhlN2VkZWY3ZjNjMWI4MjliZWNmZTQ2NGYwNTU5YjVfaXdFTmdJcUdJbzdmbGhQdHlJV2hndVgwTW5Icjk0OTNfVG9rZW46UjZuUmJBamNtb0txNW54QmJOMGNhWnFQbk9iXzE3MDUxNDE0OTE6MTcwNTE0NTA5MV9WNA)

代码定位：

![img](https://gvhh8pww7cu.feishu.cn/space/api/box/stream/download/asynccode/?code=NjNmNzYyNjRhNWE2NjVjMGI4ZjdiMWFiMGM0ZmFkYWZfdDhyNU9HSEt1WTZwbmNwNkNBZUhsR1hCdmFVcEdDbkxfVG9rZW46Um1vUWJUQVZMb2hHQWV4cXRzd2MwS1NnbnBoXzE3MDUxNDE0OTE6MTcwNTE0NTA5MV9WNA)

## TODO

LockSupport为什么要用

当第一个线程抢夺锁失败，同步队列会先初始化，随后线程会被封装成Node节点追加到AQS队列 中。假设当前独占锁的的线程为ThreadA，抢占锁失败的线程为ThreadB。 （1）同步队列初始化，首先会在队列中添加一个空Node，这个节点中的thread=null，代表 当前获取锁成功的线程。随后，AQS的head和tail会同时指向这个节