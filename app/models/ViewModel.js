define([
  'jquery', 'underscore', 'backbone'
], function($,_, Backbone) {
  
  var ViewModel = Backbone.Model.extend({
    initialize : function(options){
      this.options = options || {};        
    },
    setActive : function(active){
      active = typeof active !=='undefined' ? active : true
      this.set('active', active)
    },    
    isActive : function(){      
      return this.get('active')
    },        
  });

  return ViewModel;

});



