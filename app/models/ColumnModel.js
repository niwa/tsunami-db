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
        placeholders :    this.attributes.placeholders || null,
        addons :          this.attributes.addons || null,
        description :     this.attributes.description || this.attributes.title || this.attributes.hint ,
        descriptionMore:  this.attributes.descriptionMore || "",        
        hint :            this.attributes.hint || "",
        type :            this.attributes.type || "text",
        group :           this.attributes.group || "meta",
        filterable :      typeof this.attributes.filterable !== "undefined" ? this.attributes.filterable : 1,
        colorable :       typeof this.attributes.colorable !== "undefined" ? this.attributes.colorable : 0,
        table :           typeof this.attributes.table !== "undefined" ? this.attributes.table : 1,
        single :          typeof this.attributes.single !== "undefined" ? this.attributes.single : 1,
        isDefault:        typeof this.attributes['default'] !== "undefined" ? this.attributes['default'] : 0,        
        searchable :      typeof this.attributes.searchable !== "undefined" ? this.attributes.searchable : 0,
        sortable :        typeof this.attributes.sortable !== "undefined" ? this.attributes.sortable : 1,
        blanks :          typeof this.attributes.blanks !== "undefined" ? this.attributes.blanks : 0,
        multiples :       typeof this.attributes.multiples !== "undefined" ? this.attributes.multiples : 0,
        plot :            typeof this.attributes.plot !== "undefined" ? this.attributes.plot : 0,
        values :          this.attributes.values || "auto",        
        combo:            typeof this.attributes.combo !== "undefined" ? this.attributes.combo : 0,
        comboColumnId:    this.attributes.comboColumnId || null,
        comboType:        this.attributes.comboType || null,
        comboTitle:       this.attributes.comboTitle || this.attributes.title || this.attributes.id,
        comboDescription: this.attributes.comboDescription || this.attributes.description || "",
        plotMax:          this.attributes.plotMax || null,
        plotColor:        this.attributes.plotColor || "#fff",
        showOnPage:       {          
          values: false,
          valueDescription: false
        }
      })
      // set 
      this.set({
        queryColumn :          this.attributes.queryColumn || this.attributes.column
      })
      this.set({
        queryColumnByType: typeof this.attributes.query !== "undefined"
          ? typeof this.attributes.query === "object" 
            ? {
                value: this.attributes.queryColumn,
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
      
      
      if (this.attributes.type === "spatial" || this.attributes.type === "quantitative") {
        if (this.attributes.placeholders === null){
          this.set("placeholders", {min:"Min",max:"Max"})                      
        }
      }
      if (this.attributes.type === "spatial") {
        if (this.attributes.addons === null){
          this.set("addons", {min:"Min",max:"Max"})                      
        }
      }
      if (this.attributes.type === "date") {
        if (this.attributes.placeholders === null){
          this.set("placeholders", {min:"After",max:"Before"})                      
        }
      }
      
      
      if (this.attributes.values === "auto") { 
        this.attributes.showOnPage.values = false
      } else {        
        if(typeof this.attributes.values.values !== "undefined") {
          this.attributes.showOnPage.values = true
          if(typeof this.attributes.values.labels === "undefined") {
            this.attributes.showOnPage.values = false
            this.attributes.values.labels = _.clone(this.attributes.values.values)
          }
          if(typeof this.attributes.values.hints === "undefined") {
            this.attributes.values.hints = []        
          }
          if(typeof this.attributes.values.descriptions === "undefined") {            
            this.attributes.values.descriptions = this.attributes.values.hints
          }
          if (this.attributes.values.descriptions.length > 0){
            this.attributes.showOnPage.values = true
            this.attributes.showOnPage.valueDescription = true
          }
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
    hasMoreDescription: function(){
      return this.attributes.descriptionMore !== "" 
      || (typeof this.attributes.values.descriptions !== "undefined" && this.attributes.values.descriptions.length > 0)
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



