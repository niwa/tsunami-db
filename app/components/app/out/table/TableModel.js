define([
  'jquery', 'underscore', 'backbone',
  'models/ViewModel'
], function($,_, Backbone,ViewModel) {

  return ViewModel.extend({
    initialize : function(options){
      this.options = options || {};
      this.set('expanded',false)
      
    },
    setCurrentRecords : function(currentRecords){      
      this.set('currentRecordCollection', currentRecords) // new active layers          
    },          
    getCurrentRecords : function(){      
      return this.attributes.currentRecordCollection
    },
    getSortedRecords : function(){
      var records = this.attributes.currentRecordCollection.clone()
      var order = parseInt(this.attributes.tableSortOrder)
      var that = this
      records.comparator = function(a,b){
        var aval = a.get(that.attributes.tableSortColumn)
        var bval = b.get(that.attributes.tableSortColumn)
        if (aval === null || aval === "" || bval === null || bval === "" ) {
          if ((aval === null || aval === "") && (bval !== null && bval !== "" )) {
            return 1
          }
          if ((aval !== null && aval !== "") && (bval === null || bval === "" )) {
            return -1
          }
          return (aval > bval ? 1 : (bval > aval) ? -1 : 0) * order;                               
        }
        
        return (aval > bval ? 1 : -1) * order        
        
      }
      records.sort()
      return records.models
    },
    allExpanded : function(){
      return this.attributes.expanded
    },    
    setExpanded : function(bool){
      return this.set("expanded",bool)
    },    
  });
  

});
