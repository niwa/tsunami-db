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
    byAttribute:function(att,val){
      val = typeof val !== "undefined" ? val : 1
      var filtered = this.filter(function(model){
        return model.get(att) === val 
                && model.get("combo") !== 1 //temp
      })      
      return new AttributeCollection(filtered);  
    },
    byQueryAttribute:function(queryAttribute){
      return this.filter(function(model){
        return model.getQueryAttribute("value") === queryAttribute
          || model.getQueryAttribute("min") === queryAttribute
          || model.getQueryAttribute("max") === queryAttribute
      })[0]                        
    }
  });

  return AttributeCollection;
});
