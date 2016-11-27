define([
  'jquery',  'underscore',  'backbone',
  'text!./filters.html',
  
], function (
  $, _, Backbone,
  template
) {

  var FiltersView = Backbone.View.extend({
    events : {
      "click .expand-all": "expandAll",
      "click .expand-group": "expandGroup",
      "click .query-submit": "querySubmit",
      "click .query-reset": "queryReset"
    },
    initialize : function () {
      this.render()
      this.listenTo(this.model, "change:recQuery", this.render);      
      this.listenTo(this.model, "change:expanded", this.render);      
    },
    render: function () {
      
      if (this.model.allExpanded()) {
        this.$el.addClass("expanded") 
      } else {
        this.$el.removeClass("expanded") 
      }
      
      
      var attributeCollection = this.model.get("attributes").byAttribute("filterable")
      
      this.$el.html(_.template(template)({
        t:this.model.getLabels(),
        q:$.param(this.model.get("recQuery")),
        attributeGroups:_.map(this.model.get("attributeGroups").models,function(group){
          var classes = "group-" + group.id 
          if (this.model.isExpanded(group.id)) {
            classes +=  " expanded-group"  
          }
          console.log(classes)
          return {
            title:group.get("title"),
            hint:group.get("hint"),
            id:group.id,
            classes: classes,
            attributes: _.filter(_.map(attributeCollection.byGroup(group.id).models,function(att){
              var value = typeof (this.model.get("recQuery")[att.getQueryAttribute()]) !== "undefined"
                ? this.model.get("recQuery")[att.getQueryAttribute()]
                : ""              
              
              // only show default attributes or those that are set unless group expanded
              if (att.get("default") || value.trim() !== "" || this.model.isExpanded(group.id) ) {
                return {
                  att:att,
                  value:value
                }                
              }              
              
            },this),function(group){
              return typeof group !== "undefined"
            })
          }          
        },this)
      }))      
      return this
    },    
    querySubmit:function(){     
      
      var query = {}
      
      this.$('.att-filter').each(function(index){
        var $filter = $(this)
        if ($filter.val().trim() !== "") {
          query[$filter.attr('id')] = $filter.val().trim()
        }
      })
      
      this.$el.trigger('recordQuerySubmit',{query:query})
    },    
    queryReset:function(){      
      this.$el.trigger('recordQuerySubmit',{query:{}})
    },
    expandAll:function(){
      if (this.model.allExpanded()) {
        this.model.setExpanded([])
      } else {
        this.model.setExpanded(_.pluck(this.model.get("attributeGroups").models,"id"))
      }
    },
    expandGroup:function(e){
      var groupId = $(e.target).attr("data-group")
      if (this.model.isExpanded(groupId)) {
        this.model.removeExpanded(groupId)
      } else {
        this.model.addExpanded(groupId)
      }
    },
    
  });

  return FiltersView;
});
