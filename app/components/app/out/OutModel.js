define([
  'jquery', 'underscore', 'backbone',
  'models/ViewModel'
], function($,_, Backbone,ViewModel) {

  return ViewModel.extend({
    initialize : function(options){
      this.options = options || {}
      
      this.set("dataToggled",false)
      this.set("mapInit",false)
      this.set("views",{})
    },
    getOutType:function(){
      return this.attributes.outType
    },  
    getOutMapType:function(){
      return this.attributes.outMapType
    },  
    getOutColorColumn:function(){
      return this.attributes.outColorColumn
    },  
    getOutPlotColumns:function(){
      return this.attributes.outPlotColumns
    },  
    getViews:function(){
      return this.attributes.views
    },  
		getLayers : function() {
			return this.attributes.layerCollection;
		},
		setLayers : function(layers) {
			this.set('layerCollection',layers);
			return this;
		},
		getRecords : function() {
			return this.attributes.recordCollection;
		},
		setRecords : function(records) {
			this.set('recordCollection',records);
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
        "#map":false//this.getOutType()==="map"
      }
      
      return (typeof componentConditions[componentId] !== 'undefined' && componentConditions[componentId])            
      
    },   
    getRecordsUpdated: function(){
      return this.attributes.recordsUpdated
    }
  });
  

});
