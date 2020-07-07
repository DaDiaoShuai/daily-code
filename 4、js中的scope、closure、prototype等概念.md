### 请描述下 JavaScript 中 scope、Closure、Prototype 概念，并说明 JavaScript 封装、继承实现原理。

#### 1. scope

在js里，`scope`即域是指代码当前上下文语境。域可以公共定义也可以在本地定义，理解了域的定义才能更好的写出有条理的代码。

##### 1.1 Global scope

那什么是全局域呢？当你在`script`标签里写下第一行代码，它就身处全局域中，我们定义一个变量，那么这个变量就是全局域中定义的变量：

```javascript
// global scope
var globalVariable = 'foo'
```

全局域定义起来方便，抬手就能操作，在浏览器中，所有全局域都挂载在`window`对象上，在`Nodejs`环境中，则全局域对象是`global`（后面介绍以浏览器环境为标准）。上述代码片段，在后续代码使用中，调用`globalVariable`变量可以直接使用变量名，也可以`window.globalVariable`使用这个变量。

那么全局域有什么问题或者隐患呢？当项目稍微有点规模的时候，在多人开发的时候，全局域中变量的定义就成了隐患，极有可能出现变量冲突的问题，小明在全局域定义了a变量，小红也定义了a，那有一方的变量就会被覆盖掉，导致问题出现，所以管理好全局域是件重要的事情。所以就派生了“命名空间”概念。

##### 1.2 Local scope

在`ES6`标准之前，js的局部作用域仅限于函数作用域。一般来说只能有一个全局域，在每一个全局域中定义的函数都有自己的本地域，即函数作用域。

```javascript
// global scope
var globalFunc = function () {
    // local scope
    var localVariable = 'bar'
}
```

在函数内部本地域定义的变量`localVariable`在全局域中是被隔离的，即在本地域以外是取不到的，除非它被暴露出来。

```javascript
// global scope
var globalFunc = function () {
 // local scope
 var localVariable = 'bar'
}
console.log(localVariable) // Uncaught ReferenceError: localVariable is not defined
```

变量`localVariable`是属于`globalFunc`本地的，他没有暴露到全局，所以外部是无法取到的。那怎样能取到呢？

在非严格模式下:

```javascript
// global scope
var globalFunc = function () {
 // local scope
 localVariable = 'bar'
}
console.log(localVariable) // bar
```

不加`var`声明，变量`localVariable`就相当于在全局域中定义的了，所以跟全局域中定义的变量没区别，当然这些前提都是在**非严格模式**下进行的。

另一种方式就是我们上面所说的「暴露」出去，怎样暴露呢？通过「闭包」，「闭包」我们后面再说。

上面所说的本地域是`ES6`之前的标准，那`ES6`怎么形成本地域呢？

```javascript
{
    let localVarByLet = 'letvar';
    const localVarByConst = 'constvar'
}
```

`ES6`开始js就有了局部作用域的了，不再依赖函数作用域了，`{}`+`let/const`就形成了局部作用域。

#### 2. Closure

##### 2.1 什么是闭包

举个🌰，一个函数返回一个函数的引用，就形成了一个闭包。

##### 2.2 闭包的作用

根据上面的例子，闭包最实用的例子就是使局部作用域外能调用局部作用域内的变量。

```javascript
var closure = function () {
    var innerVar = 'inner'
    return function () {
        console.log(innerVar)
    }
}

var getInner = closure()
getInner() // 就去到了局部作用域内的变量声明 inner
```

当然这只是闭包的一种场景，并不是说一个函数返回一个函数才是闭包，换而言之，简单地使词法作用域的外层可以访问其中的变量，这便创建了一个闭包。

又提到了一个概念，「词法作用域」。

##### 2.3 词法作用域

每当你看到一个函数在另一个函数里的时候，内部的那个函数可以访问外部的函数，就被称为词法作用域。

```javascript
// scope 1
var myFunc = function () {
    // scope 2
    var name = 'coolb'
    var innerFunc = function () {
        // scope 3
        console.log('my name is' + name)
    }
}
```

词法作用域的特点，函数内部能调用父级函数内部的变量，而父级函数不能访问到子函数内部的变量，是一种向下传递。

#### 3. prototype

原型是js中非常重要的概念，换句话说， 原型是js语言的一个特征。js中任何对象都有原型，函数对象有原型（只不过函数不充当构造函数时，原型不起作用），普通的js`object`也有原型，原型是一个`object`，它也有原型，这就构成了一个**原型链**，直到`Object.prototype`。`Object.prototype`的原型是`null`。

读取对象的某个属性时，`JavaScript` 引擎先寻找对象本身的属性，如果找不到，就到它的原型去找，如果还是找不到，就到原型的原型去找。如果直到最顶层的`Object.prototype`还是找不到，则返回`undefined`。如果对象自身和它的原型，都定义了一个同名属性，那么优先读取对象自身的属性，这叫做“覆盖”。

#### 4. 封装

封装的概念非常简单，就是将用户不需要知道的数据和方法隐藏起来，外部无法直接访问。在Java中，可以用private， protected关键字进行修饰。在JS中可以用**闭包**实现。举个🌰：

```javascript
var person = {
  fullName : "coolb",
};
 
alert(person.fullName); // coolb
person.fullName = "jay";
alert(person.fullName); // jay
```

这里person对象的fullName属性是暴露给用户的，你无法保证用户总是赋合法的名字。为了解决这一问题，我们可以用闭包。

```javascript
var person = function () {
 
  var fullName = "coolb";
  var reg = new RegExp(/\d+/);
 
  return { 
    setFullName : function (newValue) {
      if(reg.test(newValue)) {
        console.log("Invalid Name");
      }
      else {
        fullName = newValue;
      }
    },
    getFullName : function () {
     return fullName; 
    }
  }
} 
 
var p = person();
console.log(p.getFullName());   // coolb
p.setFullName('jay');
console.log(p.getFullName());  // jay
p.setFullName(42); // Invalid Name
p.fullName = 42;     // 这种方式并不影响内部fullName的值
console.log(p.getFullName());  // jay
```

#### 5. 继承

##### 5.1 继承是什么？

顾名思义，一个对象上想拥有被继承对象的方法属性，继承过来就好了😎。

在`OOP`中，通过类的继承来实现代码的复用，通过实例化一个类可以创建许多对象，在JS中继承是通过原型实现的。

```javascript
let user = function(name) {
    this.name = name;
    this.getName = function () {
        console.log(this.name);
    }
};
 
//为了避免下面比较name时，对值进行比较，这里故意传入了String对象
let user1 = new user(new String('KK'));
let user2 = new user(new String('KK'));
 
console.log(user1.name === user2.name);    //输出false
console.log(user1.getName === user2.getName); //输出false
```

在上述代码中，我们通过构造函数user，创建了两个对象。实际上是通过复制 构造函数user的原型对象 来创建user1和user2。原型对象中有个constructor指向了user函数，实际上还是通过这个构造函数来创建的对象。

假如不用原型（更准确地说原型对象中没有用户定义的属性），那么这两个对象就无法共享任何属性，对于这个例子来说，getName的逻辑是一样的，不需要两份getName，所有的user对象其实可以共享这个getName方法。这个逻辑非常像java类中的静态函数，只不过静态函数只能够调用静态变量和静态方法。但是在JS的世界里，可以通过将getName定义在原型中，已达到所有对象共享这个函数。

```javascript
let user = function(name) {
    this.name = name;
};
 
user.prototype.getName = function () {
    console.log(this.name);
}
 
user.prototype.color = new String('White');
 
let user1 = new user(new String('KK'));
let user2 = new user(new String('KK'));
 
console.log(user1.name === user2.name);  //输出false
console.log(user1.getName === user2.getName); //输出true
console.log(user1.color === user2.color); //输出true
```

这里就一目了然了。在原型对象中定义的变量和方法能够被所有多个对象共享。原型的属性被对象共享，但是它不属于对象本身。

```javascript
user1.hasOwnProperty('name');  //true;
user1.hasOwnProperty('getName');  //false;
```

这里要注意：原型对象的属性不是实例对象自身的属性。只要修改原型对象，变动就立刻会体现在**所有**实例对象上。反之，如果对象的属性被修改，原型的对象中相同的属性并不会修改。

##### 5.2 继承的实现原理

从构造函数实例化说起，当你再调用`new`的时候，js实际上执行的是：

```javascript
var o = new Object();
o.__proto__ = Foo.prototype;
Foo.call(o);
```

然后，当你执行：

```javascript
o.someProp
```

它检查 o 是否具有 `someProp` 属性。如果没有，它会查找`Object.getPrototypeOf(o).someProp`，如果仍旧没有，它会继续查找 `Object.getPrototypeOf(Object.getPrototypeOf(o)).someProp`。

我们来实现一个继承：

B继承自A

```javascript
function A(a){
  this.varA = a;
}

// 以上函数 A 的定义中，既然 A.prototype.varA 总是会被 this.varA 遮蔽，
// 那么将 varA 加入到原型（prototype）中的目的是什么？
A.prototype = {
  varA : null,
/*
既然它没有任何作用，干嘛不将 varA 从原型（prototype）去掉 ? 
也许作为一种在隐藏类中优化分配空间的考虑 ?
https://developers.google.com/speed/articles/optimizing-javascript 
如果varA并不是在每个实例中都被初始化，那这样做将是有效果的。
*/
  doSomething : function(){
    // ...
  }
}

function B(a, b){
  A.call(this, a);
  this.varB = b;
}
B.prototype = Object.create(A.prototype, {
  varB : {
    value: null, 
    enumerable: true, 
    configurable: true, 
    writable: true 
  },
  doSomething : { 
    value: function(){ // override
      A.prototype.doSomething.apply(this, arguments); 
      // call super
      // ...
    },
    enumerable: true,
    configurable: true, 
    writable: true
  }
});
B.prototype.constructor = B;

var b = new B();
b.doSomething();
```

最重要的部分是：

- 类型被定义在 `.prototype` 中
- 用 `Object.create()` 来继承

`Object.create()`的实现原理或者说是对`ES5`之前版本的polyfill：

```javascript
if (typeof Object.create !== "function") {
    Object.create = function (proto, propertiesObject) {
        if (typeof proto !== 'object' && typeof proto !== 'function') {
            throw new TypeError('Object prototype may only be an Object: ' + proto);
        } else if (proto === null) {
            throw new Error("This browser's implementation of Object.create is a shim and doesn't support 'null' as the first argument.");
        }

        if (typeof propertiesObject != 'undefined') throw new Error("This browser's implementation of Object.create is a shim and doesn't support a second argument.");

        function F() {}
        F.prototype = proto;

        return new F();
    };
}
```

#### 总结

`Javascript`中的这些概念，`scope`、`closure`、`prototype`等对于语言的特征来说是基建，他们息息相关，没有哪个更重要，都是非常重要的概念，只有这些基础的东西搞明白了之后，才能去读懂一些框架的源码，甚至去开发一套框架开发一些牛x的开源库。
