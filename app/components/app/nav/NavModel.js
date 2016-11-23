define([
  'jquery', 'underscore', 'backbone'
], function($,_, Backbone) {

  return Backbone.Model.extend({
    initialize : function(options){
      this.options = options || {};
    },
    setActivePath : function (path) {
      this.set('activePath', path)
    },
    setActivePage : function (page) {
      this.set('activePage', page)
    },
    getActivePage : function (){
      return this.attributes.activePage
    }
  });
  

});
