define([
  'jquery',  'underscore',  'backbone',
  'text!./filters.html',
  'text!./filterOptions.html',
  'text!./filterMinMax.html',
  
], function (
  $, _, Backbone,
  template,
  templateFilterOptions,
  templateFilterMinMax
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
      if (_.isEmpty(this.model.get("recQuery"))) {
        this.$el.removeClass("filtered") 
      } else {
        this.$el.addClass("filtered") 
      }
      
      
      var attributeCollection = this.model.get("attributes").byAttribute("filterable")
      
      this.$el.html(_.template(template)({
        t:this.model.getLabels(),        
        attributeGroups:_.map(this.model.get("attributeGroups").models,function(group){
          // group classes
          var classes = "group-" + group.id 
          if (this.model.isExpanded(group.id)) {
            classes +=  " expanded-group"  
          }
          return {
            title:group.get("title"),
            hint:group.get("hint"),
            id:group.id,
            classes: classes,
            groupFilters: _.filter(
              _.map(attributeCollection.byGroup(group.id).models,function(att){
                return this.getFilterHtml(att, group.id)                              
              },this),
              function(html){
                return html !== ""
              }
            )
          }          
        },this)
      }))      
      return this
    },    
    
    getFilterHtml:function(att, groupId){      
      if (att.get("type") === "quantitative" || att.get("type") === "spatial") {
        var att_min = att.getQueryAttribute("min")
        var att_max = att.getQueryAttribute("max")
        
        var value_min = typeof (this.model.get("recQuery")[att_min]) !== "undefined"
          ? this.model.get("recQuery")[att_min]
          : ""              
        var value_max = typeof (this.model.get("recQuery")[att_max]) !== "undefined"
          ? this.model.get("recQuery")[att_max]
          : ""                      
        if (att.get("default") || value_min.trim() !== "" || value_max.trim() !== "" || this.model.isExpanded(groupId) ) {        
          return _.template(templateFilterMinMax)({
            title:att.get("title"),
            title_min:"Min",
            title_max:"Max",
            att_min:att_min,
            att_max:att_max,
            value_min:value_min,
            value_max:value_max
          })        
        } else {
          return ""
        }
      } else {
        var attId = att.getQueryAttribute()
        var value = typeof (this.model.get("recQuery")[attId]) !== "undefined"
          ? this.model.get("recQuery")[attId]
          : ""              
        // only show default attributes or those that are set unless group expanded                        
        if (att.get("default") || value.trim() !== "" || this.model.isExpanded(groupId) ) {
          return _.template(templateFilterOptions)({
            title:att.get("title") ,
            att:attId,
            value:value
          })
        } else {
          return ""
        }
      }
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
