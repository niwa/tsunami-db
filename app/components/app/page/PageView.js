define([
  'jquery',  'underscore',  'backbone',
  'text!./page.html'
], function (
  $, _, Backbone,
  template
) {

  var PageView = Backbone.View.extend({
    events : {
      "click .close-page" : "closePage"      
    },
    initialize : function () {
      this.render()
      this.listenTo(this.model, "change:active", this.handleActive);      
      this.listenTo(this.model, "change:pageId", this.handlePageChange);      
      this.listenTo(this.model, "change:pageAnchor", this.handlePageAnchorChange);      
    },
    render: function () {
      if (this.model.hasActivePage()) {
        this.loadPage()
      }      
    
      
      return this
    },    
    loadPage: function(){
      var page = this.model.getActivePage()      
      if (typeof page !== "undefined") {      
        this.$el.html(_.template(template)({
          t:this.model.getLabels(),
          classes:page.getClass()
        }))        
        if (this.model.hasActivePage()) {
          var that = this
          page.getContent(function(content){      
            that.$('.placeholder-content').html(content)
          })
        }
      } else {
        this.$el.html("")
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
    },
    
    closePage : function(e){
      e.preventDefault()
      
      this.$el.trigger('pageClose')      
    },
    handlePageAnchorChange : function(){
      var anchor = this.model.getPageAnchor()
      if (this.model.hasActivePage() && anchor !== "") {
        var that = this
        var page = this.model.getActivePage()     
        waitFor(function(){
          return page.isContentReady()
        },function(){
          page.imagesLoaded(function(){
            var $anchor = that.$('#'+anchor)            
            that.$('.content-scroll').scrollTop($anchor.offset().top-30)
          })
          
        })
      }
    }    
        
  });

  return PageView;
});
