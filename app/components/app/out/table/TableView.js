define([
  'jquery',  'underscore',  'backbone',
  'text!./table.html',
  'text!./table_records.html',
  'text!./table_header.html',
  'text!./table_body.html'
], function (
  $, _, Backbone,
  template,
  template_records,
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
      this.$el.html(_.template(template)({t:this.model.getLabels()}))      
      if (typeof this.model.getCurrentRecords() !== "undefined") {
        
        var columnsSorted = this.getSortedColumns()  

        this.$(".record-table-inner table").html(_.template(template_records)({
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
        this.initTable()
      }
      
    },
    initTable:function(){
      
      // clone table head
      var $placeholder = this.$(".record-table-inner thead")
      $placeholder.show()
      this.$(".record-table-head table").empty()
      $placeholder.clone().appendTo( this.$(".record-table-head table") );
      
      // clone widths
      this.$(".record-table-head table").css("width",$placeholder.width())
      this.$(".record-table-inner table").css("width",$placeholder.width())
      this.$(".record-table-head").css("width",this.$(".record-table-inner").width())
      
      this.$(".record-table-inner table").css("tableLayout","auto")
			this.copyWidths( 
        this.$(".record-table-inner thead th"),
        this.$(".record-table-head thead th")
      );
      this.$(".record-table-head table").css("tableLayout","fixed")
			this.copyWidths( 
        this.$(".record-table-inner thead th"),
        this.$(".record-table-inner tbody tr:first-child td")
      );
      this.$(".record-table-inner table").css("tableLayout","fixed")
      
      // adjust position
      this.$(".record-table-inner").css("top",this.$(".record-table-head").outerHeight())
      
      // hide original table head
      $placeholder.hide()      
      
    },
   /**
	 * Copy widths from the cells in one element to another. 
   **/
    copyWidths: function ( $from, $to ) {        
			$to.each( function ( i ) {
        var w = $($from[i]).outerWidth()
				$(this).css( {width: w, minWidth: w} );
			} );
    },
    update : function(){
      if (this.$(".record-table .record-table-inner tbody").length === 0) {
        this.render()
      } else {        
        // update body html
        this.$(".record-table-inner table tbody").html(this.getBodyHtml(
          this.model.getSortedRecords(),
          this.getSortedColumns()
        ))
        this.copyWidths( 
          this.$(".record-table-head thead th"),
          this.$(".record-table-inner tbody tr:first-child td")
        );
        // mark active record
        this.recordChanged()
      }
      
    },
    getSortedColumns : function(){
      return this.model.allExpanded()
      ? this.model.get('columnsSorted')
      : _.filter(_.clone(this.model.get('columnsSorted')),function(column){
        return column.get("default")
      },this)
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
        // update header active sort class
      this.$(".record-table thead th a.active").removeClass("active")
      this.$(".record-table thead th a[data-column="+this.model.get("tableSortColumn")+"]").addClass("active")      
      this.update()
    },
    updateTableSortOrder:function(){      
      if (this.model.get("tableSortOrder") === "1") {
        this.$(".record-table thead th a[data-column="+this.model.get("tableSortColumn")+"]").addClass("asc")
      } else {
        this.$(".record-table thead th a.asc").removeClass("asc")
      }              
      this.update()      
    },    
    expanded: function(){      
      if (this.model.allExpanded()) {
        this.$el.addClass("expanded")         
      } else {
        this.$el.removeClass("expanded")         
      }
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
