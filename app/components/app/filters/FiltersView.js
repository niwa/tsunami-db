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
        q:$.param(this.model.get("recQuery"))
      }))      
      return this
    },    
    querySubmit:function(){      
      this.$el.trigger('querySubmit',{value:this.$('#query').val()})
    },    
    queryReset:function(){      
      this.$el.trigger('querySubmit',{value:""})
    }
    
  });

  return FiltersView;
});
