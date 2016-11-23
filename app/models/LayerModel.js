define([
  'jquery', 'underscore', 'backbone',
  './ContentModel',
  'leaflet',
  'esri.leaflet',
  'text!templates/layerKeyIconTemplate.html',
  'text!templates/layerKeyContinuousTemplate.html'
], function($,_, Backbone,
  ContentModel,    
  leaflet,
  esriLeaflet,
  layerKeyIconTemplate,
  layerKeyContinuousTemplate
){
  
  var LayerModel = ContentModel.extend({
    initialize : function(options){
      this.options = options || {};    
      
      //init loading states
      this.isContentLoading = false
      this.isContentLoaded = false

      // init attributes
      this.id = this.attributes.id
      
      this.setBasemap(typeof this.attributes.basemap !== "undefined" && this.attributes.basemap)      
                  
      this.set('mapConfig',this.collection.options.mapConfig)
           
      this.setActive(this.isBasemap())
      
      // model source specific initialisation
      this.initializeSource()      
      
      // init layer styles
      this.initStyles()
      this.initLayerCategories()
      
      
           

    },           
    initializeSource: function(){
      // implement in source model              
    },
    loadData : function (){
      // implement in source model              
    },    
    fadeEnabled : function(){
      return this.get('type') !== 'raster'
    },       
    setActive : function(active){
      active = typeof active !== 'undefined' ? active : true   
      // only when not active already
      if (!this.isActive()) {
        this.set('activeTime',active ? Date.now() + this.attributes.order : false) // warning hack to break same time tie        
      }
      this.set('active',active)      
    },
    getActiveTime : function(){
      return this.attributes.activeTime
    },    
    getOrder:function(){
      return this.attributes.order
    },    
    isActive : function(){
      return this.attributes.active
    },      

  
    setBasemap : function(basemap){
      basemap = typeof basemap !== 'undefined' ? basemap : true        
      this.set('basemap', basemap)
    },    
    isBasemap : function(){
      return this.attributes.basemap
    },    
    setLoading : function(loading){
      loading = typeof loading !== 'undefined' ? loading : true            
      this.set('loading',loading)
    },
    isLoading : function(){
      return this.attributes.loading
    },
    isLoaded : function(){
      return typeof this.attributes.mapLayer !== 'undefined' && !this.isLoading() 
    },        
    getBounds : function(){
      return this.attributes.bounds
    },
  
  

  
    initStyles:function(){
  
    },

    
    getLayerStyle : function(){      
     return this.attributes.layerStyle     
    },

   
    
    getMapLayer : function(callback,options,force){      
      force = typeof force !== 'undefined' ? force : false
      
      
      
      if (this.isLoaded() && !force){   
//        console.log('getmaplayer already loaded ' + this.id)
        if (typeof callback !== 'undefined') {
          callback(this.attributes.mapLayer)
        }
      } else {
        var that = this
        // already loading
        if (this.attributes.loading && !force) {
//          console.log('getmaplayer wait loading ' + that.id)
          waitFor(
            function(){ return that.isLoaded() },
            function(){ 
              if (typeof callback !== 'undefined') {
                callback(that.attributes.mapLayer )
              }
            }
          )
        } else {		  
//          console.log('getmaplayer load data ' + this.id)
          this.loadData(
            function(result){
              that.handleResult(result,callback)
            },
            options
          )
        }
      }
    },        
    handleResult : function(result,callback){
            // todo add error handling
//              console.log('data loaded ' + that.id)
     
      this.set('mapLayer', result) 

      this.attributes.mapLayer.options.layerModel = this

      console.log('data loaded and stored ' + this.id)
      if (typeof callback !== 'undefined') {                
        callback(this.attributes.mapLayer)
      }
    }
  
  });

  return LayerModel;

});



