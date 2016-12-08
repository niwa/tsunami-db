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
    
    
  });

  return ReferenceCollection;
});
