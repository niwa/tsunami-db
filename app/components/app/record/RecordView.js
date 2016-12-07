define([
  'jquery',  'underscore',  'backbone',
  'text!./record.html',
  'text!./recordAttributeText.html',
], function (
  $, _, Backbone,
  template,
  templateAttributeText
) {

  var FiltersView = Backbone.View.extend({
    events : {
    },
    initialize : function () {
      this.render()
      this.listenTo(this.model, "change:active", this.handleActive);         
      this.listenTo(this.model, "change:record", this.update);         
    },
    render: function () {
//      this.update()
      return this
    },
    update: function () {
          
      var attributeCollection = this.model.get("attributeCollection")
      
      this.$el.html(_.template(template)({
        t:this.model.getLabels(),
        recordid: this.model.get("record").id,
        attributeGroups:_.map(this.model.get("attributeGroupCollection").models,function(group){
          // group classes
          var classes = "group-" + group.id 

          var attributesByGroup = attributeCollection.byGroup(group.id).models 

          if (attributesByGroup.length === 0 || group.id === "id") {
            return false
          } else {          
            return {
              title:group.get("title"),
              hint:group.get("hint"),
              id:group.id,
              classes: classes,
              groupAttributes: _.filter(
                _.map(attributesByGroup,function(att){
                  return this.getAttributeHtml(att, group.id)                              
                },this),
                function(html){
                  return html !== false
                }     
              )
            }          
          }          
        },this)
      }))
      
      
    },    
    
    getAttributeHtml:function(attribute){      
      var column = attribute.get("queryColumn")
      var record = this.model.get("record")
      switch (attribute.get("type")){
        case "quantitative":
        case "spatial":                              
        case "date" :
        case "categorical":
        case "ordinal":
        case "text":
          return _.template(templateAttributeText)({
            title:attribute.get("title"),            
            value:record.getValue(column)
          })          
          
          break
        default:
          return false
      }    
    },
    
    
    handleActive : function(){
      if (this.model.isActive()) {
        this.$el.show()        
      } else {
        this.$el.hide()
      }
    },
    
    
    
  });

  return FiltersView;
});
