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
        if (column.get("type") === "categorical" || column.get("type") === "ordinal") {
        // replace auto values (generate from actual record values where not explicitly set)
          if(column.getValues() === 'auto'){
            var values = this.options.records.getValuesForColumn(column.get('queryColumn'))
            column.set("values",{
              "values":values,
              "labels": _.clone(values),
              "hints":[],
              "colors":column.get("colorable") === 1 
                ? _.map(values,function(val){
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
                && model.get("combo") !== 1 //temp
        } else {
          return model.get(att) === val 
                && model.get("combo") !== 1 //temp
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
