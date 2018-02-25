## 概述

OpenLayers 初始化一幅地图（`map`），至少需要一个可视区域（`view`），一个或多个图层（`layer`）， 和一个地图加载的目标 HTML 标签（`target`）

## Layer 类（ol.layer）

在 OpenLayers 中，图层是使用 layer 对象表示的，主要有热度图层（`heatmaplayer`）、图片图层（`imagelayer`）、切片图层（`tilelayer`）和矢量图层（`vectorlayer`）四种类型，它们都是继承 `Layer` 类的，`Layer` 类（[`ol.layer`](https://github.com/openlayers/openlayers/blob/master/src/ol/layer/Layer.js)）的描述如下：

> 抽象基类，通常只用于创建子类而不在应用程序中实例化
> 栅格或矢量地图数据的可视化表示
> 层组（layers group）将那些与数据如何显示有关的属性组合在一起，而不管数据的来源如何
 
> layers 通常使用 `[ol.Map#addLayer](http://openlayers.org/en/latest/apidoc/ol.Map.html#addLayer)` 方法添加到地图上
> 类似 `[ol.interaction.Select](http://openlayers.org/en/latest/apidoc/ol.interaction.Select.html)` 一样的组件在内部使用非托管层
> 这些非托管层使用 `[ol.layer.Layer#setMap](http://openlayers.org/en/latest/apidoc/ol.layer.Layer.html#setMap)` 与地图联系

> 当源（`source`）的状态发生变化时，将触发一个通用的 `change` 事件

### Layer options
| Name           | Type                         | Description       |
| :--------:     | :-----:                      | :----:                 |
| opacity        | number, undefined           | 透明度，0 到 1 之间，默认是 1 |
| source         | ol.source.Source, undefined | 这个层的源（`source`），如果没有提供构造函数，在初始化之后源（`source`）可以通过调用 `layer.setSource(source)` 来设置 |
| visible        | boolean, undefined          | 能见度，默认是 true（visible） |
| extend         | ol.Extent, undefined        | layer 渲染的边界范围，layer 将不会在此范围之外渲染 |
| zIndex         | number, undefined           | layer 渲染时的 `z-index`。在渲染时，layers 首先通过 `z-index`，然后通过 `position` 被整理排序。默认是 0 |
| minResolution  | number, undefined           | 最小分辨率（含） |
| maxResolution  | number, undefined           | 最大分辨率（不含） |

## Source（ol.source）

`source` 是 `layer` 的重要组成部分，表示图层的来源，也就是服务地址。除了在构造函数中指定外，可以使用 `layer.setSource(source)` 稍后设置。

> 抽象基类，通常只用于创建子类，而不是在应用程序中实例化
> `[ol.layer.Layer](http://openlayers.org/en/latest/apidoc/ol.layer.Layer.html)` 的源（`source`）的基类

> 当源（`source`）的状态发生变化时，将触发一个通用的 `change` 事件

包含的类型：
 1. 不可实例化的基类：
 - `ol.source.Vector`，提供矢量图层数据，适用于编辑，继承自 `ol.source.Source`；
 - `ol.source.Image`，提供单一图片数据的类型，继承自 `ol.source.Source`；
 - `ol.source.Tile`，提供被切分为网格切片的图片数据，继承自 `ol.source.Source`；
 
 2. 可实例化的子类：
 - `ol.source.BingMaps` ，必应地图的切片数据，继承自`ol.source.TileImage`；
 - `ol.source.Cluster`，聚簇矢量数据，继承自`ol.source.Vector`；
 - `ol.source.ImageCanvas`，数据来源是一个 `canvas` 元素，其中的数据是图片，继承自 `ol.source.Image`；
 - `ol.source.ImageMapGuide`，Mapguide 服务器提供的图片地图数据，继承自 `ol.source.Image，触发 `ol.source.ImageEvent`；
 - `ol.source.ImageStatic`，提供单一的静态图片地图，继承自`ol.source.Image`；
 - `ol.source.ImageVector`，数据来源是一个 `canvas` 元素，但是其中的数据是矢量来源 `ol.source.Vector`，继承自 `ol.source.ImageCanvas`；
 - `ol.source.ImageWMS`，WMS 服务提供的单一的图片数据，继承自 `ol.source.Image`，触发 `ol.source.ImageEvent`；
 - `ol.source.MapQuest`，MapQuest 提供的切片数据，继承自 `ol.source.XYZ`；
 - `ol.source.OSM`，OpenStreetMap 提供的切片数据，继承自 `ol.source.XYZ`；
 - `ol.source.Stamen`，Stamen 提供的地图切片数据，继承自 `ol.source.XYZ`；
 - `ol.source.TileVector`，被切分为网格的矢量数据，继承自 `ol.source.Vector`；
 - `ol.source.TileDebug`，并不从服务器获取数据，而是为切片渲染一个网格，继承自 `ol.source.Tile`；
 - `ol.source.TileImage`，提供切分成切片的图片数据，继承自 `ol.source.Tile`，触发 `ol.source.TileEvent`；
 - `ol.source.TileUTFGrid`，`TileJSON` 格式的 UTFGrid 交互数据，继承自 `ol.source.Tile`；
 - `ol.source.TileJSON`，`TileJSON` 格式的切片数据，继承自 `ol.source.TileImage`；
 - `ol.source.TileArcGISRest`，ArcGIS Rest 服务提供的切片数据，继承自 `ol.source.TileImage`；
 - `ol.source.WMTS`，WMTS 服务提供的切片数据。继承自 `ol.source.TileImage`；
 - `ol.source.XYZ`，`XYZ` 格式的切片数据，继承自 `ol.source.TileImage`；
 - `ol.source.Zoomify`，`Zoomify` 格式的切片数据，继承自 `ol.source.TileImage`。

## Feature（ol.Feature）

 > 一个具有几何形状和其他属性参数的地理特征的矢量对象，类似于像 `GeoJSON` 这样的矢量文件格式
 > feature 可以通过 `setStyle` 单独设置样式; 否则使用它们矢量层（vector layer）的样式

 > feature 对象的属性参数被设置为 `[ol.Object](http://openlayers.org/en/latest/apidoc/ol.Object.html)` 参数，所以他们是可监听的，并且有 `get/set` 方法

 > 通常一个 feature 拥有一个唯一的几何属性（`geometry`），可以通过 `setGeometry` 方法设置几何属性，通过 `getGeometry` 方法获取几何属性
 > 使用属性参数存储多个几何特性也是可行的
 > 默认情况下，用于渲染的几何特性是由属性名 `geometry` 标识的。
 > 如果渲染时想用其他的几何特性属性，可以使用 `setGeometryName` 方法来更改与该 feature 的几何特性相关的属性参数，例如：
 >
 ```javaScript
 var feature = new ol.Feature({
   geometry: new ol.geom.Polygon(polyCoords),
   labelPoint: new ol.geom.Point(labelCoords),
   name: 'My Polygon'
 });
 *
 // get the polygon geometry
 var poly = feature.getGeometry();
 *
 // Render the feature as a point using the coordinates from labelPoint
 feature.setGeometryName('labelPoint');
 *
 // get the point geometry
 var point = feature.getGeometry();
 ```