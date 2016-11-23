define([
  'jquery', 'underscore', 'backbone',
  './LayerModel'
], function(
  $, _, Backbone,
  model
){
  var LayerCollection = Backbone.Collection.extend({
    model: model,

    initialize: function(models,options) {      
      
      this.options = options || {};     
      
      
    }


  });

  return LayerCollection;
});
