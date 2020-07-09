### 介绍 node 文件查找优先级？npm2 和 npm3+有什么区别？Node 不支持哪些 ES6 语法

#### 1. node文件查找优先级

##### 1.1 从文件模块缓存中加载

尽管原生模块与文件模块的优先级不同，但是都不会优先于从文件模块的缓存中加载已经存在的模块。

##### 1.2 从原生模块加载

原生模块的优先级仅次于文件模块缓存的优先级。require方法在解析文件名之后，优先检查模块是否在原生模块列表中。以http模块为例，尽管在目录下存在一个http/http.js/http.node/http.json文件，require(“http”)都不会从这些文件中加载，而是从原生模块中加载。

原生模块也有一个缓存区，同样也是优先从缓存区加载。如果缓存区没有被加载过，则调用原生模块的加载方式进行加载和执行。

##### 1.3 从文件加载

当文件模块缓存中不存在，而且不是原生模块的时候，Node.js会解析require方法传入的参数，并从文件系统中加载实际的文件，加载过程中的包装和编译细节在前一节中已经介绍过，这里我们将详细描述查找文件模块的过程，其中，也有一些细节值得知晓。

require方法接受以下几种参数的传递：

1. http、fs、path等，原生模块。 
2. ./mod或../mod，相对路径的文件模块。 
3. /pathtomodule/mod，绝对路径的文件模块。 
4. mod，非原生模块的文件模块。

在进入路径查找之前有必要描述一下module path这个Node.js中的概念。对于每一个被加载的文件模块，创建这个模块对象的时候，这个模块便会有一个paths属性，其值根据当前文件的路径计算得到。我们创建modulepath.js这样一个文件，其内容为：

```javascript
console.log(module.paths);
```

我们将其放到任意一个目录中执行node modulepath.js命令，将得到以下的输出结果。

```javascript
[
    '/home/jackson/research/node_modules', 
    '/home/jackson/node_modules', 
    '/home/node_modules', 
    '/node_modules'
]
```

可以看出module path的生成规则为：从当前文件目录开始查找node_modules目录；然后依次进入父目录，查找父目录下的node_modules目录；依次迭代，直到根目录下的node_modules目录。

除此之外还有一个全局module path，是当前node执行文件的相对目录（../../lib/node）。如果在环境变量中设置了HOME目录和NODE_PATH目录的话，整个路径还包含NODE_PATH和HOME目录下的.node_libraries与.node_modules。其最终值大致如下：

```javascript
[NODE_PATH，HOME/.node_modules，HOME/.node_libraries，execPath/../../lib/node]
```

##### 1.4 require方法中的文件查找策略

由于Node.js中存在4类模块（原生模块和3种文件模块），尽管require方法极其简单，但是内部的加载却是十分复杂的，其加载优先级也各自不同。

简而言之，如果require绝对路径的文件，查找时不会去遍历每一个node_modules目录，其速度最快。其余流程如下：

1. 从module path数组中取出第一个目录作为查找基准。 
2. 直接从目录中查找该文件，如果存在，则结束查找。如果不存在，则进行下一条查找。 
3. 尝试添加.js、.json、.node后缀后查找，如果存在文件，则结束查找。如果不存在，则进行下一条。 
4. 尝试将require的参数作为一个包来进行查找，读取目录下的package.json文件，取得main参数指定的文件。 
5. 尝试查找该文件，如果存在，则结束查找。如果不存在，则进行第3条查找。 
6. 如果继续失败，则取出module path数组中的下一个目录作为基准查找，循环第1至5个步骤。 
7. 如果继续失败，循环第1至6个步骤，直到module path中的最后一个值。 
8. 如果仍然失败，则抛出异常。

##### 总结

整个查找过程十分类似原型链的查找和作用域的查找。所幸Node.js对路径查找实现了缓存机制，否则由于每次判断路径都是同步阻塞式进行，会导致严重的性能消耗



#### 2. npm2 和 npm3+有什么区别？

npm2和npm3最主要的区别在依赖的处理。

npm2所有项目依赖是嵌套关系，而npm3为了改进嵌套过多、过深的情况，会将所有依赖放在第二层依赖中，所有依赖只嵌套一次，彼此平行，也就是平铺的结构。

##### 2.1 npm2采用严格的包依赖模式

```json
npm install name@1.2.* ---- 1.2.0 <= version <= 1.2.9
npm install name@1.* ---- 1.0.0 <= version <= 1.9.9
npm install name@* ---- 0.0.0 <= version
npm install name@^1.2.3 ---- 1.2.3 <= version < 1.9.9
npm install name@~1.2.3 ----- 1.2.3 <= version <1.2.9
```

可以通过`npm info name`查看包的依赖包版本

##### 2.2 npm3采用的包版本管理模式

假如我们有一个包A 依赖于包B1.0.0，后来我们有了包C，包C需要依赖包B2.0.0，这个时候npm如何处理呢，npm会把包B2.0.0安装在包C下面，这个时候包B2.0.0嵌套在包C下面，所以我们本质上拥有两个版本的包B，如果我们又有了包D，包D也依赖于包B2.0.0，那么npm依然会在包D下面创建一个包B2.0.0，这个时候就拥有三个包B，假如包D不依赖包B2.0.0，而是依赖于包B1.0.0，那因为包B1.0.0是最先下载的，他属于顶级依赖，所以这个时候什么都不用做，因为包B1.0.0就在那里，这类似于全局环境和局部环境，我们把最先下载的包B1.0.0放入全局环境，如果以后有其他包（例如包C）依赖与包B2.0.0，则放入对应其他包（例如包C）的局部环境，因为局部环境对其他对象是不可见的，所以以后如果还会有其他包（例如包D）依赖于包B2.0.0，我们会另外创建一个包B2.0.0放入对应包D的局部环境，如果包D改为依赖包B1.0.0，因为包B1.0.0在全局环境，可以直接引用，所以就不需要做任何事情。

那现在我们设定包D依赖于包B2.0.0，所以现在依赖于包B1.0.0的只有包A，如果我们升级了包A，升级后的包A依赖于包B2.0.0，那么最终会在全局环境删除包B1.0.0，因为包B1.0.0不再有价值了，然后在全局环境换成包B2.0.0,因为新升级的包A需要包B2.0.0，注意这个时候局部环境的包B2.0.0仍然存在，所以很多时候我们需要去重，去掉重复的包引用，例如本例：全局环境和局部环境引用了同样的包B版本，我们通过执行`npm dedupe`达到删除局部环境里面包B2.0.0的目的。

#### 3. Node 不支持哪些 ES6 语法

```shell
npm install -g es-checker
```

执行上面命令，安装`es-checker`，然后执行`es-checker`即可查看哪些支持哪些ES6语法

```shell
    ~@coolb  es-checker

ECMAScript 6 Feature Detection (v1.4.2)

Variables
  √ let and const
  √ TDZ error for too-early access of let or const declarations
  √ Redefinition of const declarations not allowed
  √ destructuring assignments/declarations for arrays and objects
  √ ... operator

Data Types
  √ For...of loop
  √ Map, Set, WeakMap, WeakSet
  √ Symbol
  √ Symbols cannot be implicitly coerced

Number
  √ Octal (e.g. 0o1 ) and binary (e.g. 0b10 ) literal forms
  √ Old octal literal invalid now (e.g. 01 )
  √ Static functions added to Math (e.g. Math.hypot(), Math.acosh(), Math.imul() )
  √ Static functions added to Number (Number.isNaN(), Number.isInteger() )

String
  √ Methods added to String.prototype (String.prototype.includes(), String.prototype.repeat() )
  √ Unicode code-point escape form in string literals (e.g. \u{20BB7} )
  √ Unicode code-point escape form in identifier names (e.g. var \u{20BB7} = 42; )
  √ Unicode code-point escape form in regular expressions (e.g. var regexp = /\u{20BB7}/u; )
  √ y flag for sticky regular expressions (e.g. /b/y )
  √ Template String Literals

Function
  √ arrow function
  √ default function parameter values
  √ destructuring for function parameters
  √ Inferences for function name property for anonymous functions
  × Tail-call optimization for function calls and recursion

Array
  √ Methods added to Array.prototype ([].fill(), [].find(), [].findIndex(), [].entries(), [].keys(), [].values() )
  √ Static functions added to Array (Array.from(), Array.of() )
  √ TypedArrays like Uint8Array, ArrayBuffer, Int8Array(), Int32Array(), Float64Array()
  √ Some Array methods (e.g. Int8Array.prototype.slice(), Int8Array.prototype.join(), Int8Array.prototype.forEach() ) added to the TypedArray prototypes
  √ Some Array statics (e.g. Uint32Array.from(), Uint32Array.of() ) added to the TypedArray constructors

Object
  √ __proto__ in object literal definition sets [[Prototype]] link
  √ Static functions added to Object (Object.getOwnPropertySymbols(), Object.assign() )
  √ Object Literal Computed Property
  √ Object Literal Property Shorthands
  √ Proxies
  √ Reflect

Generator and Promise
  √ Generator function
  √ Promises

Class
  √ Class
  √ super allowed in object methods
  √ class ABC extends Array { .. }

Module
  × Module export command
  × Module import command


=========================================
Passes 39 feature Detections
Your runtime supports 92% of ECMAScript 6
=========================================
```

可以看出目前不支持尾递归调用、`esmodule`。

解决办法可以通过`babel`将ES6代码转换为Node支持的语法。

```shell
npm install --save-dev babel-cli babel-preset-es2015 babel-preset-es2017
```

其中babel-cli使我们可以在终端中使用babel命令，如同webpack对应的webpack-cli包，而babel-preset-* 是babel转换代码时所依赖的前置规则的插件集合,安装完成后，在同目录下配置使用babel,新建.babelrc文件，其中presets字段里添加我们的转换规则，可以只写前边提到的babel-preset- *中* 对应的关键字作为缩写，plugins中可以配置一些定义转换规则的插件。配置完成后，就可以在我的终端中用babel对我的代码进行转换了。
