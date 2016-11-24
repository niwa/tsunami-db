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
      "click .intro-link" : "handleIntroLink",
      "click .home-link" : "handleHomeLink",
      "click .page-link" : "handlePageLink"
    },
    initialize : function () {
      this.render()
      
      this.listenTo(this.model, 'change:activePage', this.handleActivePage);      
    },
    render: function () {
      this.$el.html(_.template(template)({t:this.model.getLabels()}))      
      return this
    },
    //upstream
    handleIntroLink : function (e) {
      e.preventDefault()
      this.$el.trigger('resetApp')
      $('#navbar-collapse').collapse('hide')
    },
    handleHomeLink : function (e) {
      e.preventDefault()      
      this.$el.trigger('homeLink')
      $('#navbar-collapse').collapse('hide')
    },
    handlePageLink : function(e){
      e.preventDefault()
      e.stopPropagation()
      this.$el.trigger('pageLinkClick',{target:e.target,id:$(e.target).data('pageid')})
      $('#navbar-collapse').collapse('hide')
    },

    // downstream

    handleActivePage: function () {
      this.$('.page-link').removeClass('active');
      if (typeof this.model.getActivePage() !== 'undefined') {
        var navpageid = this.model.getActivePage().id
        this.$('[data-pageid="' + navpageid + '"]').addClass('active');
      }
    }
  });

  return NavView;
});
