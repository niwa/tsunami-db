define([
  'jquery',  'underscore',  'backbone',
  'bootstrap',
  'text!./mapPlotLat.html',
  'text!./mapPlotLatPlot.html',
  'text!./mapPlotLatControl.html',
  'text!./mapPlotLatRecordMarker.html',
  'text!./mapPlotLatRecordBelow.html',
  'text!./mapPlotLatRecordBar.html',
  'text!./mapPlotLatRecordAbove.html',
  'text!./mapPlotLatRecord.html'
], function (
  $, _, Backbone,
  bootstrap,
  template,
  templatePlot,
  templateControl,
  templateRecordMarker,
  templateRecordBelow,
  templateRecordBar,
  templateRecordAbove,
  templateRecord
) {

  return Backbone.View.extend({
    events : {    
      "click .select-record" : "selectRecord",      
      "click .select-column" : "selectColumn",      
      "mouseenter .select-record" : "mouseOverRecord",            
      "mouseleave .select-record" : "mouseOutRecord",            
      "click .nav-link" : "handleNavLink",      
    },
    initialize : function () {      
      this.handleActive()    
      
      this.render()
      this.listenTo(this.model, "change:active",        this.handleActive);      
      this.listenTo(this.model, "change:currentRecordCollection", this.renderPlot);      
      this.listenTo(this.model, "change:selectedRecordId", this.selectedRecordUpdated);      
      this.listenTo(this.model, "change:mouseOverRecordId", this.mouseOverRecordUpdated);   
      this.listenTo(this.model, "change:outPlotColumns",this.updateOutPlotColumns);
      
      
    },
    render: function () {
      this.$el.html(_.template(template)({t:this.model.getLabels()}))     
      this.renderControl()
      return this
    },
    renderControl : function(){
      this.$("#plot-control").html(_.template(templateControl)({
        t:this.model.getLabels(),
        columns : _.map(this.model.get("columnCollection").models,function(col){
          return {
            id:col.id,
            title:col.getTitle(),
            active:this.model.get("outPlotColumns").indexOf(col.id) > -1 ,
            color:col.get("plotColor"),
            tooltip:col.get("description"),
            tooltip_more:col.hasMoreDescription(),               
          }
        },this)
      }))      
      this.$('[data-toggle="tooltip"]').tooltip()
    },
    renderPlot : function(){
//        console.log("MapplotLatView.renderPlot 1", Date.now() - window.timeFromUpdate);
      
      var records = this.model.getCurrentRecords()
      
      if (records.length > 0) {
      
        var columns = _.reject(this.model.get("columnCollection").models,function(col){
          return this.model.get("outPlotColumns").indexOf(col.id) === -1 
        },this)
        
//console.log("MapplotLatView.renderPlot 2", Date.now() - window.timeFromUpdate);
        var recordsSorted = _.sortBy(records,
            function(record){
              return record.get('latitude')
            }
          ).reverse()
//console.log("MapplotLatView.renderPlot 2a", Date.now() - window.timeFromUpdate);
        var dataColumns = _.map(columns,function(col){
            return {
              cap:col.get("plotMax"),
              color:col.get("plotColor")
            }
          })
//console.log("MapplotLatView.renderPlot 2b", Date.now() - window.timeFromUpdate);          
        var dataRows = _.map(
          recordsSorted,
          function(record){
            var crgba = record.getColor().colorToRgb();

             // remember column ranges and record column values            
            // remember record data
            return _.template(templateRecord)({
              id:record.id,
              selected:record.isSelected(),
              marker: _.template(templateRecordMarker)({
                marker_color:record.getColor(),
                marker_fillColor:'rgba('+crgba[0]+','+crgba[1]+','+crgba[2]+',0.4)',                  
              }),                           
              bars: _.reduce(columns, function(bars, col) {
                var recordColumnValue = record.getColumnValue(col.getQueryColumn())
                var value = recordColumnValue !== null ? recordColumnValue : 0                
                bars.bars.push(_.template(templateRecordBar)({
                  value: value,
                  width: Math.max(Math.min(100,(value/col.get("plotMax"))*100),0), 
                  label: value !== null ? value : "no data",
                  color: col.get("plotColor")
                }))
                bars.below.push(_.template(templateRecordBelow)({
                  value: value,
                  color: col.get("plotColor")
                }))
                bars.above.push(_.template(templateRecordAbove)({
                  value: value,
                  color: col.get("plotColor"),
                  cap: col.get("plotMax")
                }))
                return bars
              },{
                below: [],
                bars: [],
                above: [],
              })                                                               
            })
          })
//console.log("MapplotLatView.renderPlot 2c", Date.now() - window.timeFromUpdate);
        
        this.$("#plot-plot").html(_.template(templatePlot)({
          records:dataRows,
          columns: dataColumns,
          anySelected:this.model.get("selectedLayerId") !== ""
        }))
//console.log("MapplotLatView.renderPlot 3", Date.now() - window.timeFromUpdate);
        
      } else {
        this.$("#plot-plot").html("<p>" + this.model.getLabels().out.map.plot.no_records_hint + "</p>")
      }
      
      
    },

    // event handlers for model change events
    handleActive : function(){
      if (this.model.isActive()) {
        this.$el.show()   
//        this.renderPlot()
      } else {
        this.$el.hide()
      }
    },
    
    mouseOverRecordUpdated:function(){
//      console.log("MapPlotLatView.mouseOverRecordUpdated")            
      var id = this.model.get("mouseOverRecordId")
      this.$(".select-record").removeClass('hover')
      if (id !== "") {
        this.$(".select-record[data-recordid='"+id+"']").addClass('hover')
      }       
      
    },
    selectedRecordUpdated:function(){
      console.log('selectedRecordUpdated')
      this.renderPlot()
    },    
    
    
    updateOutPlotColumns:function(){
      console.log('updateOutPlotColumns')
      this.renderPlot()
      this.renderControl()
    },    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    selectColumn:function(e){      
      e.preventDefault()
      
      var columns
      
      var toggleColumn = $(e.currentTarget).attr("data-columnid")
      
      if (this.model.get("outPlotColumns").indexOf(toggleColumn) > -1){
        columns = _.without(this.model.get("outPlotColumns"),toggleColumn)
      } else {
        columns = _.union(this.model.get("outPlotColumns"),[toggleColumn])
      }
      
      this.$el.trigger('plotColumnsSelected',{columns:columns})      
    },    
    
    selectRecord:function(e){      
      e.preventDefault()
      this.$el.trigger('recordSelect',{id:$(e.currentTarget).attr("data-recordid")})      
    },    
    mouseOverRecord:function(e){      
      e.preventDefault()
      this.$el.trigger('recordMouseOver',{id:$(e.currentTarget).attr("data-recordid")})      
    },    
    mouseOutRecord:function(e){      
      e.preventDefault()
      this.$el.trigger('recordMouseOut',{id:$(e.currentTarget).attr("data-recordid")})      
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
