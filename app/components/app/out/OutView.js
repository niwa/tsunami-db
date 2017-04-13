define([
  'jquery',  'underscore',  'backbone',
  'bootstrap',  
  './map/MapView', './map/MapModel',
  './table/TableView', './table/TableModel',
  'text!./out.html',
  'text!./out_nav.html',
  'text!./out_data.html'
], function (
  $, _, Backbone,
  bootstrap,
  MapView, MapModel,  
  TableView, TableModel,  
  template,
  templateNav,
  templateData
) {

  var OutView = Backbone.View.extend({
    events : {
      "click .toggle-view" : "toggleView",
      "click .toggle-data" : "toggleData",
      "click .close-data" : "closeData",
      "click .query-reset": "queryReset",      
      "click .download-data": "downloadData",      
    },
    initialize : function () {
      
      // shortcut
      this.views = this.model.getViews()
      
      this.render()

      this.listenTo(this.model, "change:active", this.handleActive);      
      this.listenTo(this.model, "change:mapInit", this.updateMapView);
      this.listenTo(this.model, "change:mapView", this.updateMapView);      
      this.listenTo(this.model, "change:outType", this.updateViews);      
      this.listenTo(this.model, "change:outMapType", this.updateOutMapType);      
      this.listenTo(this.model, "change:outColorColumn", this.updateOutColorColumn);      
      this.listenTo(this.model, "change:outPlotColumns", this.updateOutPlotColumns);      
      this.listenTo(this.model, "change:tableSortColumn", this.updateTableSortColumn);      
      this.listenTo(this.model, "change:tableSortOrder", this.updateTableSortOrder);      
      this.listenTo(this.model, "change:recordsUpdated", this.updateViews);      
      this.listenTo(this.model, "change:recordId", this.updateSelectedRecord);      
      this.listenTo(this.model, "change:recordMouseOverId", this.updateMouseOverRecord);      
      this.listenTo(this.model, "change:recordsPopup",this.recordsPopup)
      this.listenTo(this.model, "change:querySet",this.updateQuerySet)
      this.listenTo(this.model, "change:geoQuery",this.updateGeoQuery)
      this.listenTo(this.model, "change:dataToggled",this.renderData)
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
//      console.log("OutView.updateView")      

      switch(this.model.getOutType()){
        case "map":
          this.views.table.model.setActive(false)          
          this.views.map.model.setActive()          
          this.updateMapView()          
          break
        case "table":
          this.views.map.model.setActive(false)
          this.views.table.model.setActive()
          this.updateTableView()
          break
        default:
          break
      }
      this.renderHeader()
      this.renderData()
    },
    updateOutMapType:function(){
//      console.log("OutView.updateOutMapType")
      this.views.map.model.set("outType",this.model.getOutMapType())
    },
    updateGeoQuery:function(){
      this.views.map.model.set("geoQuery",this.model.get('geoQuery'))      
    },    
    updateQuerySet:function(){
      this.renderHeader()    
    },    
    renderHeader: function(active){
      active = typeof active !== "undefined" ? active : this.model.getOutType()
      var activeRecords = this.model.getRecords().byActive()
      this.$("nav").html(_.template(templateNav)({
        t:this.model.getLabels(),
        filtered:this.model.get('querySet'),
        active:active,
        record_no:typeof activeRecords !== "undefined" ? activeRecords.length : 0
      }))
    },
    renderData: function(){
      if (this.model.get('dataToggled')) {
        this.$("#data-view").html(_.template(templateData)({
          t:this.model.getLabels(),
          filtered : this.model.get('querySet'),
          download : {
            formats: [
              {
                id: "download-csv",
                title: this.model.getLabels().out.data.formats.csv,
                format: "csv"
              }
            ],
            tables : [
              {    
                id:"records",
                title: this.model.getLabels().out.data.tables.records,
              },
              { 
                id:"proxies",
                title: this.model.getLabels().out.data.tables.proxies,
              },              
              {                
                id:"references",
                title: this.model.getLabels().out.data.tables.references,
              },
            ]            
          },
          api : {
            formats: [
              {
                id: "api-xml",                
                title: this.model.getLabels().out.data.formats.xml,
                format: "xml",
                path: ""
              },    
              {
                id: "api-json",                
                title: this.model.getLabels().out.data.formats.json,
                format: "json",
                path: "&outputFormat=text/javascript"
              },                        
              {
                id: "api-csv",                
                title: this.model.getLabels().out.data.formats.csv,
                format: "csv",
                path: "&outputFormat=csv"
              },                        
            ],
            tables : [
              {                
                title: this.model.getLabels().out.data.tables.records,
                path: this.model.get("paths").records
              },
              {                
                title: this.model.getLabels().out.data.tables.proxies,
                path: this.model.get("paths").proxies
              },              
              {                
                title: this.model.getLabels().out.data.tables.references,
                path: this.model.get("paths").references
              },
            ]
          }
        }))
        this.$('#data-view .nav-tabs a').click(function (e) {
          e.preventDefault()
          $(this).tab('show')
        })
        this.$('#data-view .select-on-click').on('click', this.selectOnClick)
        
      } else {
        this.$("#data-view").html("")        
      }
    },
    initTableView : function(){
//      console.log("OutView.initTableView")
      var componentId = '#table'
      
      if (this.$(componentId).length > 0) {

        this.views.table = this.views.table || new TableView({
          el:this.$(componentId),
          model: new TableModel({
            labels: this.model.getLabels(),
            columnCollection: this.model.get("columnCollection").byAttribute("table"),
            columnGroupCollection: this.model.get("columnGroupCollection"),
            tableSortColumn: typeof this.model.get('tableSortColumn') !== "undefined" ? this.model.get('tableSortColumn') : 'id',
            tableSortOrder: typeof this.model.get('tableSortOrder') !== "undefined" ? this.model.get('tableSortOrder') : '1',
            active: true,
            recordId:""
          })              
        });        
      }
    },    
    initMapView : function(){
//      console.log("OutView.initMapView")
      
      var componentId = '#map'
      
      if (this.$(componentId).length > 0) {
        this.views.map = this.views.map || new MapView({
          el:this.$(componentId),
          model: new MapModel({
            labels: this.model.getLabels(),        
            config:this.model.getMapConfig(),
            layerCollection:this.model.getLayers(),
            columnCollection: this.model.get("columnCollection"),            
            active: false,
            popupLayers:[],
            selectedLayerId: "",
            recordsUpdated:0,            
          })              
        });           
      }
    },    
    
    recordsPopup:function(){
//      console.log("OutView.recordsPopup ")

      this.views.map.model.set({
        popupLayers:this.model.get("recordsPopup").length > 0 
        ? _.map (this.model.get("recordsPopup"),function(record){
            return {
              id: record.getLayer().id,
              layer: record.getLayer().getMapLayerDirect(),
              color: record.getColor(),
              label: record.getTitle(),
              selected:record.isSelected(),
              mouseOver:record.id === this.model.get("recordMouseOverId")
            }
          },this)
        : []
      })      
    },
    updateTableView : function(){    
      this.views.table.model.setCurrentRecords(this.model.getRecords().byActive())          
    },
    updateMapView : function(){      
//      console.log("OutView.updateMapView" )
      this.views.map.model.setView(this.model.getActiveMapview())
      this.views.map.model.invalidateSize()
      this.views.map.model.setCurrentRecords(this.model.getRecords().byActive().hasLocation())      
      this.views.map.model.setRecordsUpdated(this.model.getRecordsUpdated())      
      
    },
    updateSelectedRecord:function(){
//      console.log("OutView.updateSelectedRecord")
      
      var recordId = this.model.get("recordId")
      
      if (recordId !== "") {
        // update map and table views
        var record = this.model.getRecords().get(recordId)
        if (record.isActive()){                    
          this.views.map.model.set("selectedLayerId",record.getLayer().id)
          this.views.table.model.set("recordId",recordId)  
        }                
      } else {        
        this.views.map.model.set("selectedLayerId","")
        this.views.table.model.set("recordId","")
      } 
      
    },
    updateMouseOverRecord:function(){
//      console.log("OutView.updateMouseOverRecord")
      
      var recordId = this.model.get("recordMouseOverId")
           
      if (recordId !== "") {
        // update map  view
        var record = this.model.getRecords().get(recordId)
        if (record.isActive()){                    
          this.views.map.model.set("mouseOverLayerId",record.getLayer().id)
        }                
      } else {        
        this.views.map.model.set("mouseOverLayerId","")
      }           
    },
    updateOutColorColumn:function(){
      this.views.map.model.set("outColorColumn",this.model.getOutColorColumn())
    },
    updateOutPlotColumns:function(){
      this.views.map.model.set("outPlotColumns",this.model.getOutPlotColumns())
    },
    updateTableSortColumn:function(){
      this.views.table.model.set(
        "tableSortColumn", 
        typeof this.model.get('tableSortColumn') !== "undefined" ? this.model.get('tableSortColumn') : 'id'
      )
    },
    updateTableSortOrder:function(){
      this.views.table.model.set(
        "tableSortOrder", 
        typeof this.model.get('tableSortOrder') !== "undefined" ? this.model.get('tableSortOrder') : '1'
      )
    },
    toggleView:function(e){      
      e.preventDefault()
      this.model.set('dataToggled', false)
      this.$el.trigger('setOutView',{out_view:$(e.currentTarget).attr("data-view")})            
      this.renderHeader()
    },
    
    handleActive : function(){
      if (this.model.isActive()) {
        this.$el.show()        
      } else {
        this.$el.hide()
      }
    },    
    queryReset:function(e){      
      e.preventDefault()
      this.$el.trigger('recordQuerySubmit',{query:{}})
    },    
    toggleData: function(e){
      e.preventDefault()
      this.model.set('dataToggled', !this.model.get('dataToggled'))      
      
      if (this.model.get('dataToggled')){
        this.renderHeader('data')
      } else {
        this.renderHeader()
      }
    },
    closeData: function(e){
      e.preventDefault()
      this.model.set('dataToggled', false)
      
      this.renderHeader()
    },
    selectOnClick: function(e){
      e.preventDefault()
      e.target.focus();
      e.target.select();
      setTimeout(function () {
        e.target.setSelectionRange(0, 9999);
      }, 1);
    },      
    
    downloadData:function(e) {
      e.preventDefault();
      var format = $(e.currentTarget).attr('data-format')
      var table = $(e.currentTarget).attr('data-table')
      var active = $(e.currentTarget).attr('data-active')
      
      if (format === "csv") {
        var csv = ""
        var filename = ""
        var link
        switch (table) {
          case "records":
            csv = active === "true" 
              ? this.model.get("recordCollection").byActive().toCSV()
              : this.model.get("recordCollection").toCSV()
            filename = active === "true" 
              ? "records_filtered.csv"
              : "records.csv"
            break;
          case "proxies":
            csv = this.model.get("recordCollection").getProxies().toCSV()
            filename = "proxies.csv"            
            break;
          case "references":
            csv = this.model.get("recordCollection").getReferences().toCSV()
            filename = "references.csv"            
            break;
        }
        
        var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        if (navigator && navigator.msSaveBlob) { // IE 10+
          navigator.msSaveBlob(blob, filename);
        } else {
          var link = document.createElement("a");
          if (link.download !== undefined) { // feature detection
            // Browsers that support HTML5 download attribute
            var url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.setAttribute('target', "_blank");                
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        }
      }
      
    }
  });

  return OutView;
});
