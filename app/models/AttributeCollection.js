define([
  'jquery', 'underscore', 'backbone',
  './AttributeModel'    
], function(
  $, _, Backbone,model
){
  var AttributeCollection = Backbone.Collection.extend({
    model:model,    
    initialize: function(models,options) {            
      this.options = options || {}; 
    },
    byGroup:function(groupId){
      var filtered = this.filter(function(model){
        return model.get("group") === groupId
      })
      return new AttributeCollection(filtered);  
    },
    byFilterable:function(){
      var filtered = this.filter(function(model){
        return model.get("filterable") === 1
      })      
      return new AttributeCollection(filtered);  
    },
    
  });

  return AttributeCollection;
});
