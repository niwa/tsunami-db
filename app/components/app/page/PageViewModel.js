define([
  'jquery', 'underscore', 'backbone',
  'models/ViewModel'
], function($,_, Backbone,ViewModel) {

  return ViewModel.extend({
    initialize : function(options){
      this.options = options || {};
    },
    setActivePageId : function(page){
      this.set('pageId', page)
    },
    getActivePageId : function(){
      return this.attributes.pageId
    },    
    setActivePage : function(page){
      this.set('page', page)
    },
    getActivePage : function(){
      return this.hasActivePage()
      ? this.attributes.pages.findWhere({id:this.attributes.pageId})
      : null
    },    
    hasActivePage:function(){
      return typeof this.attributes.pageId !== 'undefined' && this.attributes.pageId !== ""
    },    
    getPageAnchor:function(){
      return this.attributes.anchor
    },    
    setPageAnchor:function(anchor){
      this.set('anchor',anchor)
    },      
   
  });
  

});
