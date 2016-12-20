define([
  'jquery',  'underscore',  'backbone',
  'text!./mapPlotLat.html',
  'text!./mapPlotLatPlot.html'
], function (
  $, _, Backbone,
  template,
  templatePlot
) {

  return Backbone.View.extend({
    events : {    
      "click .select-record" : "selectRecord",      
      "mouseenter .select-record" : "mouseOverRecord",            
      "mouseleave .select-record" : "mouseOutRecord",            
    },
    initialize : function () {      
      this.handleActive()    
      
      this.render()
      this.listenTo(this.model, "change:active",        this.handleActive);      
      this.listenTo(this.model, "change:currentRecordCollection", this.update);      
      this.listenTo(this.model, "change:selectedRecordId", this.selectedRecordUpdated);      
      this.listenTo(this.model, "change:mouseOverRecordId", this.mouseOverRecordUpdated);      
      
    },
    render: function () {
      this.$el.html(_.template(template)({
        t:this.model.getLabels()
      }))      
      return this
    },
    update : function(){
      var records = this.model.getCurrentRecords().models
      
      if (records.length > 0) {
      
        var columns = this.model.get("columnCollection").models
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

              columnData[i].min = columnData[i].min === null || recordColumnValue < columnData[i].min
                ? recordColumnValue
                : columnData[i].min
              columnData[i].max = columnData[i].max === null || recordColumnValue > columnData[i].max
                ? recordColumnValue
                : columnData[i].max

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
        
        this.$("#placeholder-plot").html(_.template(templatePlot)({
          records:recordData,
          columns:columnData,
          anySelected:this.model.get("selectedLayerId") !== ""
        }))
      } else {
        this.$("#placeholder-plot").html("0 records with current filter settings")
      }
      
      
    },

    // event handlers for model change events
    handleActive : function(){
      if (this.model.isActive()) {
        this.$el.show()   
        this.update()
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
      this.update()
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
