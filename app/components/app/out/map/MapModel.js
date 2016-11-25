define([
  'jquery', 'underscore', 'backbone',
  'models/ViewModel'
], function(
  $,_, Backbone,
  ViewModel
){

  return ViewModel.extend({
    initialize : function(options){
      this.options = options || {};

      this.set('currentLayers',[])
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
    setCurrentLayers : function(currentLayers){
      var previousCurrentLayers = _.clone(this.attributes.currentLayers)
      var that = this
      waitFor(
        function(){
          return that.mapConfigured()
        },
        function(){
          that.set('currentLayers', currentLayers) // new active layers          
          that.set('removeLayers', _.difference(
            previousCurrentLayers, 
            currentLayers
          )) // in previous layers but not in active
          that.set('addLayers', _.difference(
            currentLayers,
            previousCurrentLayers
          )) // in active layers but not in previous
          that.set('keepLayers', _.intersection(
            previousCurrentLayers,
            currentLayers
          )) // previous and active layers                    
        }
      )
    },

    currentLayersLoading : function(){
      var layersLoading =  _.where(_.pluck(this.attributes.currentLayers,'attributes'),{'loading':true})      
      return layersLoading.length > 0
    },
    getCurrentLayers : function(){
      return this.attributes.currentLayers
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
