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
      
//      this.render()
      this.listenTo(this.model, "change:active", this.handleActive);      
      this.listenTo(this.model, "change:currentRecordCollection", this.update);      
      this.listenTo(this.model, "change:expanded", this.render);      
      this.listenTo(this.model, "change:recordId", this.updateActiveRecord);
      this.listenTo(this.model, "change:tableSortColumn", this.updateTableSortColumn);      
      this.listenTo(this.model, "change:tableSortOrder", this.updateTableSortOrder);        
      $(window).on("resize", _.debounce(_.bind(this.resize, this), 100));
    },
    resize: function(){
      // set max height
      this.update()
    },  
    render: function () {
//      console.log('TableView.render 1', Date.now() - window.timeFromUpdate)
      
      if (this.model.allExpanded()) {
        this.$el.addClass("expanded")         
      } else {
        this.$el.removeClass("expanded")         
      }
      this.$el.html(_.template(template)({t:this.model.getLabels()}))      
      if (typeof this.model.getCurrentRecords() !== "undefined") {
        
        var columnsSorted = this.getSortedColumns()  

        this.$(".record-table-scrolling-y table").html(_.template(template_records)({
          t: this.model.getLabels(),
          header: _.template(template_header)({
            t: this.model.getLabels(),
            columns : columnsSorted,
            sortColumn : this.model.get("tableSortColumn"),
            sortOrder : this.model.get("tableSortOrder"),
          }),
          body: this.getBodyHtml(
            this.model.getSortedRecords(),
            columnsSorted
          )
        }))
//      console.log('TableView.render 2', Date.now() - window.timeFromUpdate)

        this.updateActiveRecord()
//              console.log('TableView.render 3', Date.now() - window.timeFromUpdate)

        this.updateTable()
//              console.log('TableView.render 4', Date.now() - window.timeFromUpdate)

        this.setTableHeight()
//              console.log('TableView.render 5', Date.now() - window.timeFromUpdate)

      }
      
    },
    
    update : function(){
//      console.log('TableView.update 1', Date.now() - window.timeFromUpdate)
      
      if (this.$(".record-table .record-table-scrolling-y tbody").length === 0) {
        this.render()
      } else {     
        // update body html
        this.$(".record-table-scrolling-y table tbody").html(this.getBodyHtml(
          this.model.getSortedRecords(),
          this.getSortedColumns()
        ))
//        console.log('TableView.update 2', Date.now() - window.timeFromUpdate)
        // mark active record
        this.updateActiveRecord()
//        console.log('TableView.update 3', Date.now() - window.timeFromUpdate)
        this.updateTable()   
//        console.log('TableView.update 4', Date.now() - window.timeFromUpdate)
        
        // set max height
        this.setTableHeight()
      }
      
    },
    initTable:function(){
//      console.log('TableView.initTable 1', Date.now() - window.timeFromUpdate)
      
      // variables
      var $floating = this.$(".record-table-floating")      
      var $floatingTable = $floating.find("table")      
      var $scrolling = this.$(".record-table-scrolling-y")     
      
      // clone table head
//      console.log('TableView.initTable 2', Date.now() - window.timeFromUpdate)
      
      $floatingTable.empty()      
      $scrolling.find("table thead")
        .clone()
        .appendTo( $floatingTable );

//      console.log('TableView.initTable 3', Date.now() - window.timeFromUpdate)

      this.setTableWidths()
//      console.log('TableView.initTable 4', Date.now() - window.timeFromUpdate)
      
      // adjust position
      $scrolling.css("top",$floating.outerHeight())
//      console.log('TableView.initTable 5', Date.now() - window.timeFromUpdate)
      
      
    },
    setTableHeight:function(){
      // set max height
      this.$(".record-table-scrolling-y").css("maxHeight",
        this.$(".record-table-scrolling-x").outerHeight() 
        - this.$(".record-table-floating").outerHeight() 
        - this.$(".record-table-scrolling-y").css("marginTop").replace('px', '')
      )   
    },
    setTableWidths:function(){
      
      var $floating = this.$(".record-table-floating")      
      var $floatingTable = $floating.find("table")      
      var $scrolling = this.$(".record-table-scrolling-y")
      var $scrollingTable = $scrolling.find("table")
      var $scrollingTableHead = $scrollingTable.find("thead")    
//            console.log('TableView.setTableWidths 1', Date.now() - window.timeFromUpdate)

      $scrollingTableHead.show()
//            console.log('TableView.setTableWidths 1a', Date.now() - window.timeFromUpdate)
      
      // copy outer widths 
      $floatingTable.css("width",$scrollingTableHead.width())
//                  console.log('TableView.setTableWidths 1b', Date.now() - window.timeFromUpdate)

      $scrollingTable.css("width",$scrollingTableHead.width())      
//                  console.log('TableView.setTableWidths 1b', Date.now() - window.timeFromUpdate)

      $floating.css("width",$scrolling.width())
//            console.log('TableView.setTableWidths 1d', Date.now() - window.timeFromUpdate)
      

      // setup tables
      $scrollingTable.css("tableLayout","auto")
      $floatingTable.css("tableLayout","auto")
//console.log('TableView.setTableWidths 2', Date.now() - window.timeFromUpdate)
      // copy column widths      
      this.copyWidths( 
        $scrollingTableHead.find("th"),
        $floatingTable.find("thead th")
      );
//      console.log('TableView.setTableWidths 3', Date.now() - window.timeFromUpdate)
      this.copyWidths( 
        $scrollingTableHead.find("th"),
        $scrollingTable.find("tbody tr:first-child td")
      );

      $floatingTable.css("tableLayout","fixed")
      $scrollingTable.css("tableLayout","fixed")
      $scrollingTableHead.hide()
//console.log('TableView.setTableWidths 4', Date.now() - window.timeFromUpdate)      
    },
    updateTable:function(){
      if (this.$(".record-table .record-table-floating thead").length === 0) {
        this.initTable()
      } else {
        this.setTableWidths()     
      }     
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
    
    
    getSortedColumns : function(){
      return this.model.allExpanded()
      ? this.model.get('columnsSorted')
      : _.filter(_.clone(this.model.get('columnsSorted')),function(column){
        return column.get("isDefault")
      },this)
    },

    getBodyHtml: function(records,columnsSorted){
      return _.template(template_body)({
        t: this.model.getLabels(),
        rows:_.map(records,function(record){
          return {
            record : record,
            columns : columnsSorted
          }           
        },this)
      })      
    },
    updateActiveRecord:function(){      
      var activeId = this.model.get("recordId")
      this.$('.tr-record').removeClass('selected')
      if (activeId !== "") {
        this.$('.tr-record-'+activeId).addClass('selected')
      }
    },
    
    initColumns: function(){
      
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
      this.updateTableSortOrder()      
    },
    updateTableSortOrder:function(){      
      // update header sort order class
      if (this.model.get("tableSortOrder") === "1") {
        this.$(".record-table thead th a[data-column="+this.model.get("tableSortColumn")+"]").addClass("asc")
      } else {
        this.$(".record-table thead th a.asc").removeClass("asc")
      }              
      this.update()      
    },     
    
    
    
    
    
    // event handlers for model change events    
    
    handleActive : function(){
      if (this.model.isActive()) {
        this.$el.show()     
        this.render()
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
