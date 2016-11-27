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
    byQuery: function(query){
      var attributes = this.options.attributes
      var filtered = this.filter(function(model){
        var pass = true
        var keys = _.keys(query)
        var len = keys.length
        var i = 0
        while(i < len && pass) {
          var key = keys[i]
          var attribute = attributes.byQueryAttribute(key)
          if (typeof attribute !== "undefined") {
            var column = attribute.get("queryColumn")
            var condition = query[key]
            
            if(model.get(column) === null){
              pass = false
            } else {
            
              // check min
              if (key === attribute.getQueryAttribute("min")) {
                if(model.get(column) < parseFloat(condition)) {
                  pass = false
                }     
              // check max
              } else if (key === attribute.getQueryAttribute("max")) {
                if(model.get(column) > parseFloat(condition)) {
                  pass = false
                }               
              // check equality
              } else {            
                // try number
                if(isNumber(condition)) {            
                  if(model.get(column) !== parseFloat(condition)) {
                    pass = false
                  } 
                } else {
                  if(model.get(column) !== condition) {
                    pass = false
                  }
                }
              }
            }
          }          
          i++
        }          
        return pass
      })      
      return new RecordCollection(filtered);         
    }
    
  });

  return RecordCollection;
});
