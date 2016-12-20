define([
  'jquery', 'underscore', 'backbone'
], function($,_, Backbone
){
  
  return Backbone.Model.extend({
    initialize : function(options) {
      this.options = options || {};    
      
      
      //default settings
      this.set({
        column :          this.attributes.column || this.attributes.id,        
        title :           this.attributes.title || this.attributes.id,
        hint :            this.attributes.hint || "",
        type :            this.attributes.type || "text",
        group :           this.attributes.group || "meta",
        filterable :      typeof this.attributes.filterable !== "undefined" ? this.attributes.filterable : 1,
        colorable :       typeof this.attributes.colorable !== "undefined" ? this.attributes.colorable : 0,
        table :           typeof this.attributes.table !== "undefined" ? this.attributes.table : 1,
        default :         typeof this.attributes.default !== "undefined" ? this.attributes.default : 0,        
        searchable :      typeof this.attributes.searchable !== "undefined" ? this.attributes.searchable : 0,
        blanks :          typeof this.attributes.blanks !== "undefined" ? this.attributes.blanks : 0,
        multiples :       typeof this.attributes.multiples !== "undefined" ? this.attributes.multiples : 0,
        plot :            typeof this.attributes.plot !== "undefined" ? this.attributes.plot : 0,
        values :          this.attributes.values || "auto",        
        combo:            typeof this.attributes.combo !== "undefined" ? this.attributes.combo : 0,
        comboColumnId:    this.attributes.comboColumnId || null,
        comboType:        this.attributes.comboType || null,
        comboFilter:      this.attributes.comboFilter || null,
        plotMax:          this.attributes.plotMax || null,
        plotColor:        this.attributes.plotColor || "#fff",
      })
      // set 
      this.set({
        queryColumn :          this.attributes.queryColumn || this.attributes.column
      })
      this.set({
        queryColumnByType: typeof this.attributes.query !== "undefined"
          ? typeof this.attributes.query === "object" 
            ? {
                value: null,
                min: this.attributes.query.min || null,
                max: this.attributes.query.max || null
              }
            : {
                value: this.attributes.query,
                min: null,
                max: null
              }
             
          : {
            value:this.attributes.queryColumn,
            min: null,
            max: null
          }
      })      
      if (this.attributes.values !== "auto" 
        && typeof this.attributes.values.values !== "undefined") {
        if(typeof this.attributes.values.labels === "undefined") {
          this.attributes.values.labels = _.clone(this.attributes.values.values)
        }
        if(typeof this.attributes.values.hints === "undefined") {
          this.attributes.values.hints = []        
        }
      }

    },
    getQueryColumnByType: function(type){
      type = typeof type !== "undefined" ? type : "value"  
      return this.attributes.queryColumnByType[type]
    },
    getQueryColumn: function(){      
      return this.attributes.queryColumn
    },
    getValues : function(){
      return this.attributes.values
    },
    getType : function(){
      return this.attributes.type
    },
    getTitle : function(){
      return this.attributes.title
    },
    getColor:function(value){
      if(this.get("colorable") === 1) {
        value = value === null ? "null" : value
        var index = this.attributes.values.values.indexOf(value)
        return this.attributes.values.colors[index]
      }
    }
  });  

});



