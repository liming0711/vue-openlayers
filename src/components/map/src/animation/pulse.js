import ol from 'openlayers';
// Layers
var layer = new ol.layer.Tile({
  name: 'Natural Earth',
  minResolution: 306,
  source: new ol.source.XYZ({
    url: 'https://{a-d}.tiles.mapbox.com/v3/mapbox.natural-earth-hypso-bathy/{z}/{x}/{y}.png',
    crossOrigin: 'Anonymous',
    attributions: [new ol.Attribution({ html: '&copy; <a href="https://www.mapbox.com/map-feedback/">Mapbox</a>' })]
  })
});

// The map
var map = new ol.Map({
  target: 'map',
  view: new ol.View({
    zoom: 5,
    center: [166326, 5992663]
  }),
  layers: [layer]
});

// Pulse feature at coord
function pulseFeature (coord) {
  var feature = new ol.Feature(new ol.geom.Point(coord));
  feature.setStyle(new ol.style.Style({
    image: new ol.style.Circle({
      radius: 30,
      points: 4,
      src: '../data/smile.png',
      stroke: new ol.style.Stroke({
        color: '#ff0000',
        width: 2
      })
    })
  }));
  // map.animateFeature 和 ol.featureAnimation.Zoom => 自定义的
  map.animateFeature(feature, new ol.featureAnimation.Zoom({
    fade: ol.easing.easeOut,
    duration: 3000,
    easing: ol.easing.easeOut
  }));
}

// Pulse on click
map.on('singleclick', function (evt) {
  pulseFeature(evt.coordinate);
});

// // Pulse at lonlat
// function pulse (lonlat) {
//   var nb = 3;
//   for (var i = 0; i < nb; i++) {
//     setTimeout(function () {
//       pulseFeature(ol.proj.transform(lonlat, 'EPSG:4326', map.getView().getProjection()));
//     }, i * 500);
//   };
// }
