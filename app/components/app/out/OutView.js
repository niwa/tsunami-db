define([
  'jquery',  'underscore',  'backbone',
  './map/MapView', './map/MapModel',
  './table/TableView', './table/TableModel',
  'text!./out.html',
  'text!./out_nav.html'
], function (
  $, _, Backbone,
  MapView, MapModel,  
  TableView, TableModel,  
  template,
  templateNav
) {

  var OutView = Backbone.View.extend({
    events : {
      "click .toggle-view" : "toggleView"
    },
    initialize : function () {
      
      // shortcut
      this.views = this.model.getViews()
      
      this.render()
      
      this.listenTo(this.model, "change:mapInit", this.updateMap);
      this.listenTo(this.model, "change:mapView", this.updateMap);      
      this.listenTo(this.model, "change:outType", this.updateOutType);      
      this.listenTo(this.model, "change:outColorColumn", this.updateOutColorColumn);      
      this.listenTo(this.model, "change:recordsUpdated", this.updateViews);      
      this.listenTo(this.model, "change:recordId", this.updateSelectedRecord);      
    },
    render: function () {
      this.$el.html(_.template(template)({
        t:this.model.getLabels()
      }))   
      this.renderHeader()
      this.initViews()
      return this
    }, 
    initViews:function(){
      this.initMapView()
      this.initTableView()
    },    
    updateViews:function(){
      var activeRecords = this.model.getRecords().byActive()
      switch(this.model.getOutType()){
        case "map":
          this.updateMapView()
          break
        case "table":
          this.updateTableView(activeRecords)     
          break
      }
      this.renderHeader(activeRecords)
    },
    updateOutType:function(){
      
      switch(this.model.getOutType()){
        case "map":
          this.views.map.model.setActive()
          this.updateMapView()
          this.views.table.model.setActive(false)
          break
        case "table":
          this.views.map.model.setActive(false)
          this.updateTableView(this.model.getRecords().byActive())
          this.views.table.model.setActive()
          break
      }
      this.renderHeader(this.model.getRecords().byActive())
    },
    renderHeader: function(activeRecords){
      this.$("nav").html(_.template(templateNav)({
        active:this.model.getOutType(),
        record_no:typeof activeRecords !== "undefined" ? activeRecords.length : 0
      }))
    },
    initTableView : function(){
      var componentId = '#table'
      
      if (this.$(componentId).length > 0) {

        this.views.table = this.views.table || new TableView({
          el:this.$(componentId),
          model: new TableModel({
            labels: this.model.getLabels(),
            columnCollection: this.model.get("columnCollection").byAttribute("table"),
            columnGroupCollection: this.model.get("columnGroupCollection"),
            active: false,
            recordId:""
          })              
        });        
      }
    },    
    initMapView : function(){
      var componentId = '#map'
      
      if (this.$(componentId).length > 0) {

        this.views.map = this.views.map || new MapView({
          el:this.$(componentId),
          model: new MapModel({
            labels: this.model.getLabels(),        
            config:this.model.getMapConfig(),
            layerCollection:this.model.getLayers(),
            columnCollection: this.model.get("columnCollection"),            
            active: false
          })              
        });   
        
        
      }
    },    
    updateTableView : function(activeRecords){    
      this.views.table.model.setCurrentRecords(activeRecords)       
      this.views.table.model.set("recordId",this.model.get("recordId"))      
    },
    updateMapView : function(){      
      
      this.views.map.model.setView(this.model.getActiveMapview())
      this.views.map.model.invalidateSize()
    },
    updateSelectedRecord:function(){
      this.updateViews()
      var recordId = this.model.get("recordId")
      if (recordId !== "") {
        this.model.getRecords().get(recordId).bringToFront()
      }      
    },
    updateOutColorColumn:function(){
      this.views.map.model.set({
        outColorColumn:this.model.getOutColorColumn()
      })
    },
    toggleView:function(e){      
      this.$el.trigger('setOutView',{out_view:$(e.target).attr("data-view")})      
    }
  });

  return OutView;
});
