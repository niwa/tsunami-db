define([
  'jquery', 'underscore', 'backbone',
  './ContentModel'
], function($,_, Backbone, 
  ContentModel
){

  var PageModel = ContentModel.extend({
    initialize : function(options) {
      this.options = options || {};    
      this.isContentLoading = false
      this.isContentLoaded = false  
      
      this.set('url',this.attributes.path)
      this.set('class','page-' + this.id)
    
    },
    getFormat:function(){
      return this.attributes.format
    },
    getTitle:function(){
      return this.attributes.title
    },
    getClass:function(){
      return this.attributes.class
    }
    
  });

  return PageModel;

});



