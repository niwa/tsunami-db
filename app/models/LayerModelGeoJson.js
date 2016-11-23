define([
  'jquery', 'underscore', 'backbone',  
  'leaflet',  
  './LayerModel',
  './FeatureModel',
  './FeatureCollection',  
], function(
  $,_, Backbone,
  leaflet,  
  LayerModel,
  FeatureModel,
  FeatureCollection
){
  
  var LayerModelGeoJson = LayerModel.extend({    
    initializeSource:function(){
      
      if (typeof this.attributes.featureAttributeMap === 'undefined') { 
        this.set("featureAttributeMap",{})
      }
      
      
      if (typeof this.attributes.wrap === 'undefined') {
        this.set('wrap',false)
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
      
      this.initLabelOptions()
      
    },
    getBounds : function(){
      return this.attributes.bounds
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
          callback(
            that.geoJson(data)            
          )              
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
          style : _.bind(this.getStyleByFeature,this),
          filter : function(feature){
            return that.filterByFeature(feature,that)
          },
          className : this.getClassName()
        }
      )
    },    
    
    
    handleResult : function(result,callback){
            // todo add error handling
//              console.log('data loaded ' + that.id)
      switch (this.attributes.type) {
        case 'polygon' :
        case 'line' :
        case 'point' :
          this.set('mapLayer', this.handleResultForFeatureLayer(result))
          // create controlLayer
          if (typeof this.attributes.controlLayer !== 'undefined') {        
            this.set('controlLayerGroup', this.createControlGroup())
          }
          // create markerLayer
          if (typeof this.attributes.controlPointLayer !== 'undefined') {
            this.set('controlPointLayerGroup',this.createControlPointGroup())
          }
          break                
        default:
          this.set('mapLayer', result) 
          break                
      }

      this.attributes.mapLayer.options.layerModel = this

      console.log('data loaded and stored ' + this.id)
      if (typeof callback !== 'undefined') {                
        callback(this.attributes.mapLayer)
      }
    },        
    

    handleResultForFeatureLayer: function(result) {
      // set up featureGroup   
      var featureGroup 
        
      if (this.attributes.cluster){          
        // Warning: this icon create function is specific to the casestudy point layers
        var clusterOptions = {} 
      
        featureGroup = L.markerClusterGroup(
          _.extend(
            {},
            this.collection.options.mapConfig.clusterOptions,
            clusterOptions
          )
        )
        .addLayers(result.getLayers())        
      } else {
        featureGroup = result
      }
      
      // create feature collection and models
      featureGroup.collection =  this.createFeatureCollection(result) 
      
      return featureGroup
    },

    createFeatureCollection:function(featureGroup){
      return new FeatureCollection(
        _.map(featureGroup.getLayers(),function(featureLayer){                                    
          return _.extend({}, 
            featureLayer.feature.properties,
            {
              featureLayer : featureLayer,
              parentLayer  : this
            }
          )
        },this),      
        {
          model: FeatureModel,
          eventContext : this.collection.options.eventContext
        }
      )
    },   

    
    // geoJson option functions    
    getClassName : function(){
      return 'map-layer map-layer-'+this.id+' '+'map-layer-type-'+this.attributes.type
    },
    pointToLayer : function(latLng){
      return new L.circleMarker(
        latLng                              
      )             
    },
    coordsToLatLng: function (coords) {                  
      var longitude = coords[0];
      var latitude = coords[1];

      var latlng = L.latLng(latitude, longitude);

      // TODO make configurable
      if (this.attributes.wrap && longitude > 20) {
        return latlng.wrap(-540, 180);
      }
      else {
        return latlng;
      }
    },
    filterByFeature : function(feature, that) {
      // apply all filters 
      return typeof that.attributes.filters !== 'undefined' 
        ? _.reduce(that.attributes.filters, function(bool,val,key){              
            return bool || feature.properties[key] === val
          }, false)
        : true
    },
    
    
    
    
    
    
    
    
    
    getFeatures :function(callback){
      var that = this
      waitFor(
        function(){
          return that.isLoaded() 
        },
        function(){
          callback(that.attributes.mapLayer.collection)
        }
      )
    },

    
    setShowControlPointLayer:function(bool){
      this.set('showControlPointLayer',bool)
    },
    showControlPointLayer:function(){
      return this.attributes.showControlPointLayer 
        && typeof this.attributes.controlPointLayerGroup !== 'undefined'       
    },
    showControlLayer:function(){
      return typeof this.attributes.controlLayerGroup !== 'undefined'       
    },
    
    getControlLayer:function(){
      return this.attributes.controlLayerGroup
    },
    getControlPointLayer:function(){
      return this.attributes.controlPointLayerGroup
    },
    hasControlLayer:function(){
      return typeof this.attributes.controlLayer !== 'undefined'
    },
    hasControlPointLayer:function(){
      return typeof this.attributes.controlPointLayer !== 'undefined'
    },

    initLabelOptions : function(){       // options
      
      // set up label options
      if (typeof this.attributes.labelOptions === 'undefined') {
        this.set('labelOptions', {})
      }
      // extend general options
      var options = this.collection.options.mapConfig         
      if (typeof options !== 'undefined' 
        && typeof options.labelOptions !== 'undefined') {
        _.extend(this.attributes.labelOptions, options.labelOptions)
      }
      
      if (typeof this.attributes.labelOptions.className === 'undefined'){
        this.attributes.labelOptions.className = ""
      }
      this.attributes.labelOptions.className 
              += ' feature-label' 
              + ' feature-label-' + this.attributes.type             
              + ' feature-label-' + this.id
    },
    getLabelOptions : function(){
      
      return this.attributes.labelOptions
    },
    
    
  });

  return LayerModelGeoJson

});



