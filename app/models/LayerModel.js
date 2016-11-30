define([
  'jquery', 'underscore', 'backbone',
  'leaflet',
  'esri.leaflet'
], function($,_, Backbone,
  leaflet,
  esriLeaflet
){
  
  var LayerModel = Backbone.Model.extend({
    initialize : function(options){
      this.options = options || {};    
      
      //init loading states
      this.isContentLoading = false
      this.isContentLoaded = false

      // init attributes
      this.id = this.attributes.id
      
      this.setBasemap(typeof this.attributes.basemap !== "undefined" && this.attributes.basemap)      
                  
           
      // model source specific initialisation
      this.initializeModel()      
      
           

    },          
    
    initializeModel: function(){
      // implement in source model              
    },
    
    
    // Load and store layer data on demand
    
    loadData : function (){
      // implement in source model              
    },    
    setData : function (data){
      this.set('mapLayer', data)   
      console.log('data stored ' + this.id)              
      this.handleResult()
    },    
    getMapLayer : function(callback){      
      
      if (this.isLoaded()){   
//        console.log('getmaplayer already loaded ' + this.id)
        if (typeof callback !== 'undefined') {
          callback(this.attributes.mapLayer)
        }
      } else {
        var that = this
        // already loading
        if (this.attributes.loading) {
//          console.log('getmaplayer wait loading ' + that.id)
          waitFor(
            function(){ return that.isLoaded() },
            function(){ 
              if (typeof callback !== 'undefined') {
                callback(that.attributes.mapLayer)
              }
            }
          )
        } else {		  
//          console.log('getmaplayer load data ' + this.id)
          this.loadData(
            function(data){
              that.set('mapLayer', data)   
              console.log('data loaded and stored ' + this.id)

              that.handleResult(callback)
            }              
          )
        }
      }
    },        
    handleResult : function(callback){     
      // store model reference
      this.attributes.mapLayer.options.layerModel = this
      if (typeof callback !== 'undefined') {                
        callback(this.attributes.mapLayer)
      }
    },
    
    
    setParentLayer: function(parentLayer) {
      this.set("parentLayer",parentLayer)
    },
    getParentLayer: function() {
      return this.attributes.parentLayer
    },
    addToMap:function(){
      this.setActive(true)
    },
    removeFromMap:function(){
      this.setActive(false)
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
      
      if (typeof this.attributes.parentLayer !== "undefined") {
        var that = this
      
        this.getMapLayer(function(mapLayer){
          
          if(that.isActive()){             
            if (!that.attributes.parentLayer.hasLayer(mapLayer)) {
-              that.attributes.parentLayer.addLayer(mapLayer)
            }
          } else {
            if (that.attributes.parentLayer.hasLayer(mapLayer)){
-              that.attributes.parentLayer.removeLayer(mapLayer)
            }
          }
        })
      }
      
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
  
  

    // LAYER STYLES    
    initStyles:function(){
  
      
      
      // type styles
      // ref styles
      // styles
      
      this.attributes.layerStyle = {}
      
      // remember type style
      // set default style type (marker)
      if (typeof this.attributes.styleType === 'undefined') {
        this.attributes.styleType = this.attributes.type === "point"
          ? 'marker'
          : this.attributes.type
      }             
      // get default style from config by layer type
      var defaultTypeStyle = _.clone(this.attributes.mapConfig.layerStyles)[this.attributes.styleType]
      // use default style if type stye undefined
      
      this.attributes.layerStyle = typeof defaultTypeStyle !=='undefined' 
        ? _.clone(defaultTypeStyle)
        : _.clone(this.attributes.mapConfig.layerStyles['default'])         
            
      this.attributes.layerStyle.fillColor = this.copyStyleAttribute(this.attributes.layerStyle.color,this.attributes.layerStyle.fillColor)
      this.attributes.layerStyle.fillOpacity = this.copyStyleAttribute(this.attributes.layerStyle.opacity,this.attributes.layerStyle.fillOpacity)      
      
      // extend with ref styles
      if (typeof this.attributes.styleRef !== 'undefined') {
        var refStyle = _.clone(this.attributes.mapConfig.refStyles[this.attributes.styleRef])
        refStyle.fillColor = this.copyStyleAttribute(refStyle.color,refStyle.fillColor)
        refStyle.fillOpacity = this.copyStyleAttribute(refStyle.opacity,refStyle.fillOpacity)        
        if (typeof refStyle !== 'undefined') {
          _.extend(
            this.attributes.layerStyle,
            _.clone(refStyle)
          )
        }
      }
      
      
      // extend with specific styles
      if (typeof this.attributes.style !== 'undefined') {                      
        // transfer stroke to fill properties
        // fillColor: defaults to color
        this.attributes.style.fillColor = this.copyStyleAttribute(this.attributes.style.color,this.attributes.style.fillColor)
        this.attributes.style.fillOpacity = this.copyStyleAttribute(this.attributes.style.opacity,this.attributes.style.fillOpacity)
        // extend default type styles with layer specific styles
         _.extend(
          this.attributes.layerStyle,
          this.attributes.style
        )         
      }
      
      // make sure we have a number
      this.attributes.layerStyle.weight = parseFloat(this.attributes.layerStyle.weight)    
      
      
    },
    copyStyleAttribute : function(from,to){
      if (typeof from !== 'undefined' && typeof to === 'undefined' ){
        return from
      } else {
        return to
      }
    },    
    getLayerStyle : function(){      
     return this.attributes.layerStyle     
    },    






  
  });

  return LayerModel;

});



