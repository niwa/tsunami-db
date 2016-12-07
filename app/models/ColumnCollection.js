define([
  'jquery', 'underscore', 'backbone',
  './ColumnModel'    
], function(
  $, _, Backbone,model
){
  var ColumnCollection = Backbone.Collection.extend({
    model:model,    
    initialize: function(models,options) {            
      this.options = options || {}; 
    },
    byGroup:function(groupId){
      var filtered = this.filter(function(model){
        return model.get("group") === groupId
      })
      return new ColumnCollection(filtered);  
    },    
    byColumn:function(column,val){
      val = typeof val !== "undefined" ? val : 1
      var filtered = this.filter(function(model){
        return model.get(column) === val 
                && model.get("combo") !== 1 //temp
      })      
      return new ColumnCollection(filtered);  
    },
    byQueryColumn:function(queryColumn){
      return this.filter(function(model){
        return model.getQueryColumn("value") === queryColumn
          || model.getQueryColumn("min") === queryColumn
          || model.getQueryColumn("max") === queryColumn
      })[0]                        
    }
  });

  return ColumnCollection;
});
