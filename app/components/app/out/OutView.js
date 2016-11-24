define([
  'jquery',  'underscore',  'backbone',
  './map/MapView', './map/MapModel',
  'text!./out.html'
], function (
  $, _, Backbone,
  MapView, MapModel,  
  template
) {

  var OutView = Backbone.View.extend({
    events : {
      
    },
    initialize : function () {
      
      // shortcut
      this.views = this.model.getViews()
      
      this.render()
      
      this.listenTo(this.model, "change:mapInit", this.updateMap);
      this.listenTo(this.model, "change:mapView", this.updateMap);      
    },
    render: function () {
      this.$el.html(_.template(template)({t:this.model.getLabels()}))      
      return this
    }, 
    updateMap : function(){
      var componentId = '#map'
      
      if (this.$(componentId).length > 0) {

//        var that = this
//        // wait for config files to be read
//        waitFor(
//          function(){
//            return that.model.isMapInit()
//          },
//          function(){
//            console.log('rendermap')
//            that.views.map = that.views.map || new MapView({
//              el:that.$(componentId),
//              model: new MapModel({
//                baseLayers: that.model.getLayers().byBasemap(true), // pass layer collection
//                config:     that.model.getMapConfig(),
//                labels:     that.model.getLabels()
//              })              
//            });
//            // update map component
//            if (that.model.isComponentActive(componentId)) {
//              console.log('mapactive')
//              that.views.map.model.setActive(true)      
//      
//              that.views.map.model.setView(that.model.getActiveMapview())
//              that.views.map.model.setActiveLayers(that.model.getMapLayers().models) // set active layers
//              
//              that.views.map.model.invalidateSize()
//
//            } else {
//              that.views.map.model.setActive(false)
//            }
//
//
//          }
//        )
      }
    },    
  });

  return OutView;
});
