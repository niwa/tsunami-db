define([
  'jquery',  'underscore',  'backbone',
  'bootstrap',
  'jquery.select2/select2',
  'text!./mapControl.html',
  'text!./mapControlColorSelect.html',
  'text!./mapControlColorKey.html',
], function (
  $, _, Backbone,
  bootstrap,
  select2,  
  template,
  templateColorSelect,
  templateColorKey
) {

  return Backbone.View.extend({
    events : {    
      "change #select-color-attribute" : "colorColumnChanged",
      "click .nav-link" : "handleNavLink",      
    },
    initialize : function () {      
      this.handleActive()    
      
      this.render()
      this.listenTo(this.model, "change:active",        this.handleActive);      
      this.listenTo(this.model, "change:outColorColumn", this.updateOutColorColumn);
      
    },
    render: function () {
      this.$el.html(_.template(template)({
        t:this.model.getLabels()
      }))      
      return this
    },
    initTooltips:function(){
      this.$('[data-toggle="tooltip"]').tooltip()
    },      
    update : function(){
      var outColumn = this.model.getOutColorColumn()
      this.$('#color-attribute-selector').html(_.template(templateColorSelect)({
        options:_.sortBy(
          _.map(
            this.model.get("columnCollection").byAttribute("colorable").byAttribute("multiples",0).models,
            function(column){
              return {
                value:column.id,
                label:column.get("title"),
                selected:column.get("column") === outColumn.get("column")
              }
          },this), function(option) {
            return option.label
          }
        )
      }))
      
      this.$('#select-color-attribute').select2({
        theme: "mapcontrol",
        minimumResultsForSearch: Infinity
      })
      
      var values = this.model.getOutColorColumn().getValues()
      this.$('#color-attribute-key').html(_.template(templateColorKey)({   
        t:this.model.getLabels(),                      
        title: outColumn.get("title"),
        tooltip: outColumn.get("description"),
        tooltip_more: outColumn.hasMoreDescription(),       
        id:outColumn.id,        
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
      this.initTooltips()           
    },
    updateOutColorColumn:function(){
//      this.views.control.set({outColorColumn:this.model.getOutColorColumn()})    
      this.update()
    },
    colorColumnChanged:function(e){      
      e.preventDefault()
      this.$el.trigger('colorColumnChanged',{column:$(e.target).val()})      
    },
    // event handlers for model change events
    handleActive : function(){
      if (this.model.isActive()) {
        this.$el.show()    
      } else {
        this.$el.hide()
      }
    },
    handleNavLink : function(e){
      e.preventDefault()
      e.stopPropagation()
      
      this.$el.trigger('navLink',{
        id:$(e.currentTarget).attr("data-id"),
        anchor:$(e.currentTarget).attr("data-page-anchor"),
        route:"page",
        type:"page"
      })      
    },      
    
  });

});
