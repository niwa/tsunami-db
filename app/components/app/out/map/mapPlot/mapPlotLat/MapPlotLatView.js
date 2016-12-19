define([
  'jquery',  'underscore',  'backbone',
  'text!./mapPlotLat.html'
], function (
  $, _, Backbone,
  template
) {

  return Backbone.View.extend({
    events : {    
      "change " : "colorColumnChanged"
    },
    initialize : function () {      
      this.handleActive()    
      
      this.render()
      this.listenTo(this.model, "change:active",        this.handleActive);      
      
    },
    render: function () {
      this.$el.html(_.template(template)({
        t:this.model.getLabels()
      }))      
      return this
    },
    update : function(){
      
    },

    // event handlers for model change events
    handleActive : function(){
      if (this.model.isActive()) {
        this.$el.show()    
      } else {
        this.$el.hide()
      }
    },
    
    
  });

});
