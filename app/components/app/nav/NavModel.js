define([
  'jquery', 'underscore', 'backbone',
  'models/ViewModel'
], function($,_, Backbone,ViewModel) {

  return ViewModel.extend({
    initialize : function(options){
      this.options = options || {};
    },
    setActivePath : function (path) {
      this.set('path', path)
    },
    getActivePath : function (){
      return this.attributes.path
    },   
    setActiveRoute : function (route) {
      this.set('activeRoute', route)
    },
    getActiveRoute : function (){
      return this.attributes.route
    },   
    getNavItems : function (){
      return this.attributes.navItems
    },   
  });
  

});
