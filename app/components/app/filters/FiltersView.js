define([
  'jquery',  'underscore',  'backbone',
  'text!./filters.html'
], function (
  $, _, Backbone,
  template
) {

  var FiltersView = Backbone.View.extend({
    events : {
    },
    initialize : function () {
      this.render()
    },
    render: function () {
      this.$el.html(_.template(template)({t:this.model.getLabels()}))      
      return this
    },    
  });

  return FiltersView;
});
