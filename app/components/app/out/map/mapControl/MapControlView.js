define([
  'jquery',  'underscore',  'backbone',
  'text!./mapControl.html',
  'text!./mapControlColorSelect.html',
  'text!./mapControlColorKey.html',
], function (
  $, _, Backbone,
  template,
  templateColorSelect,
  templateColorKey
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
          this.model.get("columnCollection").byAttribute("colorable").models,
          function(column){
            return {
              value:column.id,
              label:column.get("title"),
              selected:column.get("column") === this.model.getOutColorColumn().get("column")
            }
        },this)
      }))
      var values = this.model.getOutColorColumn().getValues()
      this.$('#color-attribute-key').html(_.template(templateColorKey)({                
        values:_.map(values.values,function(value,index){
          var crgba = typeof values.colors !== "undefined" 
            ? values.colors[index].colorToRgb() 
            : [0,0,0]
          return {
            label: typeof values.labels !== "undefined" ? values.labels[index] : value,
            color: typeof values.colors !== "undefined" ? values.colors[index] : "",
            fillColor: 'rgba('+crgba[0]+','+crgba[1]+','+crgba[2]+',0.4)'
          }
        })      
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
