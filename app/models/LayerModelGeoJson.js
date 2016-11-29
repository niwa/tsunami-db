define([
  'jquery', 'underscore', 'backbone',  
  'leaflet',  
  './LayerModel' 
], function(
  $,_, Backbone,
  leaflet,  
  LayerModel
){
  
  var LayerModelGeoJson = LayerModel.extend({    
    initializeModel:function(){
      
      if (typeof this.attributes.wrap === 'undefined') {
        this.set('wrap',true)
      }
      
      if (this.attributes.wrap && typeof this.attributes.bounds !== 'undefined'){
        var _bounds = this.attributes.bounds.split('|')
        
        if (_bounds.length === 4 && _bounds[1] > 20) {
          var sw = L.latLng(_bounds[0],_bounds[1]).wrap(-540, 180)
          var ne = L.latLng(_bounds[2],_bounds[3]).wrap(-540, 180)
          
          this.attributes.bounds = 
            sw.lat + '|' 
            + sw.lng + '|'
            + ne.lat + '|'
            + ne.lng
        }
      }
            
    },
    getBounds : function(){
      return this.attributes.bounds
    },
    setData : function (data){
      data = this.geoJson(data)
      this.set('mapLayer', data)   
//      console.log('layer created ' + this.id)              
      this.handleResult()
    },  
    loadData : function (callback){       
      console.log('try loading geojson layer: ' + this.id)
      this.setLoading(true)
      
      var that = this     

      $.ajax({
        dataType: "json",
        url: this.attributes.baseurl + '/' + this.attributes.path,
        success: function(data) {
          that.setLoading(false)
          console.log("success loading geojson layer: " + that.id)          
          callback(that.geoJson(data))                        
        },
        error: function(){
            console.log("error loading geojson layer")

            that.setLoading(false)
        }
      });        
    },

    geoJson:function(geojson){
      var that = this
      return L.geoJson(
        geojson,
        {
          coordsToLatLng: _.bind(this.coordsToLatLng,this),
          pointToLayer: _.bind(this.pointToLayer,this),
          className : this.getClassName()
        }
      )
    },    
                
    
    
    // geoJson option functions    
    getClassName : function(){
      return 'map-layer map-layer-'+this.id+' '+'map-layer-type-'+this.attributes.type
    },
    pointToLayer : function(featureData,latLng){
      var layerStyle = typeof featureData.properties.style !== 'undefined' 
        ? featureData.properties.style
        : this.attributes.layerStyle      
      return new L.circleMarker(
        latLng,  
        layerStyle                              
      )             
    },
    coordsToLatLng: function (coords) {                  
      var longitude = coords[0];
      var latitude = coords[1];

      // TODO make configurable
      if (this.attributes.wrap && longitude < 0) {
        return L.latLng(latitude, longitude + 360)
      }
      else {
        return L.latLng(latitude, longitude)
      }
    },
    
    
    updateMapLayerStyle :function(){
      if (typeof this.attributes.mapLayer.setStyle === 'function') {
        this.attributes.mapLayer.setStyle(this.attributes.mapLayer.options.style)
      }
    },    
    
   
    
  });

  return LayerModelGeoJson

});



