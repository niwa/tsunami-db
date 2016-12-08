define([
  'jquery', 'underscore', 'backbone',
  './ProxyModel'  
], function(
  $, _, Backbone, model
){
  var ProxyCollection = Backbone.Collection.extend({
    model:model,
    initialize: function(models,options) {            
      this.options = options || {};       
    
    },    
    
    
  });

  return ProxyCollection;
});
