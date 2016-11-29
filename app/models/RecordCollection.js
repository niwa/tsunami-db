define([
  'jquery', 'underscore', 'backbone',
  './RecordModel'  
], function(
  $, _, Backbone, model
){
  var RecordCollection = Backbone.Collection.extend({
    model:model,
    initialize: function(models,options) {            
      this.options = options || {};       
    
    },    
    byActive: function(active){
      active = typeof active !== 'undefined' ? active : true         
      var filtered = this.filter(function(model){
        return model.isActive() === active
      })
      return new RecordCollection(filtered);         
    },
    updateActive:function(query){
      this.each(function(model){
        model.setActive(model.pass(query))        
      })
    },
    byQuery: function(query){
      var filtered = this.filter(function(model){
        return model.pass(query)
      })      
      return new RecordCollection(filtered);         
    }
    
  });

  return RecordCollection;
});
