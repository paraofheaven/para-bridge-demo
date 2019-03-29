# para-bridge-demo
a ios/andriod bridge demo compliance

native端约定的callback格式：
```
  {
    pluginName: 'name', // 插件名字，唯一
    param: {
      tagName: '',  // 标识字符串，如标识用户点击事件:'click_navbar_left'
      CBData: '', // 数据字符串，解析方法：JSON.parse(CBData),但需注意parse可能导致的报错
      isStop: '', // 页面状态标识符
    }
  }
```