define([
  'jquery', 'underscore', 'backbone'
], function(
  $, _, Backbone
){
  var FeatureCollection = Backbone.Collection.extend({
    initialize: function(models,options) {            
      this.options = options || {}; 
    }
    
  });

  return FeatureCollection;
});
