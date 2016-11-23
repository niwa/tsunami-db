define([
  'jquery', 'underscore', 'backbone',
  'leaflet',
  'models/ViewModel'
], function(
  $,_, Backbone,
  leaflet,
  ViewModel
){

  return ViewModel.extend({
    initialize : function(options){
      this.options = options || {};

      this.set('activeLayers',[])
      this.set('removeLayers',[])
      this.set('addLayers',[])
      this.set('keepLayers',[])

      this.set('mapConfigured',false)
      
      this.set('mapControl',null)
//      this.loadMapConfig()
      this.processMapConfig()
    },
    processMapConfig : function(){
      this.setConfigViews(this.attributes.config.views)
    },
    preloadLayer :function(layer){
      if (layer.get("type") !== 'point'
        && layer.get("type") !== 'raster'
      ) {
        layer.getMapLayer(
          function(){},
          {
            map:this.attributes.map
          }
        )
      }
    },
    getConfig : function(){
      return this.attributes.config
    },
    getMapOptions : function(){
      var options = _.clone(this.attributes.mapOptions)

      if (this.getMode() === 'print') {
        options.maxZoom = options.maxZoom + 2
      }

      return options
    },
    mapConfigLoaded : function(){
        return typeof this.attributes.config !== 'undefined'
    },
    mapConfigured : function(val){
      if (typeof val !== 'undefined') {
        return this.set('mapConfigured',val)
      } else {
        return this.attributes.mapConfigured
      }
    },
    setView : function(view){
      this.set('view',view)
    },
    getView : function (){
      return this.attributes.view
    },
    setConfigViews : function(views){
      this.set('configViews',views)
    },
    getConfigView : function(view){
      return this.attributes.configViews[view]
    },
    getDefaultView : function (){
      return this.getConfigView('default')
    },
    setBaseLayers : function(layers){
      this.set('baseLayers', layers)
    },
    getBaseLayers : function(){
      return this.attributes.baseLayers
    },
    setActiveLayers : function(activeLayers){
      var previousActiveLayers = _.clone(this.attributes.activeLayers)
      var that = this
      waitFor(
        function(){
          return that.mapConfigured()
        },
        function(){
          that.set('activeLayers', activeLayers) // new active layers          
          that.set('removeLayers', _.difference(
            previousActiveLayers, 
            activeLayers
          )) // in previous layers but not in active
          that.set('addLayers', _.difference(
            activeLayers,
            previousActiveLayers
          )) // in active layers but not in previous
          that.set('keepLayers', _.intersection(
            previousActiveLayers,
            activeLayers
          )) // previous and active layers                    
        }
      )
    },

    activeLayersLoading : function(){
      var layersLoading =  _.where(_.pluck(this.attributes.activeLayers,'attributes'),{'loading':true})      
      return layersLoading.length > 0
    },
    getActiveLayers : function(){
      return this.attributes.activeLayers
    },
    getRemoveLayers : function(){
      return this.attributes.removeLayers
    },
    getAddLayers : function(){
      return this.attributes.addLayers
    },
    setAddLayers : function(addLayers){
      this.set('addLayers', addLayers)
    },
    getKeepLayers : function(){
      return this.attributes.keepLayers
    },
    featuresUpdated : function(){
      this.set('featuresUpdated', Date.now())
    },
    invalidateSize : function(){
      this.set('invalidateSize', Date.now())
    },
    getZoom : function(){
      return this.attributes.zoom
    },
    getMapControl : function(){
      return this.attributes.mapControl
    },
    setMapControl : function(bool){
      this.set('mapControl', bool)
    },
    setMap : function(map){
      this.set('map', map)
    },
    setMapOptions : function(mapOptions){
      this.set('mapOptions', mapOptions)
    },
    getMode : function(){
      return this.attributes.mode
    },
    getType : function(){
      return this.attributes.type
    }

  });


});
