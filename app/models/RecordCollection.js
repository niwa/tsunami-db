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
    },
    getValuesForColumn:function(column){
      var values = []
      _.each(this.models,function(model){
        if(model.get(column) !== null) {
          values = _.union(values,model.get(column).split(','))
        }
      })           
      return values.sort(function(a,b){
        return a === "Unknown" ? -1 : b === "Unknown" ? 1
            : a < b ? -1 : a > b ? 1 : 0 
      })      
    },
    setColumns:function(columns){
      this.options.columns = columns      
    },
    getColumns : function(){
      return this.options.columns
    },      
    // Proxies ========================================================================
    setProxies: function(collection){
      this.options.proxies = collection
    },
    // returns collection
    getProxies : function(){
      return this.options.proxies
    },  
    // References ========================================================================
    setReferences: function(collection){
      this.options.references = collection
    },
    // returns collection
    getReferences: function(){
      return this.options.references
    },      
        
    
  });

  return RecordCollection;
});
