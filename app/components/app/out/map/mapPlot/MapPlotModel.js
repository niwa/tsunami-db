define([
  'jquery', 'underscore', 'backbone',
  'models/ViewModel'
], function($,_, Backbone,ViewModel) {

  return ViewModel.extend({
    initialize : function(options){
      this.options = options || {};
      this.setExpanded(false)
    },  
    setCurrentRecords : function(currentRecords){      
      this.set('currentRecordCollection', currentRecords) // new active layers          
    },          
    getCurrentRecords : function(){      
      return this.attributes.currentRecordCollection
    },
    getExpanded : function(){
      return this.attributes.expanded
    },
    setExpanded : function(bool){
      bool = typeof bool !== 'undefined' ? bool : false
      this.set("expanded", bool)
    },
  });
  

});