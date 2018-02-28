- hover、 click 或其他事件的时候需要额外的样式，各 overlays 可接受两个的样式，一个渲染的时候，一个其他事件触发
- 各 overlays 的默认样式需要调整
- 4.6.0 新增了 textBackgroundFill 和 textBackgroundStroke 属性，看是否可整合进 Marker
- 整理 map 中的 layer 和 source
- 各 feature 的 attr 属性需要删除，仅做调试用
- Draw 的椭圆参数


每一个 overlay 都需要 reload（Draw 的 reload 不同） ==> 需要 getLayerByParam（Draw 不需要）
只有 point 和 vector 需要 getSingleFeature, vector???
只有在 render 的时候需要 getSingleFeature