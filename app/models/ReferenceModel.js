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
      var url = this.attributes.website_report && short 
        ? this.attributes.website_report.substring(0, 50) + "&hellip;"
        : this.attributes.website_report        
      return url && url.indexOf('://') === -1 
        ? 'http://' + url 
        : url
    },
    getDoi:function(){
      return this.attributes.doi
    },
    
  });

  return ReferenceModel;

});



