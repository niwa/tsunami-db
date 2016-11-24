define([
  'jquery', 'underscore', 'backbone'
], function($,_, Backbone){
  
  var RecordModel = Backbone.Model.extend({
    initialize : function(options) {
      this.options = options || {};    
      // map data attributes
      if (typeof this.collection.options.config.attributes.featureAttributeMap !== 'undefined'){
        this.mapAttributes(this.collection.options.config.attributes.featureAttributeMap)
      }
      this.attributes.feature.properties.id = this.id
      
    },
    mapAttributes:function(featureAttributeMap){
      _.each(
        featureAttributeMap,
        function(attr,key){                     
          this.set(key, this.attributes[attr] !== null 
            ? this.attributes[attr]
            : ''
          )

        },
        this
      )      
    } 
  });

  return RecordModel;

});



