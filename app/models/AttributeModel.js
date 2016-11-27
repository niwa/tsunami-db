define([
  'jquery', 'underscore', 'backbone'
], function($,_, Backbone
){
  
  return Backbone.Model.extend({
    initialize : function(options) {
      this.options = options || {};    
      if (typeof this.get('query') === "undefined" && this.get("combo") !== 1) {
        this.set("query",this.get("column"))
      }       

    },
    getQueryAttribute : function(){
      // TEMP
      return typeof this.attributes.query.min !== "undefined"
        ? this.attributes.query.min
        : this.attributes.query
    }
  });  

});



