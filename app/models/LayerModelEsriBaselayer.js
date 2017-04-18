define([
  'jquery', 'underscore', 'backbone',  
  './LayerModel',
  'leaflet',
  'esri.leaflet'
], function($,_, Backbone,
  LayerModel,
  leaflet,
  esriLeaflet
){
  
  return LayerModel.extend({    
    loadData : function (callback){    
      //console.log('try loading tile layer: ' + this.id)
      this.setLoading(true)     
      
      var mapid = this.attributes.options.id
       

      var options = _.extend(
        {},
        {
          detectRetina: false,
          zIndex: this.isBasemap() ? 0 : 1,
          opacity: typeof this.attributes.options.opacity !== 'undefined' 
            ? this.attributes.options.opacity
            : this.attributes.layerStyle.opacity         
        },
        this.attributes.options
      )
      
      var that = this
      callback (
        L.esri.basemapLayer(
          mapid,
          options
        )
        .on('loading',function(){
          that.setLoading(true)
          //console.log("start loading tile layer")  
        })
        .on('load',function(){
          that.setLoading(false)
//          console.log("success loading esri layer")  
        })        
      )
      
    }

  });

});



