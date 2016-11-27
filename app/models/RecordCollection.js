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
          
          if (typeof attributes.byQueryAttribute(key) !== "undefined") {
            var column = attributes.byQueryAttribute(key).get("column")

            var val = query[key]
            // try number
            if(isNumber(val)) {            
              if(model.get(column) !== val && model.get(column) !== parseInt(val)) {
                pass = false
              } 
            } else {
              if(model.get(column) !== val) {
                pass = false
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
