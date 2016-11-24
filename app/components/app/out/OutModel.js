define([
  'jquery', 'underscore', 'backbone',
  'models/ViewModel'
], function($,_, Backbone,ViewModel) {

  return ViewModel.extend({
    initialize : function(options){
      this.options = options || {}
      
      this.set("mapInit",false)
      this.set("views",{})
    },
    getOutType:function(){
      return this.attributes.outType
    },  
    getViews:function(){
      return this.attributes.views
    },  
    setMapInit:function(bool){
      this.set("mapInit",bool)
    },
    isMapInit:function(){
      return this.attributes.mapInit
    },
		getLayers : function() {
			return this.attributes.layerCollection;
		},
		setLayers : function(layers) {
			this.set('layerCollection',layers);
			return this;
		},
    getMapLayers : function() {
      return this.attributes.layerCollection.byActiveMap()
    },    
    getMapConfig : function(){
      return this.attributes.mapConfig
    },
		getActiveMapview : function(){
      return this.attributes.mapView
    },    
    isComponentActive : function(componentId) {
      
      // component conditions
      var componentConditions = {        
        "#map":this.getOutType()==="map"
      }
      
      return (typeof componentConditions[componentId] !== 'undefined' && componentConditions[componentId])            
      
    },    
  });
  

});
