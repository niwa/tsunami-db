define([
  'jquery',  'underscore',  'backbone',
  'text!./mapPlotLat.html',
  'text!./mapPlotLatPlot.html',
  'text!./mapPlotLatControl.html'
], function (
  $, _, Backbone,
  template,
  templatePlot,
  templateControl
) {

  return Backbone.View.extend({
    events : {    
      "click .select-record" : "selectRecord",      
      "click .select-column" : "selectColumn",      
      "mouseenter .select-record" : "mouseOverRecord",            
      "mouseleave .select-record" : "mouseOutRecord",            
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
      this.$el.html(template)     
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
            color:col.get("plotColor")
          }
        },this)
      }))        
    },
    renderPlot : function(){
      var records = this.model.getCurrentRecords().models
      
      if (records.length > 0) {
      
        var columns = _.reject(this.model.get("columnCollection").models,function(col){
          return this.model.get("outPlotColumns").indexOf(col.id) === -1 
        },this)
        var recordData = []
        var columnData = _.map(columns,function(col){
          return {
            min:null,
            max:null,
            cap:col.get("plotMax"),
            title:col.get("title"),
            color:col.get("plotColor")
          }
        })

        _.each(
          _.sortBy(records,
            function(record){
              return record.get('latitude')
            }
          ).reverse(),
          function(record){
            var crgba = record.getColor().colorToRgb();

             // remember column ranges and record column values
            var recordValues = []        
            _.each(columns,function(col,i){
              var recordColumnValue = record.getColumnValue(col.getQueryColumn())

//              columnData[i].min = columnData[i].min === null || recordColumnValue < columnData[i].min
//                ? recordColumnValue
//                : columnData[i].min
//              columnData[i].max = columnData[i].max === null || recordColumnValue > columnData[i].max
//                ? recordColumnValue
//                : columnData[i].max

              recordValues.push(recordColumnValue)
            })


            // remember record data
            recordData.push({
              marker_color:record.getColor(),
              marker_fillColor:'rgba('+crgba[0]+','+crgba[1]+','+crgba[2]+',0.4)',
              selected:record.isSelected(),
              data: recordValues,
              id:record.id
            })
          }
        )
        
        this.$("#plot-plot").html(_.template(templatePlot)({
          records:recordData,
          columns:columnData,
          anySelected:this.model.get("selectedLayerId") !== ""
        }))
      } else {
        this.$("#plot-plot").html("0 records with current zoom and filter settings")
      }
      
      
    },

    // event handlers for model change events
    handleActive : function(){
      if (this.model.isActive()) {
        this.$el.show()   
        this.renderPlot()
      } else {
        this.$el.hide()
      }
    },
    
    mouseOverRecordUpdated:function(){
      console.log("MapPlotLatView.mouseOverRecordUpdated")            
      var id = this.model.get("mouseOverRecordId")
      this.$(".select-record").removeClass('hover')
      if (id !== "") {
        this.$(".select-record[data-recordid='"+id+"']").addClass('hover')
      }       
      
    },
    selectedRecordUpdated:function(){
      console.log("MapPlotLatView.selectedRecordUpdated")      
      this.renderPlot()
    },    
    
    
    updateOutPlotColumns:function(){
      console.log("MapPlotLatView.updateOutPlotColumns")      
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
  });

});
