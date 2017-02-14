define([
  'jquery',  'underscore',  'backbone',
  'text!./table.html',
  'text!./table_records.html',
  'text!./table_record_row.html',
  'text!./table_header.html',
  'text!./table_body.html'
], function (
  $, _, Backbone,
  template,
  template_records,
  template_record_row,
  template_header,
  template_body  
) {

  return Backbone.View.extend({
    events : {
      "click .expand-all": "expandAll",
      "click .select-record" : "selectRecord",
      "click .sort-by" : "sortRecords",
    },
    initialize : function () {
      this.handleActive()    
      
      this.initColumns()
      
      this.render()
      this.listenTo(this.model, "change:active", this.handleActive);      
      this.listenTo(this.model, "change:currentRecordCollection", this.update);      
      this.listenTo(this.model, "change:expanded", this.expanded);      
      this.listenTo(this.model, "change:recordId", this.recordChanged);
      this.listenTo(this.model, "change:tableSortColumn", this.updateTableSortColumn);      
      this.listenTo(this.model, "change:tableSortOrder", this.updateTableSortOrder);        
      
    },
    render: function () {
      console.log("tableview render")      
      this.$el.html(_.template(template)({t:this.model.getLabels()}))      
      if (typeof this.model.getCurrentRecords() !== "undefined") {
        
        var columnsSorted 
        if (this.model.allExpanded()) {
          this.$el.addClass("expanded")         
          columnsSorted = this.model.get('columnsSorted')
        } else {
          this.$el.removeClass("expanded")         
          columnsSorted = _.filter(_.clone(this.model.get('columnsSorted')),function(column){
            return column.get("default")
          })
        }      

        this.$(".record-table").html(_.template(template_records)({
          header:this.getHeaderHtml(
            columnsSorted, 
            this.model.get("tableSortColumn"), 
            this.model.get("tableSortOrder")
          ),
          body: this.getBodyHtml(
            this.model.getSortedRecords(),
            columnsSorted
          )
        }))
        this.recordChanged()
      }
      
    },
    update : function(){
      if (this.$(".record-table .table-responsive").length === 0) {
        this.render()
      } else {
        // figure out columns
        var columnsSorted
        if (this.model.allExpanded()) {
          this.$el.addClass("expanded")         
          columnsSorted = this.model.get('columnsSorted')
        } else {
          this.$el.removeClass("expanded")         
          columnsSorted = _.filter(_.clone(this.model.get('columnsSorted')),function(column){
            return column.get("default")
          })
        }            
        
        // update header active sort class
        this.$(".record-table thead th a.active").removeClass("active")
        this.$(".record-table thead th a[data-column="+this.model.get("tableSortColumn")+"]").addClass("active")
        
        // update body html
        this.$(".record-table tbody").html(this.getBodyHtml(
          this.model.getSortedRecords(),
          columnsSorted
        ))

        // mark active record
        this.recordChanged()
      }
      
    },
    getHeaderHtml: function(columnsSorted, sortColumn, sortOrder){
      
      return _.template(template_header)({
        columns : columnsSorted,
        sortColumn : sortColumn,
        sortOrder : sortOrder,
      })
    },
    getBodyHtml: function(records,columnsSorted){
      return _.template(template_body)({
        rows:_.map(records,function(record){
          return {
            record : record,
            columns : columnsSorted
          }           
        },this)
      })      
    },
    recordChanged:function(){      
      var activeId = this.model.get("recordId")
      this.$('.tr-record').removeClass('selected')
      if (activeId !== "") {
        this.$('.tr-record-'+activeId).addClass('selected')
      }
       
    },
    
    initColumns: function(){
      
      this.model.set('tableSortColumn','id')
      this.model.set('tableSortOrder',1)
      
      var columnsSorted = []
      
      _.each(this.model.get('columnGroupCollection').models,function(group){
        _.each(this.model.get("columnCollection").byGroup(group.id).models,function(column){
          columnsSorted.push(column)
        },this)
      },this)
      
      this.model.set('columnsSorted',columnsSorted)
      
    },
    
    updateTableSortColumn:function(){
      this.update()
    },
    updateTableSortOrder:function(){
      this.update()      
    },    
    expanded: function(){      
      this.render()
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
      e.preventDefault()
      this.$el.trigger('recordSelect',{id:$(e.currentTarget).attr("data-recordid")})      
    },
    sortRecords:function(e){      
      e.preventDefault()
      var col = $(e.currentTarget).attr("data-column")
      this.$el.trigger('sortRecords',{
        column:col,
        order:col === this.model.get("tableSortColumn") ? parseInt(this.model.get("tableSortOrder")) * -1 : 1
      })      
    },
    
    
  });

});
