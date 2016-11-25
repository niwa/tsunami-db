define([
  'jquery',  'underscore',  'backbone',
  'text!./table.html',
  'text!./table_records.html'
], function (
  $, _, Backbone,
  template,
  template_records
) {

  return Backbone.View.extend({
    events : {
    },
    initialize : function () {
      this.handleActive()    
      this.render()
      this.listenTo(this.model, "change:active", this.handleActive);      
      this.listenTo(this.model, "change:currentRecordCollection", this.update);      
    },
    render: function () {
      this.$el.html(_.template(template)({t:this.model.getLabels()}))      
      this.update()
      return this
    },
    update : function(){
      if (typeof this.model.getCurrentRecords() !== "undefined") {
        this.$(".record-table").html(_.template(template_records)({records:this.model.getCurrentRecords()}))
      }
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
