define([
  'jquery', 'underscore', 'backbone',
  './ColumnGroupModel'
], function(
  $, _, Backbone,model
){
  var ColumnGroupCollection = Backbone.Collection.extend({
    model:model,    
    initialize: function(models,options) {            
      this.options = options || {}; 
    }
    
  });

  return ColumnGroupCollection;
});
