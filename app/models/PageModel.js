define([
  'jquery', 'underscore', 'backbone',
  './ContentModel'
], function($,_, Backbone, 
  ContentModel
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
    
    },
    getFormat:function(){
      return this.attributes.format
    },
    getTitle:function(){
      return this.attributes.title
    },
    getClass:function(){
      return this.attributes.class
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
            that.set('content', that.setupContent($(content)))
            that.isContentLoading = false
            that.isContentLoaded = true
            callback(that.attributes.content)
          })        
        }
      }
    },
    setupContent:function($content){
      $content.find('img').each(function(i, img){
        $(img).addClass("img-responsive")
      })
      
      return $content
    }
    
  });

  return PageModel;

});



