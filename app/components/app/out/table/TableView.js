define([
  'jquery',  'underscore',  'backbone',
  'text!./table.html',
  'text!./table_records.html',
  'text!./table_record_row.html',
  'text!./table_header.html'
], function (
  $, _, Backbone,
  template,
  template_records,
  template_record_row,
  template_header
) {

  return Backbone.View.extend({
    events : {
      "click .expand-all": "expandAll",
      "click .select-record" : "selectRecord"      
    },
    initialize : function () {
      this.handleActive()    
      
      this.sortAttributes()
      
      this.render()
      this.listenTo(this.model, "change:active", this.handleActive);      
      this.listenTo(this.model, "change:currentRecordCollection", this.update);      
      this.listenTo(this.model, "change:expanded", this.update);      
      this.listenTo(this.model, "change:recordId", this.recordChanged);      
      
    },
    render: function () {
      this.$el.html(_.template(template)({t:this.model.getLabels()}))      
      this.update()
      return this
    },
    update : function(){
      var attributesSorted = _.clone(this.model.get('attributesSorted'))
      if (this.model.allExpanded()) {
        this.$el.addClass("expanded")         
      } else {
        this.$el.removeClass("expanded")         
        attributesSorted = _.filter(attributesSorted,function(att){
          return att.get("default")
        })
      }      
      if (typeof this.model.getCurrentRecords() !== "undefined") {
        this.$(".record-table").html(_.template(template_records)({
          header:this.getHeaderHtml(attributesSorted),
          rows:_.map(this.model.getCurrentRecords().models,function(record){
            return {
              html: this.getRecordHtml(record,attributesSorted)
            }
          },this)
        }))
      }
    },
    getHeaderHtml: function(attributesSorted){
      
      return _.template(template_header)({
        columns : attributesSorted
      })
    },
    getRecordHtml: function(record,attributesSorted){
      return _.template(template_record_row)({
        record : record,
        columns : attributesSorted
      })
    },
    recordChanged:function(){      
      var activeId = this.model.get("recordId")
      this.$('.tr-record').removeClass('selected')
      if (activeId !== "") {
        this.$('.tr-record-'+activeId).addClass('selected')
      }
       
    },
    
    sortAttributes: function(){
      
      var attributesSorted = []
      
      _.each(this.model.get('attributeGroupCollection').models,function(group){
        _.each(this.model.get("attributeCollection").byGroup(group.id).models,function(att){
          attributesSorted.push(att)
        },this)
      },this)
      
      this.model.set('attributesSorted',attributesSorted)
    },
    
    // event handlers for model change events    
    
    handleActive : function(){
      if (this.model.isActive()) {
        this.$el.show()        
      } else {
        this.$el.hide()
      }
    },
    
    
    expandAll:function(){
      if (this.model.allExpanded()) {
        this.model.setExpanded(false)
      } else {
        this.model.setExpanded(true)
      }
    },
    selectRecord:function(e){      
      this.$el.trigger('recordSelect',{id:$(e.currentTarget).attr("data-recordid")})      
    },
    
    
  });

});
