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
    
  });

  return RecordCollection;
});
