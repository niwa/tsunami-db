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
        table :           typeof this.attributes.table !== "undefined" ? this.attributes.table : 1,
        default :         typeof this.attributes.default !== "undefined" ? this.attributes.default : 0,        
        searchable :      typeof this.attributes.searchable !== "undefined" ? this.attributes.searchable : 0,
        blanks :          typeof this.attributes.blanks !== "undefined" ? this.attributes.blanks : 0,
        multiples :       typeof this.attributes.multiples !== "undefined" ? this.attributes.multiples : 0,
        values :          this.attributes.values || "auto",        
        combo:            typeof this.attributes.combo !== "undefined" ? this.attributes.combo : 0,
        comboAttributeId: this.attributes.comboAttributeId || null,
        comboType:        this.attributes.comboType || null,
        comboFilter:      this.attributes.comboFilter || null,
      })
      // set 
      this.set({
        queryColumn :          this.attributes.queryColumn || this.attributes.column
      })
      this.set({
        queryAttribute : typeof this.attributes.query !== "undefined"
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
        && typeof this.attributes.values.values !== "undefined"
        && typeof this.attributes.values.labels === "undefined") {
        this.attributes.values.labels = this.attributes.values.values
      }

    },
    getQueryAttribute : function(type){
      type = typeof type !== "undefined" ? type : "value"  
      return this.attributes.queryAttribute[type]
    },
    getValues : function(){
      return this.attributes.values
    }
  });  

});



