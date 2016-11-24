define([
  'jquery', 'underscore', 'backbone',
  './LayerModel'
], function(
  $, _, Backbone,
  model
){
  var LayerCollection = Backbone.Collection.extend({
    model: model,

    initialize: function(models,options) {      
      
      this.options = options || {};     
      
      this.on("add", function(model){
        model.set('baseurl',this.options.baseurl)
      });
      
    },
    byIds:function(ids) {
      var filtered = this.filter(function(model) {
        return ids.indexOf(model.id) > -1
      });
      return new LayerCollection(filtered);
    },    
    bySource:function(source){      
      return new LayerCollection(this.where({source:source}))   
    },      
    setActive:function(ids){ 
      ids = typeof ids === 'object' ? ids : [ids]
      this.each(function(model){
        model.setActive(ids.indexOf(model.id) > -1 || model.isBasemap())        
      })
    },    
    byActive:function(bool){
      bool = typeof bool !== 'undefined' ? bool : true      
      return new LayerCollection(                
        _.sortBy(
          this.where({active:bool}),
          'activeTime',
          this
        )      
      )
    },
    byActiveMap:function(){      
      return new LayerCollection(                
        _.reject(this.byActive().models,function(l){
            return l.isBasemap()
        })          
      )
    },    
    byBasemap:function(bool){
      bool = typeof bool !== 'undefined' ? bool : true      
      return new LayerCollection(this.where({basemap:bool}))   
    },
    byLoading:function(bool){
      bool = typeof bool !== 'undefined' ? bool : true      
      return new LayerCollection(this.where({loading:bool}))     
    },
    isLoading:function(){          
      return this.byLoading().length > 0
    },
    getIds:function(){
      return _.map(this.models,function(model){ return model.id})
    }

  });

  return LayerCollection;
});
