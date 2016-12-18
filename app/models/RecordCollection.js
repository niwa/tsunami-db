define([
  'jquery', 'underscore', 'backbone',
  './RecordModel'  
], function(
  $, _, Backbone, model
){
  var RecordCollection = Backbone.Collection.extend({
    model:model,
    initialize: function(models,options) {            
      this.options = options || {};       
      this.selectedId = ""
    },    
    byActive: function(active){
      active = typeof active !== 'undefined' ? active : true         
      var filtered = this.filter(function(model){
        return model.isActive() === active
      })
      return new RecordCollection(filtered);         
    },
    updateActive:function(query){
      console.log("recordCollection.updateActive")      
      _.each(_.clone(this.models).reverse(),function(model){
        model.setActive(model.pass(query))        
      })
    },
    updateRecords:function(args){
      console.log("recordCollection.updateRecords")
      _.each(_.clone(this.models).reverse(),function(model){
        // set active
        model.setActive(model.pass(args.query)) 
        
        // set selected
        if(args.selectedId !== this.selectedId) {
          if (args.selectedId === "") {
            model.setSelected(false)
          } else {
            model.setSelected(model.id === args.selectedId,true)
          }
        }
        // set color
        if (model.isActive()){
          model.setColor(
            args.colorColumn.getColor(
              model.getColumnValue(args.colorColumn.get("column"))
            )
          )                  
        }
      })
      this.selectedId = args.selectedId     
      
      
    },
    byXY:function(x,y){
      var filtered = this.filter(function(model){
        return model.passXY(x,y)
      })
      return new RecordCollection(filtered);
    },
    byQuery: function(query){
      var filtered = this.filter(function(model){
        return model.pass(query)
      })      
      return new RecordCollection(filtered);         
    },
    getValuesForColumn:function(column){
      var values = []
      _.each(this.models,function(model){
        if(model.get(column) !== null) {
          values = _.union(values,_.map(model.get(column).split(','),function(val){return val.trim()}))
        }
      })           
      return values.sort(function(a,b){
        //sort alphabetically but move unknown to the end
        return a === "Unknown" ? 1 : b === "Unknown" ? -1
            : a < b ? -1 : a > b ? 1 : 0 
      })      
    },
    setColumns:function(columns){
      this.options.columns = columns      
    },
    getColumns : function(){
      return this.options.columns
    },      
    // Proxies ========================================================================
    setProxies: function(collection){
      this.options.proxies = collection
    },
    // returns collection
    getProxies : function(){
      return this.options.proxies
    },  
    // References ========================================================================
    setReferences: function(collection){
      this.options.references = collection
    },
    // returns collection
    getReferences: function(){
      return this.options.references
    },      
        
    
  });

  return RecordCollection;
});
