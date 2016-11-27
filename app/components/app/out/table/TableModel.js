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
    allExpanded : function(){
      return this.attributes.expanded
    },    
    setExpanded : function(bool){
      return this.set("expanded",bool)
    },    
  });
  

});
