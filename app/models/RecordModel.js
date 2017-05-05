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
      this.set('selected',false)
      this.set('highlight',false)

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
    isSelected:function(){
      return this.attributes.selected
    },    
    setSelected : function(selected,anySelected){
      selected = typeof selected !== 'undefined' ? selected : true   
      anySelected = typeof anySelected !== 'undefined' ? anySelected : selected         
      this.set('selected',selected)      
      this.set('anySelected',anySelected)           
      // only when not active already
      if (this.getLayer()){
        this.getLayer().setSelected(selected,anySelected) 
        if (selected) {
          this.bringToFront()
          this.panToViewIfNeeded()
        }        
      }
    },
    isHighlight:function(){
      return this.attributes.highlight
    },    
    setHighlight : function(bool){
      bool = typeof bool !== 'undefined' ? bool : true   
      this.set('highlight',bool)      
      // only when not active already
      if (this.getLayer()){
        this.getLayer().setMouseOver(bool) 
        if (bool) {
          this.getLayer().bringToFront()
        }
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
    
    isActive:function(){
      return this.attributes.active
    },
    
    panToViewIfNeeded:function(){
//      console.log("recordModel.brintofront " + this.id)
      if (this.getLayer()){
        this.getLayer().panToViewIfNeeded()
      }               
    },    
    bringToFront:function(){
//      console.log("recordModel.brintofront " + this.id)
      if (this.getLayer()){
        this.getLayer().bringToFront()
      }               
    },    
    centerMap:function(){
//      console.log("recordModel.brintofront " + this.id)
      if (this.getLayer()){
        this.getLayer().centerMap()
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
              return _.map(this.attributes[col].split(","),function(val){return val.trim()}).join(", ")
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
      var columnCollection = this.collection.options.columns
      var pass = true
      var keys = _.keys(query)
      var i = 0
      while(i < keys.length && pass) {
        var key = keys[i]
        // keyword search
        if (key === "s") {
          // pass when match with any searchable columns
          pass = false
          var columns  = columnCollection.byAttribute("searchable").models
          var queryStr = query["s"].toString()
          
          // match multiple words
          // see http://stackoverflow.com/questions/5421952/how-to-match-multiple-words-in-regex
          var regex = ''    
          _.each(queryStr.split(' '), function(str){
            regex += '(?=.*\\b'+str+')'
          })            
          var pattern = new RegExp(regex, "i")
          
          var j = 0
          while (j < columns.length && !pass){
            var column = columns[j].get("queryColumn")
            var value = this.get(column)
            if (value !== null && value !== ""){              
              // exact match for id
              if (column === "id") {
                pass = value.toString() === queryStr
              } else {
                if (queryStr.length > 3) {
                  value = value.toString()
                    .replace(/[āĀ]/, "a")
                    .replace(/[ēĒ]/, "e")
                    .replace(/[īĪ]/, "i")
                    .replace(/[ōŌ]/, "o")
                    .replace(/[ūŪ]/, "u")       

                  pass = pattern.test(value)                                
                }
              }
            }
            j++
          }
        } else {
        
          var columnModel = columnCollection.byQueryColumn(key)
          if (typeof columnModel !== "undefined") {
            var column = columnModel.get("queryColumn")
            var condition = query[key]

            // check min
            if (key === columnModel.getQueryColumnByType("min")) {
              if (column === "longitude") {
                if(this.get(column) === null) {
                  pass = false
                } else {
                  var value = this.get(column) < 0 ? this.get(column) + 360 : this.get(column)
                  var condition = parseFloat(condition) < 0 ? parseFloat(condition) + 360 : parseFloat(condition)
                  if (value < condition) {
                    pass = false
                  }
                }
              } else {
                if(this.get(column) === null || this.get(column) < parseFloat(condition)) {
                  pass = false
                }
              }     
            // check max
            } else if (key === columnModel.getQueryColumnByType("max")) {
              if (column === "longitude") {
                if(this.get(column) === null) {
                  pass = false
                } else {
                  var value = this.get(column) < 0 ? this.get(column) + 360 : this.get(column)
                  var condition = parseFloat(condition) < 0 ? parseFloat(condition) + 360 : parseFloat(condition)

                  if (value > condition) {
                    pass = false
                  }
                }
              } else {
                if(this.get(column) === null || this.get(column) > parseFloat(condition)) {
                  pass = false
                }               
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
                  if(isNumber(this.get(column))){
                    values = [this.get(column)]
                  } else {
                    values = _.map(this.get(column).split(','),function(val){return val.trim()})
                  }                
                }        
                var conditions = typeof condition === 'string' ? [condition] : condition                
                if(_.intersection(conditions,values).length === 0) {
                  pass = false
                }
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



