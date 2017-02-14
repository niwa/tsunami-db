define([
  'jquery', 'underscore', 'backbone',
  './ContentCollection',  
], function(
  $, _, Backbone, ContentCollection
){
  var PageCollection = ContentCollection.extend({
    initialize: function(models,options) {      
      
      this.options = options || {};     
      
      this.on("add", function(model){
        model.set('columnCollection',this.options.columnCollection)
        model.set('columnGroupCollection',this.options.columnGroupCollection)      
      });
      
    },    
  });

  return PageCollection;
});
