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
      
      this.set('url',this.attributes.path)
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
            var html = ""
            // according to NIWA's content XML structure
            if (typeof content["#document"] !== "undefined") {
              if (content["#document"]["result"]["nodes"] !== "") {
                html = content["#document"]["result"]["nodes"]["item"]["body"]["und"]["item"]["safe_value"]
              } else {
                html = "<p>ERROR LOADING RESOURCE: requested resource does not exist</p>"
              }
            }
            
            that.set('content', that.setupContent($(html)))
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



