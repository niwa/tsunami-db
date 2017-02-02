define([
  'jquery', 'underscore', 'backbone',
  './ColumnModel'    
], function(
  $, _, Backbone,model
){
  var ColumnCollection = Backbone.Collection.extend({
    model:model,    
    initialize: function(models,options) {            
      this.options = options || {};       
    },
    initializeModels:function(){      
      _.each(this.models,function(column){    
        if (column.get("type") === "quantitative" || column.get("type") === "date" ) {
          if(column.getValues() === 'auto'){
            var values = this.options.records.getValuesForColumn(column.get('queryColumn'))
            column.set("values",{
              "range": {
                "min":values[0],
                "max":values[values.length-1]
              }
            })
          } else {
            if (typeof column.getValues().range !== "undefined" 
            && (column.getValues().range.min[0] === "auto"
                || column.getValues().range.max[0] === "auto")){
              var values = this.options.records.getValuesForColumn(column.get('queryColumn'))
              if (column.getValues().range.min[0] === "auto") {
                column.getValues().range.min[0] = values[0]
              }
              if (column.getValues().range.max[0] === "auto") {
                column.getValues().range.max[0] = values[values.length-1]
              }                
            }
          }
                   
        } else if (column.get("type") === "categorical" || column.get("type") === "ordinal") {
        // replace auto values (generate from actual record values where not explicitly set)
          if(column.getValues() === 'auto'){
            var values = this.options.records.getValuesForColumn(column.get('queryColumn'))
            column.set("values",{
              "values":values,
              "labels": _.clone(values),
              "hints":[],
              "colors":column.get("colorable") === 1 
                ? _.map(values,function(){
                    return '#969696'
                  })
                : []
            })
          }  
          // add null classes where blanks are possible
          if (column.get('blanks') === 1) {            
            var values = column.get("values")
            values.values.push('null')
            values.labels.push('Unspecified')
            if (typeof values.colors !== "undefined") {
              values.colors.push('#969696')        
            }
          }
        }
      },this)
    },
    byType:function(type){
      var filtered = this.filter(function(model){
        return model.get("type") === type
      })
      return new ColumnCollection(filtered);  
    },    
    byGroup:function(groupId){
      var filtered = this.filter(function(model){
        return model.get("group") === groupId
      })
      return new ColumnCollection(filtered);  
    },    
    byAttribute:function(att,val){
      val = typeof val !== "undefined" ? val : 1
      var filtered = this.filter(function(model){
        if ($.isArray(val)){          
          return val.indexOf(model.get(att)) > -1
        } else {
          return model.get(att) === val 
        }
      })      
      return new ColumnCollection(filtered);  
    },
    byQueryColumn:function(queryColumn){
      return this.filter(function(model){
        return model.getQueryColumnByType("value") === queryColumn
          || model.getQueryColumnByType("min") === queryColumn
          || model.getQueryColumnByType("max") === queryColumn
      })[0]                        
    }
  });

  return ColumnCollection;
});
