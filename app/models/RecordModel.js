define([
  'jquery', 'underscore', 'backbone'
], function($,_, Backbone){
  
  var RecordModel = Backbone.Model.extend({
    initialize : function(options) {
      this.options = options || {};    
      // map data attributes
      if (typeof this.attributes.featureAttributeMap !== 'undefined'){
        this.mapAttributes(this.attributes.featureAttributeMap)
      }      
    },
    mapAttributes:function(featureAttributeMap){
      _.each(
        featureAttributeMap,
        function(attr,key){                     
          this.set(key, this.attributes[attr] !== null 
            ? this.attributes[attr]
            : ''
          )

        },
        this
      )      
    },
    setLayer:function(layer){
      this.set("layer",layer)
    },
    getLayer:function(){
      return this.attributes.layer
    },
    setActive:function(active){
      active = typeof active !== 'undefined' ? active : true   
      this.set('active',active)
    },
    isActive:function(){
      return this.attributes.active
    },
    pass:function(query) {
      var attributes = this.collection.options.attributes
      var pass = true
      var keys = _.keys(query)
      var len = keys.length
      var i = 0
      while(i < len && pass) {
        var key = keys[i]
        var attribute = attributes.byQueryAttribute(key)
        if (typeof attribute !== "undefined") {
          var column = attribute.get("queryColumn")
          var condition = query[key]
          
          // check min
          if (key === attribute.getQueryAttribute("min")) {
            if(this.get(column) === null || this.get(column) < parseFloat(condition)) {
              pass = false
            }     
          // check max
          } else if (key === attribute.getQueryAttribute("max")) {
            if(this.get(column) === null || this.get(column) > parseFloat(condition)) {
              pass = false
            }               
          // check equality
          } else {            
            // try number
            if(isNumber(condition)) {            
              if(this.get(column) === null || this.get(column) !== parseFloat(condition)) {
                pass = false
              } 
            } else {
              // test null
              var values
              if( this.get(column) === null || this.get(column) === "") {
                values = ["null"]
              } else {
                values = this.get(column).split(',')
              }        
              var conditions = typeof condition === 'string' ? [condition] : condition                
              if(_.intersection(conditions,values).length === 0) {
                pass = false
              }
            }
          }
        }          
        i++
      }          
      return pass 
    }
  });

  return RecordModel;

});



