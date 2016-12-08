define([
  'jquery', 'underscore', 'backbone'
], function($,_, Backbone){
  
  var ProxyModel = Backbone.Model.extend({
    initialize : function(options) {
      this.options = options || {};    
      // map data attributes
      if (typeof this.attributes.featureAttributeMap !== 'undefined'){
        this.mapAttributes(this.attributes.featureAttributeMap)
      }

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
    },
    getDescription:function(){
      return this.attributes.description
    }    
  });

  return ProxyModel;

});



