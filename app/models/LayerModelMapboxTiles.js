define([
  'jquery', 'underscore', 'backbone',  
  './LayerModel',
  'leaflet'
], function($,_, Backbone,
  LayerModel,
  leaflet
){
  
  var LayerModelMapboxTiles = LayerModel.extend({    
    loadData : function (callback){    
      //console.log('try loading tile layer: ' + this.id)
      this.setLoading(true)     
      
      var mapid = this.attributes.options.id
             
      var options = _.extend(
        {},
        {
          detectRetina: false,
          id: mapid,
          subdomains: ['a','b','c','d'],
          token: this.attributes.options.token,
          zIndex: this.isBasemap() ? 0 : 1,
          opacity: typeof this.attributes.options.opacity !== 'undefined' 
            ? this.attributes.options.opacity
            : this.attributes.layerStyle.opacity   
        },
        this.attributes.options
      )      
      var that = this     
      callback (
        L.tileLayer(
          'http://{s}.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={token}',
          options
        )
        .on('loading',function(){
          //console.log("start loading tile layer")  
        })
        .on('load',function(){
          that.setLoading(false)
          //console.log("success loading tile layer")  
        })        
      )
      
      

    
    }

  });

  return LayerModelMapboxTiles;

});



