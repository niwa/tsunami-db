define([
  'jquery',  'underscore',  'backbone',
  'text!./page.html'
], function (
  $, _, Backbone,
  template
) {

  var PageView = Backbone.View.extend({
    events : {
    },
    initialize : function () {
      this.render()
      this.listenTo(this.model, "change:active", this.handleActive);      
      this.listenTo(this.model, "change:pageId", this.handlePageChange);      
    },
    render: function () {
      if (this.model.hasActivePage()) {
        this.loadPage()
      }      
    
      
      return this
    },    
    loadPage: function(){
      var page = this.model.getActivePage()
      this.$el.html(_.template(template)({
        t:this.model.getLabels()
      }))        
      if (this.model.hasActivePage()) {
        var that = this
        page.getContent(function(content){      
          that.$('.placeholder-content').html(content)
        })
      }
    },
    handlePageChange : function(){
      this.render()
    },    
    handleActive : function(){
      if (this.model.isActive()) {
        this.$el.show()        
      } else {
        this.$el.hide()
      }
    }
        
  });

  return PageView;
});