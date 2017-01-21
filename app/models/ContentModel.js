define([
  'jquery', 'underscore', 'backbone',
  'jquery.xml2json',
  'showdown'
], function($,_, Backbone,xml2json,showdown
){
  
  var ContentModel = Backbone.Model.extend({
    initialize : function(options){ 
      this.options = options || {};         
      this.isContentLoading = false
      this.isContentLoaded = false
      
    },    
    loadContent : function (callback, selector){
      if (!!this.getUrl()) {
        // default: could be overridden in specific model to apply specific content transformation
        var that = this
        $.ajax({
          dataType:this.getFormat(),
          url:this.getUrl(),
          success:function(content) {


            switch (that.getFormat()) {                    
              case "xml":
                var content = $.xml2json(content)
                // according to NIWA's content XML structure
                if (typeof content["#document"] !== "undefined") {
                  if (content["#document"]["result"]["nodes"] !== "") {
                    content = content["#document"]["result"]["nodes"]["item"]["body"]["und"]["item"]["safe_value"]
                  } else {
                    content = "<p>ERROR LOADING RESOURCE: requested resource does not exist</p>"
                  }
                }
                callback(content)
                break
              default:
                callback(content)
                break                
            }
          },
          error: function(){
            callback("error loading content from " + that.getUrl())
            console.log("error loading terms config")
          }

        })
      } else {
        if (typeof this.attributes.content !== "undefined") {
          switch (this.getFormat()) {                    
            case "markdown": 
              var converter = new showdown.Converter({ghCodeBlocks: false});              
              callback(converter.makeHtml(this.attributes.content))
              break           
            default:
              callback(this.attributes.content)
              break
          }
        } else {
          callback ("<p>ERROR LOADING CONTENT: requested content not specified</p>")
        }
      }
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
          
          this.loadContent(function(content){
            // todo add error handling 
            that.set('content', content)
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



