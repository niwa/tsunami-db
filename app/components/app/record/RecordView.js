define([
  'jquery',  'underscore',  'backbone',
  'text!./record.html',
  'text!./recordColumnText.html',
  'text!./recordColumnProxies.html',
  'text!./recordColumnReferences.html',
], function (
  $, _, Backbone,
  template,
  templateColumnText,
  templateColumnProxies,
  templateColumnReferences
) {

  var RecordView = Backbone.View.extend({
    events : {
      "click .close-record" : "closeRecord"
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
          
      var columnCollection = this.model.get("columnCollection")
      
      this.$el.html(_.template(template)({
        t:this.model.getLabels(),
        recordid: this.model.get("record").id,
        columnGroups:_.filter(
          _.map(this.model.get("columnGroupCollection").models,function(group){
            // group classes
            var classes = "group-" + group.id 

            var columnsByGroup = columnCollection.byGroup(group.id).models 

            if (columnsByGroup.length === 0 || group.id === "id") {
              return false
            } else {          
              return {
                title:group.get("title"),
                hint:group.get("hint"),
                id:group.id,
                classes: classes,
                groupColumns: _.filter(
                  _.map(columnsByGroup,function(column){
                    return this.getColumnHtml(column, group.id)                              
                  },this),
                  function(html){
                    return html !== false
                  }     
                )
              }          
            }          
          },this),
          function(group){
            return group !== false
          }
        )
      }))
      
      
    },    
    
    getColumnHtml:function(column){      
      
      var record = this.model.get("record")
      switch (column.get("type")){
        case "index":
          if (column.id === 'references') {              
            return _.template(templateColumnReferences)({
              title:column.get("title"),            
              references:record.getReferences()
            })
          } else if (column.id === 'proxies') {              
            return _.template(templateColumnProxies)({
              title:column.get("title"),            
              proxies:record.getProxies()
            })
          }  
                       
          break
        case "date" :
          if(column.get('combo') === 1) {
            if (column.get('filterable') === 1) {
              var combo_column = this.model.get("columnCollection").get(column.get('comboColumnId'))
              var value = ""
              if(column.get('comboType') === "min") {
                value = record.getColumnValue(combo_column.get("column"),true)
                  + " - " 
                  + record.getColumnValue(column.get("column"),true)      
                
              } else {
                value = record.getColumnValue(column.get("column"),true)
                  + " - " 
                  + record.getColumnValue(combo_column.get("column"),true)          
              }
              
              return _.template(templateColumnText)({
                title:column.get("title"),            
                value:value
              })                 
            } else {
              return ""
            }
          }
          break
        case "quantitative":
        case "spatial":                                      
        case "categorical":
        case "ordinal":
        case "text":
          return _.template(templateColumnText)({
            title:column.get("title"),            
            value:record.getColumnValue(column.get("column"),true)
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
    
    
    
    
    closeRecord : function(e){
      e.preventDefault()
      
      this.$el.trigger('recordClose')      
    }
    
    
  });

  return RecordView;
});
