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
      this.set('formatted',{})

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
      if (this.getLayer()){
      // also set layer
        this.getLayer().setActive(active) 
      }
    },
    
    setSelected : function(selected,anySelected){
      selected = typeof selected !== 'undefined' ? selected : true   
      anySelected = typeof anySelected !== 'undefined' ? anySelected : selected         
      this.set('selected',selected)      
      this.set('anySelected',anySelected)           
      // only when not active already
      if (this.getLayer()){
        this.getLayer().setSelected(selected,anySelected) 
      }

    },
    setColor : function(color){
      // only when not active already
      this.set('columnColor',color)      
      
      if (this.getLayer()){
        this.getLayer().setColor(color)      
      }
    },  
    getColor : function(){      
      return this.attributes.columnColor      
    },   
    
    getTitle:function(){
      return "Record " + this.id
    },
    
    isActive:function(){
      return this.attributes.active
    },
    
    bringToFront:function(){
      if (this.getLayer()){
        this.getLayer().bringToFront()
      }               
    },    
    getColumnValue:function(column, formatted){
      formatted = typeof formatted !== "undefined" ? formatted : false
      if (formatted) {
        if(typeof this.attributes.formatted[column] === "undefined"){
          this.attributes.formatted[column] = this.formatColumn(column)
        } 
        return this.attributes.formatted[column]          
      } else {
        return this.attributes[column]
      }        
    },
    getReferences:function(){
      if (this.attributes["references"] === null) {
        return []
      } else {
        return _.map(this.attributes["references"].split(","),function(refid){
          return this.collection.options.references.get(refid)        
        },this)           
      }
    },
    getProxies:function(){
      if (this.attributes["proxies"] === null) {
        return []
      } else {        
        return _.map(this.attributes["proxies"].split(","),function(pid){
          return this.collection.options.proxies.get(pid)        
        },this) 
      }          
    },
    
    formatColumn:function(col){     
      
      if (this.attributes[col] === null || this.attributes[col] === "") {
        return '&mdash;'
      } else {
        var column = this.collection.options.columns.findWhere({column:col})        
        
        switch (column.get("type")){
          case "index":
            if (column.id === 'references') {       
              if (this.attributes[col] === null) {
                return ""
              } else {                  
                return _.map(this.attributes[col].split(","),function(refid){
                  var ref = this.collection.options.references.get(refid)
                  return typeof ref !== "undefined" ? ref.getTitle() : ""
                },this).join(", ")
              }
            } else if (column.id === 'proxies') {     
              if (this.attributes[col] === null) {
                return ""
              } else {                 
                return this.attributes[col].split(",").join(", ")
              }
            }            
            break
          case "categorical":
            if (this.attributes[col] === null) {
              return ""
            } else {               
              return this.attributes[col].split(",").join(", ")
            }
            break        
          case "quantitative":
            //round to 2 decimals
            return Math.round(this.attributes[col] * 100) / 100
            break        
          case "spatial":        
            //round to 3 decimals
            return Math.round(this.attributes[col] * 1000) / 1000          
            break        
          case "date" :
            return this.attributes[col] > 0 
              ? this.attributes[col] + ' AD'     
              : this.attributes[col] < 0
                ? (-1*parseInt(this.attributes[col])) + ' BC'               
                : this.attributes[col]
            break
          default:
            return this.attributes[col]
            break
        }        
      }        
    },    
    
    pass:function(query) {
      var columns = this.collection.options.columns
      var pass = true
      var keys = _.keys(query)
      var len = keys.length
      var i = 0
      while(i < len && pass) {
        var key = keys[i]
        var columnModel = columns.byQueryColumn(key)
        if (typeof columnModel !== "undefined") {
          var column = columnModel.get("queryColumn")
          var condition = query[key]
          
          // check min
          if (key === columnModel.getQueryColumn("min")) {
            if(this.get(column) === null || this.get(column) < parseFloat(condition)) {
              pass = false
            }     
          // check max
          } else if (key === columnModel.getQueryColumn("max")) {
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
    },    
    passXY:function(x,y){
      if(this.attributes.active && this.getLayer()){
        return this.getLayer().includesXY(x,y)
      } else {
        return false
      }
    }
  });

  return RecordModel;

});



