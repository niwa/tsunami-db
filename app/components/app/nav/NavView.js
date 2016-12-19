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
          item.class = "" + 
            item.route === this.model.getActiveRoute()
            ? " active"
            : ""
          return item
        },this)
      }))      
      return this
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
      this.$el.trigger('navLink',{
        target:e.target,
        id:$(e.target).data('id'),
        route:$(e.target).data('route')
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
