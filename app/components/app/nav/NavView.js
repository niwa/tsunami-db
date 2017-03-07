define([
  'jquery',  'underscore',  'backbone',
  'bootstrap',
  'text!./nav.html'
], function (
  $, _, Backbone,
  bootstrap,
  template
) {

  var NavView = Backbone.View.extend({
    events : {
      "click .home-link" : "handleHomeLink",
      "click .nav-link" : "handleNavLink"
    },
    initialize : function () {
      this.render()
      
      this.listenTo(this.model, 'change:path', this.handleRouteChange); 
      this.listenTo(this.model, 'change:route', this.handleRouteChange); 
    },
    render: function () {
      this.$el.html(_.template(template)({
        t:this.model.getLabels(),
        navitems:_.map(this.model.getNavItems(),function(item){
          item.active = this.isItemActive(item)
          item.class = item.active ? " active" : ""            
          item.class += !!item.navitems  ? " nav-group" : ""            
          item.navitems = !!item.navitems 
          ? _.map(item.navitems,function(childItem){
              childItem.active = this.isItemActive(childItem)
              childItem.class = childItem.active ? " active" : ""
              return childItem
            },this)
          : false
          return item
        },this)
      }))      
      return this
    },
    isItemActive:function(item){
      var route = this.model.getActiveRoute()
      var path = this.model.getActivePath()
      
      switch (item.type) {
        case "component" : 
          return item.route === route && path !== "share"
          break
        case "group" :
          return _.reduce(item.navitems,function(active,childItem){
            return active || this.isItemActive(childItem)
          },false, this)
          break
        case "list":
        case "page":
          return item.route === route && item.id === path
          break
        case "modal":
          return item.id === path
          break
      }
            
    },
    //upstream
    handleHomeLink : function (e) {
      e.preventDefault()      
      this.$el.trigger('homeLink')
      $('#navbar-collapse').collapse('hide')
    },
    handleNavLink : function(e){
      e.preventDefault()
      e.stopPropagation()
      
      var id = $(e.target).data('id')
      var route = $(e.target).data('route')
      var type = $(e.target).data('type')
            
      if (type === "group") {        
        var item = _.findWhere(this.model.getNavItems(),{id:id})        
          // get first child item
        var childItem = item.navitems[0]        
        id = childItem.id
        route = childItem.route
        type = childItem.type
      } 
      
      
      this.$el.trigger('navLink',{
        target:e.target,
        id:id,
        route:route,
        type:type
      })      
      
      $('#navbar-collapse').collapse('hide')
    },

    // downstream

    handleRouteChange: function () {
      this.render()
    }
  });

  return NavView;
});
