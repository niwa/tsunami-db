define([
  'jquery', 'underscore', 'backbone',
  './AttributeGroupModel'
], function(
  $, _, Backbone,model
){
  var AttributeGroupCollection = Backbone.Collection.extend({
    model:model,    
    initialize: function(models,options) {            
      this.options = options || {}; 
    }
    
  });

  return AttributeGroupCollection;
});
