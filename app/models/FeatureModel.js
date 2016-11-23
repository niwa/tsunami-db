define([
  'jquery', 'underscore', 'backbone',
  'leaflet'
], function($,_, Backbone, 
  leaflet
){
  
  var FeatureModel = Backbone.Model.extend({
    initialize : function(options) {
      this.options = options || {};    
        
 

    } 
  });

  return FeatureModel;

});



