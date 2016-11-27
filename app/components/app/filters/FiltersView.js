define([
  'jquery',  'underscore',  'backbone',
  'text!./filters.html'
], function (
  $, _, Backbone,
  template
) {

  var FiltersView = Backbone.View.extend({
    events : {
      "click .query-submit": "querySubmit",
      "click .query-reset": "queryReset"
    },
    initialize : function () {
      this.render()
      this.listenTo(this.model, "change:recQuery", this.render);      
    },
    render: function () {
      this.$el.html(_.template(template)({
        t:this.model.getLabels(),
        q:$.param(this.model.get("recQuery")),
        attributeGroups:_.map(this.model.get("attributeGroups").models,function(group){
          return {
            title:group.get("title"),
            hint:group.get("hint"),
            id:group.id,
            attributes: _.map(this.model.get("attributes").byGroup(group.id).byFilterable().models,function(att){
              var value = typeof (this.model.get("recQuery")[att.getQueryAttribute()]) !== "undefined"
                ? this.model.get("recQuery")[att.getQueryAttribute()]
                : ""
              return {
                att:att,
                value:value
              }
            },this)
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
    }
    
  });

  return FiltersView;
});
