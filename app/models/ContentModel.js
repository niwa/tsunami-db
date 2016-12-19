define([
  'jquery', 'underscore', 'backbone'
], function($,_, Backbone
){
  
  var ContentModel = Backbone.Model.extend({
    initialize : function(options){ 
      this.options = options || {};         
      this.isContentLoading = false
      this.isContentLoaded = false
      
    },    
    loadContent : function (callback, selector){
      // default: could be overridden in specific model to apply specific content transformation
      var that = this
      $.ajax({
        dataType:this.getFormat(),
        url:this.getUrl(),
        success:function(content) {
      
        
          if (that.getFormat() === "xml") {
            callback(content)
          }
        },
        error: function(){
          callback("error loading content from " + that.getUrl())
          console.log("error loading terms config")
        }
        
      })
    },
    getFormat:function(){
      return "html"
    },    
    isContentReady : function(){
      return !this.isContentLoading && this.isContentLoaded
      
      
    },
    getUrl : function(){
      if (typeof this.attributes.url !== 'undefined' ) {        
        return this.attributes.url
      }
    },
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
          
          this.loadContent(function(result){
            // todo add error handling 
            that.set('content', result)
            that.isContentLoading = false
            that.isContentLoaded = true
            callback(that.attributes.content)
          })        
        }
      }
    }
  });

  return ContentModel;

});



