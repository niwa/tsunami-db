define([
  'jquery',  'underscore',  'backbone',
  'text!./page.html',
  'text!./pageContent.html',
  'text!templates/loading.html'
], function (
  $, _, Backbone,
  template,
  templateContent,
  templateLoading
) {

  var PageView = Backbone.View.extend({
    events : {
      "click .close-page" : "closePage",      
      "click a" : "pageLink",      
    },
    initialize : function () {
      this.render()
      this.listenTo(this.model, "change:active", this.handleActive);      
      this.listenTo(this.model, "change:pageId", this.handlePageChange);      
      this.listenTo(this.model, "change:anchor", this.handlePageAnchorChange);      
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
        this.$('.page-outer').html(_.template(templateLoading)({
          t:this.model.getLabels()
        }))        
        if (this.model.hasActivePage()) {
          var that = this          
          page.getContent(function(content){                  
            that.$('.page-outer').html(_.template(templateContent)({
              t:that.model.getLabels(),
            }))
            that.$('.page-outer').removeClass('loading')
            that.$('.placeholder-content').html(content)
            if (that.model.getPageAnchor() === "") {
              that.$el.scrollTop(0)
            }
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
    pageLink: function(e) {
      if(typeof $(e.target).attr('href') !== "undefined" && $(e.target).attr('href').startsWith('#')) {
        e.preventDefault()
        this.$el.trigger('navLink', {
          route:'page',
          id: this.model.get('pageId'),
          anchor: $(e.target).attr('href').substring(1)
        })    
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
          var $anchor = that.$('#'+anchor)            
          if ($anchor.length > 0) {
            that.$el.scrollTop( 
              that.$el.scrollTop() 
              + $anchor.parent().offset().top 
              - that.$el.offset().top
              - 20
            )          
          }
        })
      }
    }    
        
  });

  return PageView;
});
