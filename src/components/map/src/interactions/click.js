import ol from 'openlayers';
/**
 * Interaction hover do to something when hovering a feature
 * @constructor
 * @extends {ol.interaction.Interaction}
 * @fires click, singleclick, dblclick
 * @param options
 * - handleEvent { function | undefined } Method called by the map to notify the interaction that a browser event was dispatched to the map. The function may return false to prevent the propagation of the event to other interactions in the map's interactions chain.
 */
var ClickInteraction = function (options = {}) {
  ol.interaction.Interaction.call(this, {
    handleEvent: (event) => {
      if (event.type === 'click' || event.type === 'singleclick' || event.type === 'dblclick') {
        this.handleClickEvent(event);
      }

      if (options.handleEvent) {
        return options.handleEvent(event);
      }
      return true;
    }
  });
};

ol.inherits(ClickInteraction, ol.interaction.Interaction);

/**
 * Remove the interaction from its current map, if any,  and attach it to a new
 * map, if any. Pass `null` to just remove the interaction from the current map.
 * @param {ol.Map} map.
 * @api stable
 */
ClickInteraction.prototype.setMap = function (map) {
  if (this.previousCursor_ !== undefined && this.getMap()) {
    this.getMap().getTargetElement().style.cursor = this.previousCursor_;
    this.previousCursor_ = undefined;
  }
  ol.interaction.Interaction.prototype.setMap.call(this, map);
};

ClickInteraction.prototype.getLonlat = function (coordinate) {
  let lonlat = [];
  if (coordinate) {
    lonlat = ol.proj.transform(coordinate, 'EPSG:3857', 'EPSG:4326');
  }
  return lonlat;
};

ClickInteraction.prototype.handleClickEvent = function (event) {
  if (!event.map) { return false; }

  var feature, layer, layerId;
  var hasFeature = event.map.forEachFeatureAtPixel(event.pixel, (f, l) => {
    feature = f;
    layer = l;
    return true;
  });

  if (hasFeature) {
    let features = feature.get('features');
    if (features) {
      if (features.length === 1) {
        feature = features[0];
      } else {
        feature = features;
      }
    }
    // console.log('======== click layer ========>', feature, layer);
    layerId = layer && layer.get('id');
  }

  let lonlat = this.getLonlat(event.coordinate);

  if (event.type === 'click') {
    this.dispatchEvent({
      type: 'click',
      layerId,
      feature,
      layer,
      lonlat,
      event
    });
  } else if (event.type === 'singleclick') {
    this.dispatchEvent({
      type: 'singleclick',
      layerId,
      feature,
      layer,
      lonlat,
      event
    });
  } else if (event.type === 'dblclick') {
    this.dispatchEvent({
      type: 'dblclick',
      layerId,
      feature,
      layer,
      lonlat,
      event
    });
  }
};

export default ClickInteraction;
