define([
  'jquery',  'underscore',  'backbone',
  'text!./page.html',
  'text!./pageContent.html',
  'text!templates/loading.html',
  'text!templates/content_about.html',
  'text!templates/content_usage.html',
  'text!templates/content_contact.html',
  'text!templates/content_attributes.html',
  'text!templates/not_found.html',
  'text!templates/content_palaeotsunami.html',
  'text!templates/content_sources.html',
  'text!templates/content_travel.html',
], function (
  $, _, Backbone,
  template,
  templateContent,
  templateLoading,
    templateContentAbout,
    templateContentUsage,
    templateContentContact,
    templateContentAttributes,
    templateNotFound,
    templateContentPalaeotsunami,
    templateContentSources,
    templateContentTravel,
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
            console.log('this should be trying to load a new page, all bow', this.model.attributes.pageId);
          var that = this
            switch (this.model.attributes.pageId) {
                case "about":
                    that.$('.page-outer').html(_.template(templateContentAbout)({ }))
                    that.$('.page-outer').removeClass('loading')
                    if (that.model.getPageAnchor() === "") {
                        that.$el.scrollTop(0)
                    }
                    break;
                case "attributes":
                    that.$('.page-outer').html(_.template(templateContentAttributes)({ }))
                    that.$('.page-outer').removeClass('loading')
                    if (that.model.getPageAnchor() === "") {
                        that.$el.scrollTop(0)
                    }
                    break;
                case "usage":
                    that.$('.page-outer').html(_.template(templateContentUsage)({ }))
                    that.$('.page-outer').removeClass('loading')
                    if (that.model.getPageAnchor() === "") {
                        that.$el.scrollTop(0)
                    }
                    break;
                case "contact":
                    that.$('.page-outer').html(_.template(templateContentContact)({ }))
                    that.$('.page-outer').removeClass('loading')
                    if (that.model.getPageAnchor() === "") {
                        that.$el.scrollTop(0)
                    }
                    break;
                case "palaeotsunami":
                    that.$('.page-outer').html(_.template(templateContentPalaeotsunami)({}))
                    that.$('.page-outer').removeClass('loading')
                    if (that.model.getPageAnchor() === "") {
                        that.$el.scrollTop(0)
                    }
                    break;
                case "sources":
                    that.$('.page-outer').html(_.template(templateContentSources)({}))
                    that.$('.page-outer').removeClass('loading')
                    if (that.model.getPageAnchor() === "") {
                        that.$el.scrollTop(0)
                    }
                    break;
                case "travel":
                    that.$('.page-outer').html(_.template(templateContentTravel)({}))
                    that.$('.page-outer').removeClass('loading')
                    if (that.model.getPageAnchor() === "") {
                        that.$el.scrollTop(0)
                    }
                    break;
                default:
                    that.$('.page-outer').html(_.template(templateNotFound)({ }))
                    that.$('.page-outer').removeClass('loading')
                    if (that.model.getPageAnchor() === "") {
                        that.$el.scrollTop(0)
                    }
                    break;
            }           
          
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
