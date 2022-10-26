### 手写一个地图瓦片加载器

在地图开发中通常我们都是在底图上进行应用开发，底图也就是具有地理信息的数据。有的底图是以图片形式进行展示的，整个底图由多个瓦片拼凑在一起，形成一个大的地图。要实现一个地图瓦片组合的流程实际很简单，根据当前视图经纬度、层级请求瓦片数据进行拼接即可。

#### 需求

当前我们的目的是实现瓦片地图的加载，但是后续有可能会增加别的地图功能，我们采用创建一个地图对象，在地图对象上进行拓展的方式。大致的使用方式如下

```javascript

import MapLoader from './index.js'
const map = new MapLoader('map')
map.addTileLayer('tielLayer', 'http://wprd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}')
```

`new Maploader`的参数是`dom`节点，选择该节点插入`canvas`，作为地图的载体。

`map.addTileLayer`参数是`(图层名,瓦片地址)`，在添加后直接进行瓦片初始化。

#### 从mapLoader开始

首先我们实现`MapLoader`类，在实例化时主要是处理以下逻辑：

- 根据dom选择器，插入canvas作为该元素子元素。
- canvas自适应大小，根据外层容器的宽高进行`width`、`height`的设置。
  - 一开始的思路是通过css进行百分比设置，能够进行自适应父元素。但是实操过程中发现图片会被拉伸，这个在[mdn](https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API/Tutorial/Basic_usage)中有提到
  - 最终通过`ResizeObserver`进行父元素的监听，有变化时通过`getBoundingClientRect`拿到父元素的宽高，赋给canvas。现在发现貌似回调函数中就能够拿到宽高值，不用再调用其他方法了。

- 监听通用事件，通过事件总线抛出。主要涉及到的事件有，拖拽、缩放。
  - 缩放事件是通过在canvas元素监听`wheel`事件
  - 










