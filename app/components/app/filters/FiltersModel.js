define([
  'jquery', 'underscore', 'backbone',
  'models/ViewModel'
], function($,_, Backbone,ViewModel) {

  return ViewModel.extend({
    initialize : function(options){
      this.options = options || {};
      // expanded column group
      this.set('expanded',[])
    },
    getExpanded : function(){
      return this.attributes.expanded
    },
    allExpanded : function(){
      return this.attributes.expanded.length === this.attributes.columnGroupCollection.length
    },
    isExpanded : function(groupId){
      return this.attributes.expanded.indexOf(groupId) > -1
    },
    setExpanded : function(groups){
      return this.set("expanded",groups)
    },
    addExpanded : function(groups){
      if (typeof groups === "object") {
        this.set("expanded",_.uniq(this.attributes.expanded.concat(groups)))
      } else {
        this.set("expanded",_.uniq(this.attributes.expanded.concat([groups])))
      }      
    },
    removeExpanded : function(groups){
      if (typeof groups === "object") {
        this.set("expanded",_.difference(this.attributes.expanded,groups))
      } else {
        this.set("expanded",_.without(this.attributes.expanded, groups))
      }      
    },
   
  });
  

});
