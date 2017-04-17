define([
  'jquery', 'underscore', 'backbone'
], function($,_, Backbone){
  
  var ReferenceModel = Backbone.Model.extend({
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
    getTitle:function(){
      return this.attributes.reference
    },
    getReference:function(){
      return this.attributes.full_reference
    },
    getUrl:function(short){
      short = typeof short !== 'undefined' ? short : false
      return short 
        ? this.attributes.website_report.substring(0, 50) + "&hellip;"
        : this.attributes.website_report
    },
    getDoi:function(){
      return this.attributes.doi
    },
    
  });

  return ReferenceModel;

});



