define([
  'jquery',  'underscore',  'backbone',
  'text!./mapControl.html',
  'text!./mapControlColorSelect.html',
], function (
  $, _, Backbone,
  template,
  templateColorSelect
) {

  return Backbone.View.extend({
    events : {    
      "change #select-color-attribute" : "colorColumnChanged"
    },
    initialize : function () {      
      
      this.render()
      this.listenTo(this.model, "change:outColorColumn", this.updateOutColorColumn);
      
    },
    render: function () {
      this.$el.html(_.template(template)({
        t:this.model.getLabels()
      }))      
      return this
    },
    update : function(){
      this.$('#color-attribute-selector').html(_.template(templateColorSelect)({
        options:_.map(
          _.filter(
            this.model.get("columnCollection").models,
            function(column){
              return column.get("type") === "ordinal" 
                      || (column.get("type") === "categorical" && typeof column.getValues().colors !== "undefined")
          }),
          function(column){
            return {
              value:column.id,
              label:column.get("title"),
              selected:column.get("column") === this.model.getOutColorColumn().get("column")
            }
        },this)
      }))
      
    },
    updateOutColorColumn:function(){
//      this.views.control.set({outColorColumn:this.model.getOutColorColumn()})    
      this.update()
    },
    colorColumnChanged:function(e){      
      e.preventDefault()
      this.$el.trigger('colorColumnChanged',{column:$(e.target).val()})      
    },
    
    
  });

});
