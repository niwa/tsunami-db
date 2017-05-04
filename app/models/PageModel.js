define([
  'jquery', 'underscore', 'backbone','leaflet',
  './ContentModel',
  'text!templates/pageAttributes.html'  
], function($,_, Backbone,leaflet,
  ContentModel,
  templatePageAttributes
){

  var PageModel = ContentModel.extend({
    initialize : function(options) {
      this.options = options || {};    
      this.isContentLoading = false
      this.isContentLoaded = false  
      
      if (typeof this.attributes.content !== "undefined") {
        this.set('url',false)
      } else {
        this.set('url',this.attributes.path)
      }
      this.set('class','page-' + this.id)
      this.set('source',this.attributes.source || "ajax")
    
    },
    getFormat:function(){
      return this.attributes.format
    },
    getTitle:function(){
      return this.attributes.title
    },
    getClass:function(){
      return this.attributes['class']
    },
    //overrides ContentModel.getContent
    getContent : function(callback){
            
      // temporary workaround #225
      if (this.isContentLoaded && typeof this.attributes.content !== 'undefined' && this.attributes.content[0].innerHTML !== ''){        
        callback(this.attributes.content)
      } else {
        var that = this
        // already loading
        if (this.isContentLoading) {
          waitFor(
            function(){ 
              return that.isContentLoaded 
            },
            function(){ 
              callback(that.attributes.content, that )
            }
          )
        } else {	
          this.isContentLoading = true
          this.loadContent(function(content){
                        
            if (that.id === "attributes") {
              var columnCollection = that.get("columnCollection")            
              that.set('content', _.template(templatePageAttributes)({
                t:that.collection.options.labels,
                content: content,
                proxies: that.get("proxyCollection").models,
                columnGroups:_.map(that.get("columnGroupCollection").models,function(group){
                  // group classes
                  var classes = "group-" + group.id 

                  var columnsByGroup = columnCollection.byGroup(group.id).models 

                  return {
                    title:group.get("title"),
                    hint:group.get("hint"),
                    id:group.id,
                    classes: classes,
                    groupColumns: columnsByGroup     
                  }          
                })              
              }))
            } else {
              that.set('content', that.setupContent($(content)))
            }
            that.isContentLoading = false
            that.isContentLoaded = true            
            callback(that.attributes.content)
          })            
                  
        }
      }
    },
    setupContent:function($content){
      $content.find('img').each(function(i, img){
        var $img = $(img)
        if (L.Browser.retina) {
          $img.attr('src', $img.attr('src').replace('.png','@2x.png'))
          $img.attr('src', $img.attr('src').replace('.jpg','@2x.jpg'))                  
          $img.attr('src', $img.attr('src').replace('.gif','@2x.gif'))             
        }
        $img.addClass("img-responsive")
      })
          
      return $content
    }
    
  });

  return PageModel;

});



