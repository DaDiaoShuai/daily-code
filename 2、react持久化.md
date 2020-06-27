## React如何做持久化？

> 前端持久化，不用思考直接就能想到`localStorage`，没错，不管用什么库，说到持久化应该跟它脱不了干系。

1. 封装一个数据持久化的工具

   ```javascript
   const Storage = {
	// 存
     set(k, v) {
       localstorage.setItem(k, JSON.stringify(v))
  },
     // 取
     get(k) {
       return JSON.parse(localStorage.getItem(k))
     },
     // 删
     del(k) {
       localStorage.removeItem(k)
     }
   }
   
   export default Storage
   ```
   
   管你什么框架，简单的持久化都好使吧，其实封装都多余。
   
2. React周边的工具

   有个库叫做`redux-persist`，顾名思义，结合了`redux`来实现的数据持久化的那么一个工具。

   先猜测一下，可能是将`redux`中`store`里的数据缓存到浏览器的`localStorage`中。

   具体实现的话，参考👇：

   ```javascript
   // 前提第一步是得在项目中安装 redux-persist
   // npm i redux-persist
   
   // 1.既有的redux里逻辑不变，在此基础上加工一下store
   // src/redux/store/index.js
   import { createStore } from 'redux'
   import reducers from '../reducers/index.js'
   import { persistStore, persistReducer } from 'redux-persist'
   import storage from 'redux-persist/lib/storage'
   import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2'
   
   const persistConfig = {
     key: 'root',
     storage: storage,
     stateReconciler: autoMergeLevel2,
     whitelist: ['needStorage'] // 配置需要数据持久化的reducer
   }
   
   const persistReducer = persistReducer(persistConfig, reducers)
   
   const store = createStore(persistReducer)
   
   export default store
   export const persistor = persistStore(store)
   
   // 2. 在入口文件中， 将PersistGate作为页面内容的父标签
   // src/index.js
   import React from 'react'
   import ReactDom from 'react-dom'
   import { Provider } from 'react-redux'
   import store from './redux/store/index.js'
   import { persistor } from './redux/store/index.js'
   import { PersistGate } from 'redux-persist/lib/integration/react'
   
   ReactDOM.render(
     <Provider store={store}>
     	<PersistGate loading={null} persistor={persistor}>
     	// contents
     	</PersistGate>
     </Provider>,
   	document.getElementById('app')
   )
   ```

   这么着就行了，打开浏览器调试工具`Application`就会发现`localStorage`中有`persist`缓存数据，所以它的原理还是`localStorage`咯👆。