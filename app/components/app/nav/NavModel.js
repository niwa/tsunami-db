define([
  'jquery', 'underscore', 'backbone',
  'models/ViewModel'
], function($,_, Backbone,ViewModel) {

  return ViewModel.extend({
    initialize : function(options){
      this.options = options || {};
      
      this.set("navItems", _.map(this.attributes.navItems,function(item){
          item.type = typeof item.type !== "undefined" ? item.type : "page"
          item.route = typeof item.route !== "undefined" ? item.route : "page"
          item.navitems = typeof item.navitems !== "undefined" 
            ? _.map(item.navitems,function(childItem){
                childItem.type = typeof childItem.type !== "undefined" ? childItem.type : "page"
                childItem.route = typeof childItem.route !== "undefined" ? childItem.route : "page"
                return childItem
              }) 
            : false           
          return item
        },this)
      )
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
