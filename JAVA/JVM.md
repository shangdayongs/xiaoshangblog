# JVM

## JVM的学习方法

通过一个生命周期去学习

jvm基本尝试-》类加载系统-》运行时数据区-》一个对象的一生-》GC收集器-》实战

![img](https://gvhh8pww7cu.feishu.cn/space/api/box/stream/download/asynccode/?code=MDFiMzEzNjQ4YjU1MzJiNzU3MWJlZGQzZWM2YTgxZTNfcVZ4U1BlcW1wc3dzNmcyWlNoY0FLS2M4S2Q3WE9ZMm5fVG9rZW46UXZUY2JDSW9YbzEwYUd4TEFMeWNXU2VqbjNnXzE3MDUxNDM4NDk6MTcwNTE0NzQ0OV9WNA)

## 讲一下JVM内存结构？

JVM内存结构分为5大区域，虚拟机栈、堆、本地方法栈、程序计数器、方法区。

![img](https://gvhh8pww7cu.feishu.cn/space/api/box/stream/download/asynccode/?code=NDQxN2E4OTNkZTliYWNiZTAxODk4ZDFhNGVmNjI0ZWVfVmtqMVF2ZWFrczNCUGJHNTFSUDlNenhrR3pxNEQ0aFRfVG9rZW46UjR5WGJxTW1Vb282OEV4OHZVTWNrSTZrbkRlXzE3MDUxNDM4NDk6MTcwNTE0NzQ0OV9WNA)

HotSpot在JDK1.8之前方法区就是永久代，永久代就是方法区。JDK1.8后删除了永久代，改为元空间，元空间在直接内存中。方法区就是元空间，元空间就是方法区。

创建一个线程，JVM就会为其分配一个私有内存空间，其中包括PC、虚拟机栈和本地方法栈

![img](https://gvhh8pww7cu.feishu.cn/space/api/box/stream/download/asynccode/?code=ODI3ZDg5YTQ4ZjFkZmEzZGJhOWVkODNhZGRjYjg4ZjVfS01wWTc0YjAwQVNJdU9LVDRiNGM3ZVh3OGtldFRsZ1FfVG9rZW46UlNnaGJtWUlPbzhiQk94cXh0d2NDcmxKbk1oXzE3MDUxNDM4NDk6MTcwNTE0NzQ0OV9WNA)

### 程序计数器

线程私有的，作为当前线程的行号指示器，用于记录当前虚拟机正在执行的线程指令地址。程序计数器主要有两个作用：

1. 当前线程所执行的字节码的行号指示器，通过它实现代码的流程控制，如：顺序执行、选择、循环、异常处理。
2. 在多线程的情况下，程序计数器用于记录当前线程执行的位置，当线程被切换回来的时候能够知道它上次执行的位置。

程序计数器是唯一一个不会出现 `OutOfMemoryError` 的内存区域，它的生命周期随着线程的创建而创建，随着线程的结束而死亡。

### 虚拟机栈

**栈帧****结构**：Java 虚拟机栈是由一个个栈帧组成，而每个栈帧中都拥有：局部变量表、操作数栈、动态链接、方法返回地址。

**方法调用过程（主要记）**：每一次函数调用都会有一个对应的栈帧被压入虚拟机栈，每一个函数调用结束后，都会有一个栈帧被弹出。

**局部变量****表**：是用于存放方法参数和方法内的局部变量。

**操作数栈**：用于执行方法中的操作，包括算术运算和方法调用。

每个栈帧都包含一个指向运行时常量池中该栈所属方法的符号引用，在方法调用过程中，会进行动态链接，将这个符号引用转化为直接引用。

- 部分符号引用在类加载阶段的时候就转化为直接引用，这种转化就是静态链接
- 部分符号引用在运行期间转化为直接引用，这种转化就是动态链接

Java 虚拟机栈也是线程私有的，每个线程都有各自的 Java 虚拟机栈，而且随着线程的创建而创建，随着线程的死亡而死亡。Java 虚拟机栈会出现两种错误：`StackOverFlowError` 和 `OutOfMemoryError`。

可以通过` -Xss `参数来指定每个线程的虚拟机栈内存大小：

```Plaintext
java -Xss2M
```

### 本地方法栈

虚拟机栈为虚拟机执行 `Java` 方法服务，而本地方法栈则为虚拟机使用到的 `Native` 方法服务。`Native` 方法一般是用其它语言（C、C++等）编写的。

本地方法被执行的时候，在本地方法栈也会创建一个栈帧，用于存放该本地方法的局部变量表、操作数栈、动态链接、出口信息。

### 堆

堆用于存放对象实例，是垃圾收集器管理的主要区域，因此也被称作`GC`堆。

堆可以细分为：新生代（`Eden`空间、`From Survivor`、`To Survivor`空间）和老年代。

通过 `-Xms`设定程序启动时占用内存大小，通过`-Xmx`设定程序运行期间最大可占用的内存大小。如果程序运行需要占用更多的内存，超出了这个设置值，就会抛出`OutOfMemory`异常。

```Java
java -Xms1M -Xmx2M
```

### 方法区

方法区与 Java 堆一样，是各个线程共享的内存区域，它用于存储已被虚拟机加载的类信息、常量、静态变量、即时编译器编译后的代码等数据。

对方法区进行垃圾回收的主要目标是对常量池的回收和对类的卸载。

**永久代**

方法区是 JVM  的规范，而永久代`PermGen`是方法区的一种实现方式，并且只有 `HotSpot` 有永久代。对于其他类型的虚拟机，如`JRockit`没有永久代。由于方法区主要存储类的相关信息，所以对于动态生成类的场景比较容易出现永久代的内存溢出。

**元空间**

JDK 1.8 的时候，`HotSpot`的永久代被彻底移除了，使用元空间替代。元空间的本质和永久代类似，都是对JVM规范中方法区的实现。两者最大的区别在于：元空间并不在虚拟机中，而是使用直接内存。

为什么要将永久代替换为元空间呢?

永久代内存受限于 JVM 可用内存，而元空间使用的是直接内存，受本机可用内存的限制，虽然元空间仍旧可能溢出，但是相比永久代内存溢出的概率更小。

### 运行时常量池

运行时常量池是方法区的一部分，在类加载之后，会将编译器生成的各种字面量和符号引号放到运行时常量池。在运行期间动态生成的常量，如 String 类的 intern()方法，也会被放入运行时常量池。

### 直接内存

直接内存并不是虚拟机运行时数据区的一部分，也不是虚拟机规范中定义的内存区域，但是这部分内存也被频繁地使用。而且也可能导致 OutOfMemoryError 错误出现。

NIO的Buffer提供了DirectBuffer，可以直接访问系统物理内存，避免堆内内存到堆外内存的数据拷贝操作，提高效率。DirectBuffer直接分配在物理内存中，并不占用堆空间，其可申请的最大内存受操作系统限制，不受最大堆内存的限制。

直接内存的读写操作比堆内存快，可以提升程序I/O操作的性能。通常在I/O通信过程中，会存在堆内内存到堆外内存的数据拷贝操作，对于需要频繁进行内存间数据拷贝且生命周期较短的暂存数据，都建议存储到直接内存。



## 类加载器

### 类文件结构（不重点）

Class 文件结构如下：

```Plaintext
ClassFile {
    u4             magic; //类文件的标志
    u2             minor_version;//小版本号
    u2             major_version;//大版本号
    u2             constant_pool_count;//常量池的数量
    cp_info        constant_pool[constant_pool_count-1];//常量池
    u2             access_flags;//类的访问标记
    u2             this_class;//当前类的索引
    u2             super_class;//父类
    u2             interfaces_count;//接口
    u2             interfaces[interfaces_count];//一个类可以实现多个接口
    u2             fields_count;//字段属性
    field_info     fields[fields_count];//一个类会可以有个字段
    u2             methods_count;//方法数量
    method_info    methods[methods_count];//一个类可以有个多个方法
    u2             attributes_count;//此类的属性表中的属性数
    attribute_info attributes[attributes_count];//属性表集合
}
```

主要参数如下：

- 魔数：`class`文件标志。
- 文件版本：高版本的 Java 虚拟机可以执行低版本编译器生成的类文件，但是低版本的 Java 虚拟机不能执行高版本编译器生成的类文件。
- 常量池：存放字面量和符号引用。字面量类似于 Java 的常量，如字符串，声明为`final`的常量值等。符号引用包含三类：类和接口的全限定名，方法的名称和描述符，字段的名称和描述符。
- 访问标志：识别类或者接口的访问信息，比如这个`Class`是类还是接口，是否为 `public` 或者 `abstract` 类型等等。
- 当前类的索引：类索引用于确定这个类的全限定名。

### 什么是类加载？类加载的过程？

类的加载指的是将类的`class`文件中的二进制数据读入到内存中，将其放在运行时数据区的方法区内，然后在堆区创建一个此类的对象，通过这个对象可以访问到方法区对应的类信息。

![img](https://gvhh8pww7cu.feishu.cn/space/api/box/stream/download/asynccode/?code=OWVhZThhNmI4ZGJhZWVhZjY3NjljNGI3OGY5ZTQxNWVfTUdjZFhyeUlOWEZETDM5Nm5wdXFndTRSY0IxSGVMUVdfVG9rZW46UEJjNWJrazJib1ZBZ2Z4dlBtb2NzeVVubmRyXzE3MDUxNDM4NDk6MTcwNTE0NzQ0OV9WNA)

类加载流程，有加载、验证、准备、解析、初始化这几个步骤。

**加载**

1. 通过类的全限定名获取定义此类的二进制字节流文件
2. 将字节流所代表的静态存储结构转换为方法区的运行时数据结构
3. 在内存中生成一个代表该类的`Class`对象，作为方法区类信息的访问入口

![img](https://gvhh8pww7cu.feishu.cn/space/api/box/stream/download/asynccode/?code=ZDBiYzVhN2ZlZDFiZTE3MzM0MDU0ZWQzYmNhNDdkMTNfZ0FZQmlUQmpNTlYwQ1JQZ2daNHpWVWNtOFBQREZnUGdfVG9rZW46QnZvb2JkbWM0bzdxaGF4OFVUT2M0Zkl3bmFlXzE3MDUxNDM4NDk6MTcwNTE0NzQ0OV9WNA)

加载方式：

1. 从本地文件获取
2. 从网络下载
3. 从数据库中获取
4. 从jar包或者是zip包中

**验证**

确保Class文件的字节流中包含的信息符合虚拟机规范，保证在运行后不会危害虚拟机自身的安全。主要包括四种验证：文件格式验证，元数据验证，字节码验证，符号引用验证。

- 文件格式验证：验证读进来的字节流是否符合Class标准格式。
- 元数据验证：格式对了之后，验证一下里边的数据合不合理。比如：这个类是否有父类（除了java.lang.Object之外，所有的类都应当有父类）。
- 字节码验证：分析类的方法体（Class文件中的Code属性），确保方法在运行时不会危害虚拟机。
- 符号引用验证（发生在解析阶段）：检查常量池中引用的外部类是否存在，是否可以正常访问。

暂时无法在飞书文档外展示此内容

**准备**

准备阶段主要是为类的静态变量赋值的过程

第一种,没有被final修饰，准备阶段后value=0

```Java
private static int value =123
```

第二种，被final修饰了，准备阶段后value=123

```Java
private final static int value 123
```

**解析**

虚拟机将常量池内的符号引用替换为直接引用的过程。

符号引用用于描述目标，符号可以是任何形式的符号

直接引用直接指向目标的地址。

**初始化**

目的：开始执行java类中定义的代码，调用类构造器的过程

**初始化步骤**

1. 如果这个类还没有被加载和连接，那么程序加载和连接这个类
2. 如果这个类的父类还没被初始化，先初始化这个父类
3. 如果这个类中有初始化语句，那么一次执行初始化语句

**初始化时机**

1. 被标明为启动类的类
2. new一个对象
3. 反射的时候
4. 初始化某个类的子类，父类也会被初始化
5. 调用某个类的静态方法
6. 访问某个类或接口的静态变量

### 什么是类加载器，类加载器有哪些?

实现通过类的全限定名获取该类的二进制字节流的代码块叫做类加载器。

示例：

1. 创建一个自己的加载器
2. 通过自定义加载器加载User类，生成一个对象示例selfLoader
3. 判断selfLoader是否是User的一个实例（注意：User是通过系统加载器加载的）

```Java
public class Main{
    public static void main(stringl] args) throws Exception{
        // 1.自定义类加载器
         
         
        ClassLoader myLoader = new ClassLoader (){
        public Class<?> loadClass(string name) throws ClassNotFoundException{
        try {
            String fileName = name.substring(name.lastIndexof(",") + 1) + ".class";
            Inputstream is = getClass().getResourceAsStream(fileName);
            if (is == null) {
                return super.loadclass(name);
            }
            byte[] b = new byte[is.available()];
            is.read(b);
            return defineClass(name, b,0,b.length);
            }catch (IOException e) {
                throw new ClassNotFoundException(name);
            }
        }
      };
      // 2.利用自定义类加载器加载user类，并生成一个对象实例: 
      Object selfLoadUser = myLoader.loadClass("User"),newInstance();
      System.out.println(selfLoadUser.getClass());
      // 3.判断selfLoaduser 是否为user美的实例(注意: 这里的user是系统加载器加载的)
      System.out.println(selfLoaduser instanceof User);
}
```

结果：

![img](https://gvhh8pww7cu.feishu.cn/space/api/box/stream/download/asynccode/?code=YTcxNWI0NmZlMWFmMzY2OGY2NjBkNGZjYWY1OGIzZjdfb3p1UDluSDdqZEUzalJ2VkZTbjVqY0RxOXltelIyMFJfVG9rZW46VTZOTGJnVzgxb1FpQzF4WXpzMWN6TFFPblpkXzE3MDUxNDM4NDk6MTcwNTE0NzQ0OV9WNA)

分析原因：

User是系统加载器加载的，selfLoader是通过自定义加载器加载的

**主要有一下四种类加载器:**

- 启动类加载器：用来加载 Java 核心类库，无法被 Java 程序直接引用。
- 扩展类加载器：它用来加载 Java 的扩展库。Java 虚拟机的实现会提供一个扩展库目录。该类加载器在此目录里面查找并加载 Java 类。
- 系统类加载器：它根据应用的类路径来加载 Java 类。可通过`ClassLoader.getSystemClassLoader()`获取它。
- 自定义类加载器：通过继承`java.lang.ClassLoader`类的方式实现。

![img](https://gvhh8pww7cu.feishu.cn/space/api/box/stream/download/asynccode/?code=ZWRkYzljNmE2YzZmMGM3NTljOTkyYjY0ZmU1YTgwMDBfNEFEUEYwY0lVbUM1YWw1cXE1RTc1U3JUT3RJZDhKd2RfVG9rZW46QU5uZ2I3M3dib3E4U0F4QUNIR2NpclIwbmVkXzE3MDUxNDM4NDk6MTcwNTE0NzQ0OV9WNA)

### 什么是双亲委派模型？

一个类加载器收到一个类的加载请求时，它首先不会自己尝试去加载它，而是把这个请求委派给父类加载器去完成，这样层层委派，因此所有的加载请求最终都会传送到顶层的启动类加载器中，只有当父类加载器反馈自己无法完成这个加载请求时，子加载器才会尝试自己去加载。

双亲委派模型的具体实现代码在 `java.lang.ClassLoader`中，此类的 `loadClass()` 方法运行过程如下：先检查类是否已经加载过，如果没有则让父类加载器去加载。当父类加载器加载失败时抛出 `ClassNotFoundException`，此时尝试自己去加载。源码如下：

```Java
public abstract class ClassLoader {
    // The parent class loader for delegationprivate final ClassLoader parent;

    public Class<?> loadClass(String name) throws ClassNotFoundException {
        return loadClass(name, false);
    }

    protected Class<?> loadClass(String name, boolean resolve) throws ClassNotFoundException {
        synchronized (getClassLoadingLock(name)) {
            // First, check if the class has already been loaded
            Class<?> c = findLoadedClass(name);
            if (c == null) {
                try {
                    if (parent != null) {
                        c = parent.loadClass(name, false);
                    } else {
                        c = findBootstrapClassOrNull(name);
                    }
                } catch (ClassNotFoundException e) {
                    // ClassNotFoundException thrown if class not found// from the non-null parent class loader
                }

                if (c == null) {
                    // If still not found, then invoke findClass in order// to find the class.
                    c = findClass(name);
                }
            }
            if (resolve) {
                resolveClass(c);
            }
            return c;
        }
    }

    protected Class<?> findClass(String name) throws ClassNotFoundException {
        throw new ClassNotFoundException(name);
    }
}
```

### 为什么需要双亲委派模型？

**双亲委派模型的好处**： 如果没有双亲委派模型而是由各个类加载器自行加载的话，如果用户编写了一个`java.lang.Object`的同名类并放在`ClassPath`中，多个类加载器都去加载这个类到内存中，系统中将会出现多个不同的`Object`类，那么类之间的比较结果及类的唯一性将无法保证。

**核心思想**：如果不存在的话，那么每个类都会去加载这个列，导致出现很多，类的唯一性无法确定

### 类的实例化顺序？

1. 父类中的`static`代码块，当前类的`static`代码块
2. 父类的普通代码块（指的是一些变量）
3. 父类的构造函数
4. 当前类普通代码块
5. 当前类的构造函数

![img](https://gvhh8pww7cu.feishu.cn/space/api/box/stream/download/asynccode/?code=NjE1ZGJlZTY4YzdjMjBhNjQyZjJiNTMyZGE2ZDZmZmNfVWlsTlJIazlDTUV3RnVYYWNQWGMyRnI1V1F4aUp1YXpfVG9rZW46THlpUGJWUTdPbzJaNnp4MHpVaGMyNElUblJiXzE3MDUxNDM4NDk6MTcwNTE0NzQ0OV9WNA)

### 类既然有加载，那么什么情况下类会被卸载？

需要同时满足以下 3 个条件类才可能会被卸载 ：

- 该类所有的实例都已经被回收。
- 加载该类的类加载器已经被回收。
- 该类对应的 `java.lang.Class` 对象没有在任何地方被引用，无法在任何地方通过反射访问该类的方法。

虚拟机可以对满足上述 3 个条件的类进行回收，但不一定会进行回收。

### 强引用、软引用、弱引用、虚引用是什么，有什么区别？

**强引用**：在程序中普遍存在的引用赋值，类似`Object obj = new Object()`这种引用关系。只要强引用关系还存在，垃圾收集器就永远不会回收掉被引用的对象。

**软引用**：如果内存空间足够，垃圾回收器就不会回收它，如果内存空间不足了，就会回收这些对象的内存。

```Java
//软引用
SoftReference<String> softRef = new SoftReference<String>(str);
```

**弱引用**：在进行垃圾回收时，不管当前内存空间足够与否，都会回收只具有弱引用的对象。

```Java
//弱引用
WeakReference<String> weakRef = new WeakReference<String>(str);
```

**虚引用**：虚引用并不会决定对象的生命周期。如果一个对象仅持有虚引用，那么它就和没有任何引用一样，在任何时候都可能被垃圾回收。虚引用主要是为了能在对象被收集器回收时收到一个系统通知。

```Java
ReferenceQueue<Object> queue = new ReferenceQueue<>();
PhantomReference<Object> phantom = new PhantomReference<Object>(new Object(), queue);
```

虚引用创建时必须搭配ReferenceQueue。

一个对象如果被引用，且最高级别是虚引用，就等于没有被引用，发生gc时不管内存够不够都会被回收。

虚引用看起来和弱引用没啥区别，只是必须搭配ReferenceQueue。用虚引用的目的一般是跟踪对象被回收的活动。

### Minor GC 和 Full GC的区别？

- Minor GC：回收新生代，因为新生代对象存活时间很短，因此 `Minor GC`会频繁执行，执行的速度一般也会比较快。
- Full GC：回收老年代和新生代，老年代的对象存活时间长，因此 `Full GC` 很少执行，执行速度会比 `Minor GC` 慢很多。

### Full GC 的触发条件？

对于 Minor GC，其触发条件比较简单，当 Eden 空间满时，就将触发一次 Minor GC。而 Full GC 触发条件相对复杂，有以下情况会发生 full GC：

**调用 System.gc()**

- 只是建议虚拟机执行 Full GC，但是虚拟机不一定真正去执行。不建议使用这种方式，而是让虚拟机管理内存。

**老年代空间不足**

- 老年代空间不足的常见场景为前文所讲的大对象直接进入老年代、长期存活的对象进入老年代等。为了避免以上原因引起的 Full GC，应当尽量不要创建过大的对象以及数组。除此之外，可以通过 -Xmn 参数调大新生代的大小，让对象尽量在新生代被回收掉，不进入老年代。还可以通过 -XX:MaxTenuringThreshold 调大对象进入老年代的年龄，让对象在新生代多存活一段时间。

**空间分配担保失败**

- 使用复制算法的 Minor GC 需要老年代的内存空间作担保，如果担保失败会执行一次 Full GC。

**JDK 1.7 及以前的永久代空间不足**

- 在 JDK 1.7 及以前，HotSpot 虚拟机中的方法区是用永久代实现的，永久代中存放的为一些 Class 的信息、常量、静态变量等数据。当系统中要加载的类、反射的类和调用的方法较多时，永久代可能会被占满，在未配置为采用 CMS GC 的情况下也会执行 Full GC。如果经过 Full GC 仍然回收不了，那么虚拟机会抛出 java.lang.OutOfMemoryError。

### 常用的 JVM 调优的命令都有哪些？

jps：列出本机所有 Java 进程的进程号。

常用参数如下：

- `-m` 输出`main`方法的参数
- `-l` 输出完全的包名和应用主类名
- `-v` 输出`JVM`参数

```Plaintext
jps -lvm
//output//4124 com.zzx.Application -javaagent:E:\IDEA2019\lib\idea_rt.jar=10291:E:\IDEA2019\bin -Dfile.encoding=UTF-8
```

jstack：查看某个 Java 进程内的线程堆栈信息。使用参数`-l`可以打印额外的锁信息，发生死锁时可以使用`jstack -l pid`观察锁持有情况。

```Shell
jstack -l 4124 | more
```

输出结果如下：

```Java
"http-nio-8001-exec-10" #40 daemon prio=5 os_prio=0 tid=0x000000002542f000 nid=0x4028 waiting on condition [0x000000002cc9e000]
   java.lang.Thread.State: WAITING (parking)
        at sun.misc.Unsafe.park(Native Method)
        - parking to wait for  <0x000000077420d7e8> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
        at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
        at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(AbstractQueuedSynchronizer.java:2039)
        at java.util.concurrent.LinkedBlockingQueue.take(LinkedBlockingQueue.java:442)
        at org.apache.tomcat.util.threads.TaskQueue.take(TaskQueue.java:103)
        at org.apache.tomcat.util.threads.TaskQueue.take(TaskQueue.java:31)
        at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1074)
        at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
        at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
        at org.apache.tomcat.util.threads.TaskThread$WrappingRunnable.run(TaskThread.java:61)
        at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
        - None
```

`WAITING (parking)`指线程处于挂起中，在等待某个条件发生，来把自己唤醒。

jstat：用于查看虚拟机各种运行状态信息（类装载、内存、垃圾收集等运行数据）。使用参数`-gcuitl`可以查看垃圾回收的统计信息。

```Shell
jstat -gcutil 4124
  S0     S1     E      O      M     CCS    YGC     YGCT    FGC    FGCT     GCT
  0.00   0.00  67.21  19.20  96.36  94.96     10    0.084     3    0.191    0.275
```

参数说明：

- S0：`Survivor0`区当前使用比例
- S1：`Survivor1`区当前使用比例
- E：`Eden`区使用比例
- O：老年代使用比例
- M：元数据区使用比例
- CCS：压缩使用比例
- YGC：年轻代垃圾回收次数
- FGC：老年代垃圾回收次数
- FGCT：老年代垃圾回收消耗时间
- GCT：垃圾回收消耗总时间

jmap：查看堆内存快照。通过`jmap`命令可以获得运行中的堆内存的快照，从而可以对堆内存进行离线分析。

查询进程4124的堆内存快照，输出结果如下：

```Shell
>jmap -heap 4124
Attaching to process ID 4124, please wait...
Debugger attached successfully.
Server compiler detected.
JVM version is 25.221-b11

using thread-local object allocation.
Parallel GC with 6 thread(s)

Heap Configuration:
   MinHeapFreeRatio         = 0
   MaxHeapFreeRatio         = 100
   MaxHeapSize              = 4238344192 (4042.0MB)
   NewSize                  = 88604672 (84.5MB)
   MaxNewSize               = 1412431872 (1347.0MB)
   OldSize                  = 177733632 (169.5MB)
   NewRatio                 = 2
   SurvivorRatio            = 8
   MetaspaceSize            = 21807104 (20.796875MB)
   CompressedClassSpaceSize = 1073741824 (1024.0MB)
   MaxMetaspaceSize         = 17592186044415 MB
   G1HeapRegionSize         = 0 (0.0MB)

Heap Usage:
PS Young Generation
Eden Space:
   capacity = 327155712 (312.0MB)
   used     = 223702392 (213.33922576904297MB)
   free     = 103453320 (98.66077423095703MB)
   68.37795697725736% used
From Space:
   capacity = 21495808 (20.5MB)
   used     = 0 (0.0MB)
   free     = 21495808 (20.5MB)
   0.0% used
To Space:
   capacity = 23068672 (22.0MB)
   used     = 0 (0.0MB)
   free     = 23068672 (22.0MB)
   0.0% used
PS Old Generation
   capacity = 217579520 (207.5MB)
   used     = 41781472 (39.845916748046875MB)
   free     = 175798048 (167.65408325195312MB)
   19.20285144484187% used

27776 interned Strings occupying 3262336 bytes.
```

### 对象了解吗？

Java 内存中的对象由以下三部分组成：对象头、实例数据和对齐填充字节。

而对象头由以下三部分组成：mark word、指向类信息的指针和数组长度（数组才有）。

- `mark word`包含：对象的哈希码、分代年龄和锁标志位。
- 对象的实例数据就是 Java 对象的属性和值。
- 对齐填充字节：因为JVM要求对象占的内存大小是 8bit 的倍数，因此后面有几个字节用于把对象的大小补齐至 8bit 的倍数。

内存对齐的主要作用是：

1. 平台原因：不是所有的硬件平台都能访问任意地址上的任意数据的；某些硬件平台只能在某些地址处取某些特定类型的数据，否则抛出硬件异常。
2. 性能原因：经过内存对齐后，CPU的内存访问速度大大提升。

实例数据：实例数据对象的成员变量的实际存储区域，它包含了对象的各个字段的值。实例数据的大小取决于对象所包含的字段数量和字段类型。

### main方法执行过程

1. 以下是示例代码：

```Java
public class Application {
    public static void main(String[] args) {
        Person p = new Person("大彬");
        p.getName();
    }
}

class Person {
    public String name;

    public Person(String name) {
        this.name = name;
    }

    public String getName() {
        return this.name;
    }
}
```

执行`main`方法的过程如下:

1. 编译`Application.java`后得到 `Application.class` 后，执行这个`class`文件，系统会启动一个 `JVM` 进程，从类路径中找到一个名为 `Application.class` 的二进制文件，将 `Application` 类信息加载到运行时数据区的方法区内，这个过程叫做类的加载。
2. JVM 找到 `Application` 的主程序入口，执行`main`方法。
3. `main`方法的第一条语句为 `Person p = new Person("大彬") `，就是让 JVM 创建一个`Person`对象，但是这个时候方法区中是没有 `Person` 类的信息的，所以 JVM 马上加载 `Person` 类，把 `Person` 类的信息放到方法区中。
4. 加载完 `Person` 类后，JVM 在堆中分配内存给 `Person` 对象，然后调用构造函数初始化 `Person` 对象，这个 `Person` 对象持有指向方法区中的 Person 类的类型信息的引用。
5. 执行`p.getName()`时，JVM 根据 p 的引用找到 p 所指向的对象，然后根据此对象持有的引用定位到方法区中 `Person` 类的类型信息的方法表，获得 `getName()` 的字节码地址。
6. 执行`getName()`方法。

## 对象的声明周期

### 对象的创建过程

![img](https://gvhh8pww7cu.feishu.cn/space/api/box/stream/download/asynccode/?code=NDAwN2Q2OTY2N2E1ZDA2YjA2ZTgxMWJkYjljZDI4MjhfcEpkS3dlZXJYdlhob2hrVnd1bVVPRkJtZXJqSWVCdjBfVG9rZW46QXpkcGJLMnZXb25sUkx4S3JvUGNod3kzbmNiXzE3MDUxNDM4NDk6MTcwNTE0NzQ0OV9WNA)

1. **类加载检查**：JVM遇到一条new指令时，先检查能不能在常量池中定位到该类的符号引用，并检查这个符号引用代表的类是否已被加载、解析和初始化。如果没有就要先进行类加载。类已被加载就通过检查。
2. **分配****内存**：首先JVM会在堆中按照**指针碰撞或空闲列表的方式**为对象划分出一块空间，选择哪种方式会根据垃圾收集器的算法而定。此外，内存分配还要保证线程安全，JVM采用**CAS****+失败重试或TLAB**的方式保证线程安全。
   1.  **方法**：1. 指针碰撞（内存连续）2. 空闲列表（内存不连续）

   2.  **流程**：先通过TLAB的方式分配，如果分配不到，在通过CAS操作进行线程的分配

   3. CAS+失败重试：乐观锁的一种实现，每次占用资源不加锁，而是不断尝试占用。
   4. TLAB：线程创建时会预先分配一块内存，称为TLAB，专门用来存放该线程运行过程中创建的对象，而TLAB满了时，采用上述CAS在堆的其它内存中分配
3. **初始化：**分配到的内存空间都初始化为零值，通过这个操作保证了对象的字段可以不赋初始值就直接使用，程序能访问到这些字段的数据类型所对应的零值。
4. **设置对象头：（暂时不用太记）**
   1. 在对象头中设置这个对象是哪个类的实例、
   2. 如何才能找到类的元数据信息、
   3. 对象的哈希码、
   4. 对象的 GC 分代年龄、
   5. 是否启用偏向锁等信息。
5. **执行init方法：**初始化对象，即按照程序员写的构造方法给对象进行初始化。

### 对象内存首先分配到内存的哪里呢，又是怎么进入老年区的

流程图

年轻代进入老年代的几种情况

1. minorGC达到15次
   1. 当survivor区内存空间不够用的话会像old区借一部分空间，如果一直都不被回收，超过了15次，那么就进入old区
2. 大对象直接进入老年代
3. 新生代存过对象太多无法保存，将进入老年代
4. 动态判断年龄，将符合年龄的直接进入老年代

![img](https://gvhh8pww7cu.feishu.cn/space/api/box/stream/download/asynccode/?code=Y2Y2ZDU1M2VhYzliMDVjZTNlMzA5NmFiZjc1YzUxNTRfU2MycndYWG9jUWtBbHBSQ1ZaUTVRTVY1aXdkbERRc3BfVG9rZW46QVN6TWJlc29ab2dWbFh4UlNDemNlZmFnbkJFXzE3MDUxNDM4NDk6MTcwNTE0NzQ0OV9WNA)

### 正所谓有对象的创建，那么就会有死亡，具体是如何判断对象死亡的呢？

换种问法，如果对象已经死亡了，怎么找到这些死亡的对象的呢，起主要作用点的就是垃圾收集器，总共两种办法找到死亡的对象。

对堆垃圾回收前的第一步就是要判断那些对象已经死亡（即不再被任何途径引用的对象）。判断对象是否存活有两种方法：引用计数法和可达性分析。

**引用计数法**

给对象中添加一个引用计数器，每当有一个地方引用它，计数器就加 1；当引用失效，计数器就减 1；任何时候计数器为 0 的对象就是不可能再被使用的。

这种方法很难解决对象之间相互循环引用的问题。比如下面的代码，`obj1` 和 `obj2` 互相引用，这种情况下，引用计数器的值都是1，不会被垃圾回收。

```Java
public class ReferenceCount {
    Object instance = null;
    public static void main(String[] args) {
        ReferenceCount obj1 = new ReferenceCount();
        ReferenceCount obj2 = new ReferenceCount();
        obj1.instance = obj2;
        obj2.instance = obj1;
        obj1 = null;
        obj2 = null;
    }
}
```

**可达性分析**

从跟对象出发（比如main方法），查找所有可达对象的过程，如果一个对象无法通过任何路径与跟对象连接，那么就认为他是不可达的，可以被回收。

### 可作为GC Roots的对象有哪些（不是很重点，一般不会问）？

GCRoots定义：是指垃圾回收器在执行部分收集时的起点（根对象）

1. 虚拟机栈中引用的对象
2. 本地方法栈中Native方法引用的对象
3. 方法区中类静态属性引用的对象
4. 方法区中常量引用的对象

### 有哪些垃圾回收器？

垃圾回收器主要分为以下几种：`Serial、ParNew、Parallel Scavenge、Serial Old、Parallel Old、CMS、G1`。

重点：serial收集器，CMS收集器，G1收集器

![img](https://gvhh8pww7cu.feishu.cn/space/api/box/stream/download/asynccode/?code=ZTBhMjIzYjNmNTRmZjVkYTBhN2FjNGQ3NTEzMDQ2YWJfRzlXVEFlZE9VbXBZUGpmOEM2YlJodG1JTTJTd3BESG1fVG9rZW46Qnl6M2JlUEFIb3R1TjR4bzU3d2NOUk5xbk9iXzE3MDUxNDM4NDk6MTcwNTE0NzQ0OV9WNA)

这7种垃圾收集器的特点（暂时先不用看）：

**Serial 收集器**

单线程收集器，使用一个垃圾收集线程去进行垃圾回收，在进行垃圾回收的时候必须暂停其他所有的工作线程（ `Stop The World` ），直到它收集结束。

特点：简单高效；内存消耗小；没有线程交互的开销，单线程收集效率高；需暂停所有的工作线程，用户体验不好。

![img](https://gvhh8pww7cu.feishu.cn/space/api/box/stream/download/asynccode/?code=ZDVkZmQwYjk0ZDMzYWIzZDVjYmVlYWM2MmRiZDM5MGFfR0NXTEwySVcxSERHaTZVVWVGa1loTEwzRVJ4U3dLdUdfVG9rZW46RUpWY2JJd2Eyb2tlQjZ4SEpKQmNhc0M4bnhnXzE3MDUxNDM4NDk6MTcwNTE0NzQ0OV9WNA)

**ParNew 收集器**

`Serial`收集器的多线程版本，除了使用多线程进行垃圾收集外，其他行为、参数与 `Serial` 收集器基本一致。

**Parallel Scavenge** **收集器**

新生代收集器，基于复制清除算法实现的收集器。特点是吞吐量优先，能够并行收集的多线程收集器，允许多个垃圾回收线程同时运行，降低垃圾收集时间，提高吞吐量。所谓吞吐量就是 CPU 中用于运行用户代码的时间与 CPU 总消耗时间的比值（`吞吐量 = 运行用户代码时间 /（运行用户代码时间 + 垃圾收集时间）`）。`Parallel Scavenge` 收集器关注点是吞吐量，高效率的利用 CPU 资源。`CMS` 垃圾收集器关注点更多的是用户线程的停顿时间。

`Parallel Scavenge`收集器提供了两个参数用于精确控制吞吐量，分别是控制最大垃圾收集停顿时间的`-XX：MaxGCPauseMillis`参数以及直接设置吞吐量大小的`-XX：GCTimeRatio`参数。

- `-XX：MaxGCPauseMillis`参数的值是一个大于0的毫秒数，收集器将尽量保证内存回收花费的时间不超过用户设定值。
- `-XX：GCTimeRatio`参数的值大于0小于100，即垃圾收集时间占总时间的比率，相当于吞吐量的倒数。

**Serial Old 收集器**

`Serial` 收集器的老年代版本，单线程收集器，使用标记整理算法。

**Parallel Old 收集器**

`Parallel Scavenge` 收集器的老年代版本。多线程垃圾收集，使用标记整理算法。

**CMS** **收集器**

![img](https://gvhh8pww7cu.feishu.cn/space/api/box/stream/download/asynccode/?code=MDA3NjVjYmE5Njc0ODgwZjM2NDY1ZjE2ZmM4MzM3OGFfYVNtaDY1Vmc3RmlQTUJiUmlIWGRQSWJUczJqZlp0ZXpfVG9rZW46RDNJZmI3Tldmb083M3V4dmJmQWNxckJEblpjXzE3MDUxNDM4NDk6MTcwNTE0NzQ0OV9WNA)

`Concurrent Mark Sweep` ，并发标记清除，追求获取最短停顿时间，实现了让垃圾收集线程与用户线程基本上同时工作。

**面试回答，其余为理解或者说是拓展**

`CMS` 垃圾回收基于标记清除算法实现，整个过程分为四个步骤：

- 初始标记： 暂停所有用户线程（`Stop The World`），记录直接与 `GC Roots` 直接相连的对象 。
- 并发标记：从`GC Roots`开始对堆中对象进行可达性分析，找出存活对象，耗时较长，但是不需要停顿用户线程。
- 重新标记： 在并发标记期间对象的引用关系可能会变化，需要重新进行标记。此阶段也会暂停所有用户线程。
- 并发清除：清除标记对象，清除所有被标记为垃圾的对象，这个阶段也是可以与用户线程同时并发的。

在整个过程中，耗时最长的是并发标记和并发清除阶段，这两个阶段垃圾收集线程都可以与用户线程一起工作，所以从总体上来说，`CMS`收集器的内存回收过程是与用户线程一起并发执行的。

优点：并发收集，停顿时间短。

缺点：

- 标记清除算法导致收集结束有大量空间碎片。
- 产生浮动垃圾，在并发清理阶段用户线程还在运行，会不断有新的垃圾产生，这一部分垃圾出现在标记过程之后，`CMS`无法在当次收集中回收它们，只好等到下一次垃圾回收再处理；

**G1收集器**

jdk9之后默认是G1垃圾回收器。

G1垃圾收集器的目标是在不同应用场景中追求**高****吞吐量****和低停顿**之间的最佳平衡。

G1将整个堆分成相同大小的分区（`Region`），有四种不同类型的分区：`Eden、Survivor、Old和Humongous`。分区大小可以通过`-XX:G1HeapRegionSize`参数指定。`Humongous`区域用于存储大对象。G1规定只要大小超过了一个分区容量一半的对象就认为是大对象。

G1 收集器对各个分区回收所获得的空间大小和回收所需时间的经验值进行排序，得到一个优先级列表，每次根据用户设置的最大回收停顿时间，优先回收价值最大的分区。

**特点**：可以由用户指定期望的垃圾收集停顿时间。

G1 收集器的回收过程分为以下几个步骤：

- 初始标记。暂停所有其他线程，记录直接与 `GC Roots` 直接相连的对象，耗时较短 。
- 并发标记。从`GC Roots`开始对堆中对象进行可达性分析，找出要回收的对象，耗时较长，不过可以和用户程序并发执行。
- 最终标记。需对其他线程做短暂的暂停，用于处理并发标记阶段对象引用出现变动的区域。
- 筛选回收。对各个分区的回收价值和成本进行排序，根据用户所期望的停顿时间来制定回收计划，然后把决定回收的分区的存活对象复制到空的分区中，再清理掉整个旧的分区的全部空间。这里的操作涉及存活对象的移动，会暂停用户线程，由多条收集器线程并行完成。

![img](https://gvhh8pww7cu.feishu.cn/space/api/box/stream/download/asynccode/?code=NDc4MDUxZGE4NDI1ODk5NWU5NTAxY2UwNWRlYjYxOTRfVjFaSUtGT2N2b3BkNHRGSEZMazZRWFRHYTNIT0VCVEdfVG9rZW46SlpmbmJ3WThQbzkwS3J4eG1KOWNnaGx4bnhQXzE3MDUxNDM4NDk6MTcwNTE0NzQ0OV9WNA)

### 垃圾回收算法有哪些？

既然有垃圾回收器，那么他们的底层原理一定是基于一些垃圾回收算法，下面介绍一下垃圾回收算法

垃圾回收算法有四种，分别是标记清除法、标记整理法、复制算法、分代收集算法。

**标记清除算法**

首先利用可达性去遍历内存，把存活对象和垃圾对象进行标记。标记结束后统一将所有标记垃圾的对象回收掉。这种垃圾回收算法效率较低，并且会产生大量不连续的空间碎片。

![img](https://gvhh8pww7cu.feishu.cn/space/api/box/stream/download/asynccode/?code=ZDFiN2I0MDdlNzFkN2M4OTE4OTQ1ZjhlYjlhZDQ5OGVfZG1qdGdGYlRBNFNUMDhYMHpyb3k5cXphcUpoQ01LcEJfVG9rZW46RmRCRmJLVExMb29Gc0F4REdTUGNobVRDblRjXzE3MDUxNDM4NDk6MTcwNTE0NzQ0OV9WNA)

**复制清除算法**

半区复制，用于新生代垃圾回收。将内存分为大小相同的两块，每次使用其中的一块。当这一块的内存使用完后，就将还存活的对象复制到另一块去，然后再把使用的空间一次清理掉。

特点：实现简单，运行高效，但可用内存缩小为了原来的一半，浪费空间。

![img](https://gvhh8pww7cu.feishu.cn/space/api/box/stream/download/asynccode/?code=NjQ5ZmU2ODgwMTgwY2RlNzViZjlmYjBmMWM0MDgwMjFfZHpJN09udDB3bVU1Nkc0SGZHZExLQjJpbzBqUW1jejVfVG9rZW46T0JyQmJLeFJkb0hiQ1B4SHZkNmNhUnpEbkRlXzE3MDUxNDM4NDk6MTcwNTE0NzQ0OV9WNA)

**标记整理算法**

根据老年代的特点提出的一种标记算法，标记过程仍然与`标记-清除`算法一样，但后续步骤不是直接对可回收对象进行清理，而是让所有存活的对象都向一端移动，然后直接清理掉边界以外的内存。

![img](https://gvhh8pww7cu.feishu.cn/space/api/box/stream/download/asynccode/?code=YTZhNWNmMWNhNzA0MmRhYzdjNTZmYzNmNTA3YTM2MGRfM2lLMlJKeHN0NUo3ajI0RXlhUWZNNmsweFRhakY0SWlfVG9rZW46SnFrMGJwS0Nqb0Y1dXp4ZzhNSGNDdWVubk9lXzE3MDUxNDM4NDk6MTcwNTE0NzQ0OV9WNA)

**分类收集算法**

根据各个年代的特点采用最适当的收集算法。

一般将堆分为新生代和老年代。

- 新生代使用复制算法
- 老年代使用标记清除算法或者标记整理算法

在新生代中，每次垃圾收集时都有大批对象死去，只有少量存活，使用复制算法比较合适，只需要付出少量存活对象的复制成本就可以完成收集。老年代对象存活率高，适合使用标记-清理或者标记-整理算法进行垃圾回收。

## 其余

### 如何排查 OOM 的问题？

排查 OOM 的方法：

- 增加JVM参数 `-XX:+HeapDumpOnOutOfMemoryError` 和`-XX:HeapDumpPath=/tmp/heapdump.hprof`，当 OOM 发生时自动 dump 堆内存信息到指定目录；
- jstat 查看监控 JVM 的内存和 GC 情况，评估问题大概出在什么区域；
- 使用 MAT 工具载入 dump 文件，分析大对象的占用情况 。

### GC是什么？为什么要GC？

GC 是垃圾收集的意思（Gabage Collection）。内存处理是编程人员容易出现问题的地方，忘记或者错误的内存回收会导致程序的不稳定甚至崩溃，Java 提供的 GC 功能可以自动监测对象是否超过作用域从而达到自动回收内存的目的。

### Java的对象是如何被定位到的呢（不重点）

Java 程序通过栈上的 reference 数据来操作堆上的具体对象。对象的访问方式由虚拟机实现而定，目前主流的访问方式有使用句柄和直接指针两种：

- 如果使用句柄的话，那么 Java 堆中将会划分出一块内存来作为句柄池，reference 中存储的就是对象的句柄地址，而句柄中包含了对象实例数据与类型数据各自的具体地址信息。使用句柄来访问的最大好处是 reference 中存储的是稳定的句柄地址，在对象被移动时只会改变句柄中的实例数据指针，而 reference 本身不需要修改。
- 直接指针。reference 中存储的直接就是对象的地址。对象包含到对象类型数据的指针，通过这个指针可以访问对象类型数据。使用直接指针访问方式最大的好处就是访问对象速度快，它节省了一次指针定位的时间开销，虚拟机hotspot主要是使用直接指针来访问对象。

### 说一下堆栈的区别？

1. 堆的物理地址分配是不连续的，性能较慢；栈的物理地址分配是连续的，性能相对较快。
2. 堆存放的是对象的实例和数组；栈存放的是局部变量，操作数栈，返回结果等。
3. 堆是线程共享的；栈是线程私有的。

### 什么情况下会发生栈溢出？

- 当线程请求的栈深度超过了虚拟机允许的最大深度时，会抛出`StackOverFlowError`异常。这种情况通常是因为方法递归没终止条件。
- 新建线程的时候没有足够的内存去创建对应的虚拟机栈，虚拟机会抛出`OutOfMemoryError`异常。比如线程启动过多就会出现这种情况。

### **✅**JVM的运行时内存区域是怎样的？

![img](https://gvhh8pww7cu.feishu.cn/space/api/box/stream/download/asynccode/?code=N2I3NmE5MjMwNDFkNTUxMjcxMzVmZTJhNjYxZDE2MWRfbUZhUWozYXBaZVJVVlk3WVA0RUVvM1M4VUFhaU9hRVlfVG9rZW46R2lpOWJPSnFPb0tSZDl4UGNVUGNqTmppbnBlXzE3MDUxNDM4NDk6MTcwNTE0NzQ0OV9WNA)

**程序计数器**：一个只读的存储器，用于记录Java虚拟机正在执行的字节码指令的地址。它是线程私有的，为每个线程维护一个独立的程序计数器，用于指示下一条将要被执行的字节码指令的位置。它保证线程执行一个字节码指令以后，才会去执行下一个字节码指令。 **Java虚拟机栈**：一种线程私有的存储器，用于存储Java中的局部变量。根据Java虚拟机规范，每次方法调用都会创建一个栈帧，该栈帧用于存储局部变量，操作数栈，动态链接，方法出口等信息。当方法执行完毕之后，这个栈帧就会被弹出，变量作用域就会结束，数据就会从栈中消失。 **本地方法栈**：本地方法栈是一种特殊的栈，它与Java虚拟机栈有着相同的功能，但是它支持本地代码（ Native Code ）的执行。本地方法栈中存放本地方法（ Native Method ）的参数和局部变量，以及其他一些附加信息。这些本地方法一般是用C等本地语言实现的，虚拟机在执行这些方法时就会通过本地方法栈来调用这些本地方法。 **Java堆**：是存储对象实例的运行时内存区域。它是虚拟机运行时的内存总体的最大的一块，也一直占据着虚拟机内存总量的一大部分。Java堆由Java虚拟机管理，用于存放对象实例，是几乎所有的对象实例都要在上面分配内存。此外，Java堆还用于垃圾回收，虚拟机发现没有被引用的对象时，就会对堆中对象进行垃圾回收，以释放内存空间。 **方法区**：用于存储已被加载的类信息、常量、静态变量、即时编译后的代码等数据的内存区域。每加载一个类，方法区就会分配一定的内存空间，用于存储该类的相关信息，这部分空间随着需要而动态变化。方法区的具体实现形式可以有多种，比如堆、永久代、元空间等。 **运行时常量池**：是方法区的一部分。用于存储编译阶段生成的信息，主要有**字面量****和符号引用常量**两类。其中符号引用常量包括了类的全限定名称、字段的名称和描述符、方法的名称和描述符。

## JVM调优