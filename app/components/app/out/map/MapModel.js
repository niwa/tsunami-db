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
     
      this.set('mapConfigured',false)
      this.set("views",{})
      
      
    },
    getViews:function(){
      return this.attributes.views
    },      
    setLayerGroups:function(groups) {
      this.set('layerGroups',groups)
    },
    getLayerGroups:function() {
      return this.attributes.layerGroups
    },
    getLayerGroup:function(groupid) {
      return this.attributes.layerGroups[groupid]
    },
    getConfig : function(){
      return this.attributes.config
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
    getConfigView : function(view){
      return this.attributes.config.views[view]
    },
    getDefaultView : function (){
      return this.getConfigView('default')
    },
    
//
//    currentLayersLoading : function(){
//      var layersLoading =  _.where(_.pluck(this.attributes.currentLayers,'attributes'),{'loading':true})      
//      return layersLoading.length > 0
//    },
		getLayers : function() {
			return this.attributes.layerCollection;
		},
		setLayers : function(layers) {
			this.set('layerCollection',layers);
			return this;
		},
    layersUpdated : function(){
      this.set('layersUpdated', Date.now())
    },
    invalidateSize : function(){
      this.set('invalidateSize', Date.now())
    },
    getZoom : function(){
      return this.attributes.zoom
    },
    setMap : function(map){
      this.set('map', map)
    },    
    getMap : function(){
      return this.get("map")
    },    
    getType : function(){
      return this.attributes.type
    },
    getOutColorColumn:function(){
      return this.attributes.outColorColumn
    }, 
    getOutType:function(){
      return this.attributes.outType
    },     
  });


});
