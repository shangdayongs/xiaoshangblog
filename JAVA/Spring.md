# Spring相关知识
## Spring

### AOP

是Spring中的一个重要框架，用于解决系统中横切关注点问题。所谓横切关注点就是分散在各个模块中，与业务逻辑不相关的代码，例如日志记录，事务管理，权限控制等。

Spring AOP 采用代理模式实现，它通过运行期间动态代理目标对象，将横切关注点织入到系统中，从而实现横切关注点和业务代码的分离。主要有几个概念：

1. 切面：切面其实是一个类，它包含了一组横切关注点和相应的逻辑，一个切面通常会跨越多个对象。因此它不仅定义了多个横切关注点，还定义了横切关注点和业务逻辑的关系。
2. 连接点：在程序运行期间可以插入的点，例如方法调用，异常抛出
3. 切入点：切入点是所有连接点的集合，它定义了在哪些连接点上应用切面。例如所有的方法调用
4. 通知：通知是切入点在特定连接点执行的代码，有前置通知，后置通知，返回通知，异常通知和环绕通知
5. 切面织入：切面织入是将切面应用到目标对象并创建代理对象的过程

通过使用AOP技术可以有效地解耦业务逻辑和横切关注点，提高了系统的可维护性

### IOC

实现依赖注入的方式：setter，构造函数，字段，@Resource @Autowired

其核心就是一种容器的对象管理机制，在Spring IOC中，将控制权限的程序代码转移给Spring框架中，Spring框架负责创建对象，管理对象之间的依赖关系，调用对象的方法等，应用程序只需要声明使用的对象和依赖关系，无需自己负责对象的创建和管理，从而实现了控制反转

通过使用IOC，应用程序可以更加关注业务逻辑，而不需要过多关注对象的创建和管理

#### IOC的实现原理

Spring IOC 的实现原理可以分为两个步骤: 1)扫描和解析配置文件或注解信息，将其转换为内部的对象定义和依赖关系，2)根据对象定义和依赖关系，使用反射机制动态创建和初始化对象，并将对象注入到需要使用它们的地方。

具体来说，Spring IOC 的实现过程如下

1. 读取配置文件或解析注解信息，将其转换为内部的对象定义和依赖关系。在 Spring 中，可以使用 XML文件或注解来配置对象和依赖关系。Spring 通过解析配置文件或注解信息，将其转换为内部的对象定义和依赖关系 (BeanDefinition) 放到容器 (BeanFactory) 中。对象定义包括对象的类型、属性、构造函数等信息，依赖关系包括对象之间的依赖关系、依赖注入方式等信息。
2. 实例化bean对象: Spring 会根据对象定义的类型和构造函数信息，使用反射机制来创建对象
3. 设置属性: 实例化后的仍然是一个原生的状态，并没有进行依赖注入。这一步Spring根据BeanDefinition3 中的信息进行属性填充，依赖注入。
4. 调用Aware接口: Spring会检测该对象是否实现了xxxAware接口，如果有会在这里执行完成。Aware主要是能获取到Spring容器中的一些资源，然后可以供后续步骤，例如初始化阶段使用。
5. BeanPostProcessor前置外理: postProcessBeforelnitialzation方法。上述几个步骤后，bean对象已经被正确构造，但如果想要对象被初始化前再进行一些自定义的处理，就可以通过BeanPostProcessor接口K该方法来实现。
6. 初始化阶段: 该阶段Spring首先会看是否是实现了InitializingBean接口的afterPropertiesSet方法以及是否有自定义的init-method等，如果有会进行调用执行。
7. BeanPostProcessor后置处理: postProcessAfterInitialzation方法。当前正在初始化的bean对象会被传递进来，我们就可以对这个bean作任何处理，与前面前置处理相对的，这个函数会在InitialzationBean完成后执行，因此称为后置处理。
8. bean初始化完成可以被使用了

总的来说，Spring IOC 的实现原理是通过反射机制动态创建对象，依赖注入，对象初始化。通过解糟对象之间的依赖关系，使得应用程序更加灵活、可维护、可扩展。

### 什么是Spring的三级缓存

singletonObjects是一级缓存，存储的是完整创建好的单例bean对象

earlySingletonObjects是二级缓存，存储的是尚未完全创建好的单例bean对象

singletonFactories是三级缓存，存储的是单例bean的创建对象

### Bean的生命周期

 bean 的⽣命周期有五个阶段： 

1. 创建前准备：主要是扫描 spring 中的上下⽂和配置（解析和查找）bean 的⼀些扩展配置 
2. 创建实例：在这个阶段调⽤ bean 的构造器进⾏实例的创建。这是通过反射进⾏实例的创 

建的，并且会扫描和解析 bean 的⼀些属性

1. 依赖注⼊：实例化的 bean 可能依赖其他的 bean，这个阶段就是注⼊实例的 bean 依赖的 

bean，如⽤注解 @Autowired 进⾏依赖的注⼊ 

1. 容器缓存：这个阶段中，将实例化的 bean 放⼊容器和 spring 的缓存中，此时开发者可以 

使⽤实例化的 bean 

1. 销毁实例：当 spring 的上下⽂关闭时，这些上下⽂的 bean 也会被销毁

### 循环依赖

Spring循环依赖问题指的是在Spring容器中出现相互依赖的情况，即两个或多个Bean之间相互依赖，形成了个循环依赖链。例如，Bean A依赖Bean B，Bean B又依赖Bean A，这就构成了一个循环依赖。

Spring是通过三级缓存解决循环依赖问题的，基本思路是: 在Bean创建过程中，将正在创建的Bean对象放入个专门用于缓存正在创建中的Bean对象的缓存池中，当后续创建其他Bean对象时，若需要依赖于该缓存池中正在创建的Bean，则直接使用缓存池中的Bean对象，而不是重新创建一个新的Bean对象。具体而言，Spring通过三级缓存解决循环依赖问题的步骤如下:

1. Spring在创建Bean对象时，首先从一级缓存 (singletonbjects) 中查找是否存在已经创建完成的Bean对象，若存在则直接返回该Bean对象;
2. 若一级缓存中不存在该Bean对象，则从二级缓存 (earlySingletonObiects) 中查找是否存在该Bean对象的代理对象，若存在则返回代理对象;
3. 若二级缓存中也不存在该Bean对象的代理对象，则将正在创建的Bean对象放入二级缓存3.(singletonFactories)中，并在创建过程中进行依赖注入，即为该Bean对象注入依赖的其他Bean对象此时，如果其他Bean对象中依赖了正在创建的Bean对象，Spring将直接从三级缓存中获取正在创建的Bean对象，而不是重新创建一个新的Bean对象。
4. 当Bean对象创建完成后，Sprina将其从二级缓存中移除，并将其加入一级缓存中，以便下次获取该Bean对象时直接从一级缓存中获取。

需要注意的是，一级缓存并不是无限制地缓存Bean对象，而是限定在Bean对象创建过程中使用，Bean对象创建完成后将会从三级缓存中移除。此外，如果Bean对象的依赖关系存在循环依赖，则在创建过程中将会抛出异常，因为无法通过缓存解决循环依赖的问题

### 事务的传播机制

- required，如果不存在事务则开启一个事务，如果存在事务则加入之前的事务，总是只有一个事务在执行
- required new，每次执行新开 个事务
- supported，有事务则加入事务，没有事务则普通执行
- not supported，有事务则暂停该事务，没有则普通执行
- mandatory，强制有事务，没有事务则报异常
- never，有事务则报异常
- nested，如果之前有事务，则创建嵌套事务，嵌套事务回滚不影响父事务，反之父事务影响嵌套事务

### 事务失效的几种情况

1. 应用在了非public上了，只会在非当前对象的其他方法调用，不会走到代理对象去调用
2. 注解上的propagation设置错误，设置为了NOT—SUPORTED，那样就不支持事务，就不会回滚
3. 注解属性rollbackfor属性设置错误，比如说设置成了runtiemException，但是出现了其他错误，那么就不会进行事务回滚
4. 同一个类方法调用，跟应用在非public一样
5. 异常被catch抓获，而导致事务失效

### Spring中用到了哪些设计模式

https://www.yuque.com/hollis666/bmtn1o/kirdzq

### Spring在业务中常见的使用方式

1. 通过IOC实现策略模式
2. 通过AOP实现拦截

> 很多时候，我们一般是通过注解和AOP相结合。大概的实现思路就是先定义一个注解，然后通过AOP去发现使用过该注解的类，对该类的方法进行代理处理，增加额外的逻辑，譬如参数校验，缓存，日志打印等等

1. 通过Event异步解耦

> 很多时候，我们一般是通过注解和AOP相结合。大概的实现思路就是先定义一个注解，然后通过AOP去发现使用过该注解的类，对该类的方法进行代理处理，增加额外的逻辑，譬如参数校验，缓存，日志打印等等，如下代码所示：

## SpringBoot

### SpringBoot是如何实现自动配置的

Spring Boot会根据类路径中的jar包、类，为ar包里的类自动配置，这样可以极大的减少配置的数量。简单点说，就是它会根据定义在classpath下的类，自动的给你生成一些Bean,并加载到Spring的Contexti中。

Spring Booti通过Spring的条件配置决定哪些bean可以被配置，将这些条件定义成具体的Configuration,然后将

这些Configurationi配置到spring.factories.文件中（这种方式Springboot2.7.0版本已不建议使用，最新的方式是/META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports

作为key:org.springframework.boot.autoconfigure.EnableAutoConfiguration的值

这时候，容器在启动的时候，由于使用了EnableAutoConfiguration注解，该注解Import的

EnableAutoConfigurationlmportSelector会去扫描classpath下的所有spring.factories文件，然后进行bean的自动化配置：

![img](https://gvhh8pww7cu.feishu.cn/space/api/box/stream/download/asynccode/?code=NDViNGYxNWEwM2NhMDNhNWQzMWVjMjNiMDNjYTUwYjdfUkNqNHlQZlZVems4VElWeVB2aU1XM0dFeGpTT0Z1ZVFfVG9rZW46STRFZGI0bjZPb1kxR0x4dVFuNGM4bjdibkNjXzE3MDUxNDU0MTQ6MTcwNTE0OTAxNF9WNA)

### SpringBoot是如何实现main方法启动Web项目的

在Spring Boot中，通过SpringApplication类的静态方法run来启动Web项日。当我们在main方法中调用run方法时，Spring Bootf使用一个内嵌的Tomcat服务器，并将其配置为处理Web请求。

当应用程序启动时，Spring Boot会自动扫描应用程序中所有的Spring组件，并使用默认的配置来启动内嵌的Tomcat服务器。在默认情况下，Spring Boot?会自动配置大部分的Web开发所需的配置，包括请求处理、视图解析、静态资源处理等。

这样，在应用程序启动后，我们就可以通过Wb浏览器访问应用程序了。例如，在默认情况下，可以通过访问http://localhost:8080来访问应用程序的首页。

### SpringBoot跟Spring的区别是什么呢

Spring是一个非常强大的企业级Java开发框架(Java的腾飞他居功至伟)，提供了一系列模块来支持不同的应用需求，如依赖注入、面向切面编程、事务管理、Web应用程序开发等。而Spring Boot的出现，主要是起到了简化Spring应用程序的开发和部署，特别是用于构建微服务和快速开发的应用程序。

**相比于Spring,SpringBoot主要在这几个方面来提升了我们使用Springl的效率，降低开发成本：**

1. 自动配置：Spring Booti通过Auto-Configuration来减少开发人员的配置工作。我们可以通过依赖一个starter就把一坨东西全部都依赖进来，使开发人员可以更专注于业务逻辑而不是配置。
2.  内嵌Web服务器：Spring Bootl内置了常见的Web服务器（如Tomcat、Jetty),这意味着您可以轻松创建可 运行的独立应用程序，而无需外部Web服务器。
3. 约定大于配置：SpringBoot中有很多约定大于配置的思想的体现，通过一种约定的方式，来降低开发人员的配置工作。如他默认读取spring.factories来加载Starter、.读取application.properties或application.yml文件来进行属性配置等。

## Mybatis

### #和$的区别是什么？什么情况下必须用$

在Mybatis的mapper文件中，可以使用#{param}和${param}来作为动态参数的替换

使用${}方式传入的参数，mybatis不会对其进行特殊处理，而使用#{}传进来的参数，mybatis默认会将其当做字符串

\#{}和${}在预编译处理中是不一样的，#{}类似于jdbc中PreparedStatement，对于传入的参数，在预处理阶段会使用？代替，可以有效的避免sql注入

所以在mybatis中，能使用#{}就尽量使用#{}，但是有些情况又不得不使用${}，比如我们要把他用在order by，group by语句后面的时候。

## SpringMVC

### SpringMVC的工作流程

1. ### SpringMVC的执行流程了解吗

![img](https://gvhh8pww7cu.feishu.cn/space/api/box/stream/download/asynccode/?code=MTVmYjAwOWFkNmQ3YzIyNDA5MDY1OGI2YmIzZWU2ZDdfY0ZLU2xsbGZxSkc0a0I0NmZRT3FUbVdTTGpMdkUzOUNfVG9rZW46UVBKVWJKdG94b3VZYUp4empXMGNCSkdJbkpmXzE3MDUxNDU0MTQ6MTcwNTE0OTAxNF9WNA)

SpringMVC是基于MVC设计模式实现的Web框架，其工作流程如下: 

1. 客户端发送HTTP请求至前端控制器DispatcherServlet。
2. DispatcherServlet根据请求信息调用HandlerMapping，解析请求对应的Handler即处理器(Controller)。
3. HandlerMapping根据请求URL查找对应的Controller，同时生成用于执行该请求的HandlerExecutionChain对象 (包含Interceptor链)。
4. DispatcherServlet调用HandlerAdapter执行Handler。在执行过程中，HandlerAdapter将把ModelAndView对象传递给DispatcherServlet。
5. Handler执行完成后，返回一个ModelAndView对象给HandlerAdapter。
6. HandlerAdapter将ModelAndView对象传递给DispatcherServlet。
7. DispatcherServlet调用ViewResolver解析视图 (View)。
8. ViewResolver解析出View对象后，将其返回给DispatcherServlet.
9. DispatcherServlet调用View对象的render()方法进行视图渲染
10. DispatcherServlet将渲染后的视图返回给客户端。

在这个过程中，DispatcherServlet是整个SpringMVC的核心，它负责协调各个组件的工作。HandlerMapping负责将请求映射到对应的Controler，而HandlerAdapter负责执行Controller。ViewResolver则根据逻辑视图名(如JSP文件名)解析出View对象，最后由View清染出实际的页面内容。通过这种分工协作的方式SpringMVC可以实现灵活、高效、可扩展的Web应用程序开发。