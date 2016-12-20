define([
  'jquery', 'underscore', 'backbone',
  'models/ViewModel'
], function($,_, Backbone,ViewModel) {

  return ViewModel.extend({
    initialize : function(options){
      this.options = options || {};
      
    },  
    setCurrentRecords : function(currentRecords){      
      this.set('currentRecordCollection', currentRecords) // new active layers          
    },          
    getCurrentRecords : function(){      
      return this.attributes.currentRecordCollection
    },     
  });
  

});
