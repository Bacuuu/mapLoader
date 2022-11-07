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
  - 一开始的思路是通过css进行百分比设置，能够进行自适应父元素。但是实操过程中发现图片会被拉伸，这个在[mdn](https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API/Tutorial/Basic_usage)中有提到、
  - 最终通过`ResizeObserver`进行父元素的监听，有变化时通过`getBoundingClientRect`拿到父元素的宽高，赋给canvas。现在发现貌似回调函数中就能够拿到宽高值，不用再调用其他方法了。

- 监听通用事件。主要涉及到的事件有，拖拽、缩放。
  - 缩放事件是通过在canvas元素监听`wheel`事件
  - 点击拖拽事件通过监听mousemove事件，在回调中根据`buttons`字段判断是否左键按下，记录每次的差值，重新进行绘制。

#### canvasTool

主要负责canvas绘制

- `addSingleImage`，绘制单个图片，根据(图片地址，x，y)绘制到canvas指定位置。
- `reloadTile`，计算需要的瓦片数，根据行列通过`addSingleImage`进行铺满

#### 整体加载策略

1. 移动或缩放 -> 重新计算加载整个图层。通过节流节省一些性能
   - 拖动有明显延迟，加载时明显看到瓦片按照行列加载的过程
2. 通过indexeddb缓存数据
   - 提升加载速度
3. 离屏canvas
   - 目的是解决能够看到瓦片加载过程的问题，类似于整屏渲染
4. 修改加载策略为，离屏canvas宽高为真实canvas的3倍。
   - 目的是在拖拽时，直接通过重新对离屏canvas重新定位进行绘制即可。
   - 在鼠标抬起时，再重新计算离屏canvas。
5. 计算边界，在边界上叠加元素。（待定）



> 20221101，分界线。
>
> 重新组织下代码，把瓦片组织的关键逻辑拿出来。

#### 核心流程

##### 初始化图层

- 根据经纬度，计算出中心瓦片行列号，下一步是将中心瓦片的真正位置定位到正中间。
- 计算像素偏移量，像素偏移一直正数，`centerTileOffset`
- 以中心瓦片为基准，左右上下铺满
- 将offlineCanvas重绘到canvas上，直接偏移一个canvas的位置

##### 像素拾取

- 假设在canvas的偏移像素为`x`、`y`
- 求`x、y`和中心瓦片的相对位置关系，从而求当前位置所在的瓦片
  - 相对canvas中心点偏移量为： `x - canvasWidth / 2`，`y - canvasHeight / 2`
  - 相对于中心瓦片左上角为：`x - canvasWidth / 2 + centerTileOffsetX`，`y - canvasHeight / 2 + centerTileOffsetY`
  - 将上面的值进行模处理，确定该点位的瓦片行列值，和相对像素
- 求经纬度

#### corejs

 




