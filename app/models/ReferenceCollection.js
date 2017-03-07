define([
  'jquery', 'underscore', 'backbone',
  './ReferenceModel'  
], function(
  $, _, Backbone, model
){
  var ReferenceCollection = Backbone.Collection.extend({
    model:model,
    initialize: function(models,options) {            
      this.options = options || {};       
    
    },    
    toCSV:function(){
      
      var columnDelimiter = ',';
      var lineDelimiter = '\n'
      var csv = '';
      
      // add header
      var keys = _.without(Object.keys(this.models[0].attributes),'featureAttributeMap')
      
      csv += keys.join(columnDelimiter);
      csv += lineDelimiter;
      
      // add rows 
      // for each record
      _.each(this.models,function(model){
        // for each column
        _.each(keys,function(key,i){
          if (i > 0) {
            csv += columnDelimiter
          }
          csv += '"'
          csv += model.get(key) ? model.get(key).toString().replace(/"/g, '\""') : "";                  
          csv += '"'
        })
        csv += lineDelimiter
      })
      return csv
    }    
    
  });

  return ReferenceCollection;
});
