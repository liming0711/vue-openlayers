import ol from 'openlayers';
/**
 * Interaction hover do to something when hovering a feature
 * @constructor
 * @extends {ol.interaction.Interaction}
 * @fires hover, enter, leave
 * @param {ol.interaction.HoverOptions}
 * - cursor { string | undefined } css cursor propertie or a function that gets a feature, default: none
 * - featureFilter {function | undefined} filter a function with two arguments, the feature and the layer of the feature. Return true to select the feature
 * - layerFilter {function | undefined} filter a function with one argument, the layer to test. Return true to test the layer
 * - handleEvent { function | undefined } Method called by the map to notify the interaction that a browser event was dispatched to the map. The function may return false to prevent the propagation of the event to other interactions in the map's interactions chain.
 */
var HoverInteraction = function (options) {
  if (!options) {
    options = {};
  }

  ol.interaction.Interaction.call(this, {
    handleEvent: (e) => {
      if (e.type === 'pointermove') {
        this.handleEvent_(e);
      }
      if (options.handleEvent) {
        return options.handleEvent(e);
      }
      return true;
    }
  });

  this.setCursor(options.cursor);
};

ol.inherits(HoverInteraction, ol.interaction.Interaction);

/**
 * Remove the interaction from its current map, if any, and attach it to a new
 * map, if any. Pass `null` to just remove the interaction from the current map.
 * @param {ol.Map} map Map.
 * @api stable
 */
HoverInteraction.prototype.setMap = function (map) {
  if (this.previousCursor_ !== undefined && this.getMap()) {
    this.getMap().getTargetElement().style.cursor = this.previousCursor_;
    this.previousCursor_ = undefined;
  }
  ol.interaction.Interaction.prototype.setMap.call(this, map);
};

/**
 * Set cursor on hover
 * @param { string } cursor css cursor propertie or a function that gets a feature, default: pointer
 * @api stable
 */
HoverInteraction.prototype.setCursor = function (cursor = 'pointer') {
  if (!cursor && this.previousCursor_ !== undefined && this.getMap()) {
    this.getMap().getTargetElement().style.cursor = this.previousCursor_;
    this.previousCursor_ = undefined;
  }
  this.cursor_ = cursor;
};

HoverInteraction.prototype.getLonlat = function (coordinate) {
  let lonlat = [];
  if (coordinate) {
    lonlat = ol.proj.transform(coordinate, 'EPSG:3857', 'EPSG:4326');
  }
  return lonlat;
};

HoverInteraction.prototype.getNewFeature = function (feature) {
  let features = feature.get('features');
  if (features) {
    if (features.length === 1) {
      feature = features[0];
    } else {
      feature = features;
    }
  }
  return feature;
};

/**
 * Cursor move > tells other maps to show the cursor
 * @param {ol.event} e 'move' event
 */
HoverInteraction.prototype.handleEvent_ = function (event) {
  if (!event.map) { return false; }

  var feature, layer, layerId, feature_;
  var lonlat = this.getLonlat(event.coordinate);
  var hasFeature = event.map.forEachFeatureAtPixel(event.pixel, (f, l) => {
    feature = f;
    layer = l;
    return true;
  });

  if (hasFeature) {
    layerId = layer && layer.get('id');
    feature_ = this.getNewFeature(feature);
  }

  this.dispatchEvent({
    type: 'hover',
    layerId,
    feature: feature_,
    layer,
    lonlat,
    event
  });

  if (!(this.feature_ === feature && this.layer_ === layer)) {
    if (feature) {
      this.dispatchEvent({
        type: 'enter',
        layerId,
        feature: feature_,
        layer,
        lonlat,
        event
      });
    } else {
      feature_ = this.getNewFeature(this.feature_);
      this.dispatchEvent({
        type: 'leave',
        layerId: this.layer_ && this.layer_.get('id'),
        feature: feature_,
        layer: this.layer_,
        lonlat,
        event
      });
    }
    this.feature_ = feature;
    this.layer_ = layer;
  }

  if (this.cursor_) {
    var style = event.map.getTargetElement().style;
    if (hasFeature) {
      if (style.cursor !== this.cursor_) {
        this.previousCursor_ = style.cursor;
        style.cursor = this.cursor_;
      }
    } else if (this.previousCursor_ !== undefined) {
      style.cursor = this.previousCursor_;
      this.previousCursor_ = undefined;
    }
  }
};
export default HoverInteraction;
