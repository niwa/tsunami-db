define([
  'jquery',  'underscore',  'backbone',
  'bootstrap',  
  './map/MapView', './map/MapModel',
  './table/TableView', './table/TableModel',
  'text!./out.html',
  'text!./out_nav.html',
  'text!./out_data.html',
  'text!./out_navInfo.html',
  'text!./out_navReset.html',
  'ga'
], function (
  $, _, Backbone,
  bootstrap,
  MapView, MapModel,  
  TableView, TableModel,  
  template,
  templateNav,
  templateData,
  templateNavInfo,
  templateNavReset,
  ga
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
      this.listenTo(this.model, "change:mapView", this.updateMapViewView);      
      this.listenTo(this.model, "change:outType", this.updateOutType);      
      this.listenTo(this.model, "change:outMapType", this.updateOutMapType);      
      this.listenTo(this.model, "change:outColorColumn", this.updateOutColorColumn);      
      this.listenTo(this.model, "change:outPlotColumns", this.updateOutPlotColumns);      
      this.listenTo(this.model, "change:tableSortColumn", this.updateTableSortColumn);      
      this.listenTo(this.model, "change:tableSortOrder", this.updateTableSortOrder);      
      this.listenTo(this.model, "change:recordsUpdated", this.updateRecords);      
      this.listenTo(this.model, "change:recordId", this.updateSelectedRecord);      
      this.listenTo(this.model, "change:recordMouseOverId", this.updateMouseOverRecord);      
      this.listenTo(this.model, "change:recordsPopup",this.recordsPopup)
      this.listenTo(this.model, "change:queryLength",this.updateQueryLength)
      this.listenTo(this.model, "change:geoQuery",this.updateGeoQuery)
      this.listenTo(this.model, "change:query",this.updateQuery)
      this.listenTo(this.model, "change:dataToggled",this.renderData)
    },
    render: function () {
//      console.log("OutView.render")      
      this.$el.html(_.template(template)({
        t:this.model.getLabels()
      }))   
      this.renderHeader()      
      this.renderHeaderInfo()
      this.renderHeaderReset()      
      this.updateHeaderActive()      
      this.updateViews()
      return this
    }, 
    updateViews:function(){      
//      console.log("OutView.updateView")      
//          console.log('OutView.updateViews 1', Date.now() - window.timeFromUpdate)      
      switch(this.model.getOutType()){
        case "map":
//          console.log('OutView.updateViews Xa', Date.now() - window.timeFromUpdate)
          
          this.initMapView()      
//          console.log('OutView.updateViews Xb', Date.now() - window.timeFromUpdate)
          if (this.views.table) {
            this.views.table.model.setActive(false)          
          }
          this.views.map.model.setActive()                    
//          console.log('OutView.updateViews Xc', Date.now() - window.timeFromUpdate)
          this.updateMapView()          
//          console.log('OutView.updateViews Xd', Date.now() - window.timeFromUpdate)
          break
        case "table":
//          console.log('OutView.updateViews 1a', Date.now() - window.timeFromUpdate)
          
          this.initTableView()
//          console.log('OutView.updateViews 1b', Date.now() - window.timeFromUpdate)
          if (this.views.map) {
            this.views.map.model.setActive(false)
          }
          this.views.table.model.setActive()
          this.updateTableView()
          break
        default:
          break
      }
      
    },
  
    renderHeader: function(){
//      console.log("OutView.renderHeader")            
      this.$("nav").html(_.template(templateNav)({
        t:this.model.getLabels()
      }))
    },
    
    renderHeaderInfo: function(){
//      console.log("OutView.renderHeaderInfo")
      var activeRecords = this.model.getRecords().byActive()      
      this.$("nav .out-nav-info").html(_.template(templateNavInfo)({
        t:this.model.getLabels(),
        filtered:this.model.get('queryLength') > 0,
        record_no:typeof activeRecords !== "undefined" ? activeRecords.length : 0
      }))
    },
    
    renderHeaderReset: function(){
//      console.log("OutView.renderHeaderReset")
      if (this.model.get('queryLength') > 0) {
        this.$("nav .out-nav-reset").html(_.template(templateNavReset)({
          t: this.model.getLabels(),
          count: this.model.get('queryLength')
        }))
      } else {
        this.$("nav .out-nav-reset").html("")
      }
    },
    updateHeaderActive: function(active){
//      console.log("OutView.renderHeaderActive")
      active = typeof active !== "undefined" ? active : this.model.getOutType()
      this.$("nav .toggle-btn").removeClass('active');
      this.$("nav .toggle-"+active).addClass('active');
    },
    
    updateRecords: function(){
//      console.log("OutView.updateRecords")
      this.renderHeaderInfo()
      this.updateViews()
      this.renderData()
    },
    updateOutType: function(){
//      console.log("OutView.updateOutType")
      this.updateHeaderActive()
      this.updateViews()
    },
    updateQueryLength: function(){  
//      console.log("OutView.updateQueryLength")
      this.renderHeaderReset()      
    },
    
    
    renderData: function(){
//      console.log("OutView.renderData")
            
      if (this.model.get('dataToggled')) {
        this.$("#data-view").html(_.template(templateData)({
          t:this.model.getLabels(),
          filtered : this.model.get('queryLength') > 0,
          canDownload: Modernizr.blobconstructor,
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
    
    // child views
    
    initTableView : function(){
//      console.log('OutView.initTableView 1', Date.now() - window.timeFromUpdate)
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
//      console.log('OutView.initTableView 2', Date.now() - window.timeFromUpdate)
        
      }
    },    
    
    updateTableView : function(){    
//      console.log('OutView.updateTableView 1', Date.now() - window.timeFromUpdate)
      
      if (this.model.getOutType() === 'table' && typeof this.views.table !== 'undefined'){        
//        console.log('OutView.updateTableView 1a', Date.now() - window.timeFromUpdate)        
        this.views.table.model.setCurrentRecords(this.model.getRecords().byActive())   
//        console.log('OutView.updateTableView 1b', Date.now() - window.timeFromUpdate)
        this.updateTableSortColumn()
//        console.log('OutView.updateTableView 1c', Date.now() - window.timeFromUpdate)
        this.updateTableSortOrder()
//        console.log('OutView.updateTableView 1d', Date.now() - window.timeFromUpdate)
      }
//      console.log('OutView.updateTableView 2', Date.now() - window.timeFromUpdate)
      
    },    
    updateTableSortColumn:function(){
      if (this.model.getOutType() === 'table' && typeof this.views.table !== 'undefined'){
        this.views.table.model.set(
          "tableSortColumn", 
          typeof this.model.get('tableSortColumn') !== "undefined" ? this.model.get('tableSortColumn') : 'id'
        )
      }
    },
    updateTableSortOrder:function(){
      if (this.model.getOutType() === 'table' && typeof this.views.table !== 'undefined'){
        this.views.table.model.set(
          "tableSortOrder", 
          typeof this.model.get('tableSortOrder') !== "undefined" ? this.model.get('tableSortOrder') : '1'
        )
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
    updateMapView : function(){      
      if (this.model.getOutType() === 'map' && typeof this.views.map !== 'undefined'){      
//          console.log('OutView.updateMapView 1', Date.now() - window.timeFromUpdate)
        
        this.updateMapViewView()       
//          console.log('OutView.updateMapView 2', Date.now() - window.timeFromUpdate)
        
        this.updateOutMapType()        
//          console.log('OutView.updateMapView 3', Date.now() - window.timeFromUpdate)
        
        this.updateGeoQuery()
//          console.log('OutView.updateMapView 4', Date.now() - window.timeFromUpdate)
        
        this.updateOutColorColumn()
//          console.log('OutView.updateMapView 5', Date.now() - window.timeFromUpdate)
        
        this.updateOutPlotColumns()      
//          console.log('OutView.updateMapView 6', Date.now() - window.timeFromUpdate)
        
        this.views.map.model.setCurrentRecords(this.model.getRecords().byActive().hasLocation())      
//                  console.log('OutView.updateMapView 7', Date.now() - window.timeFromUpdate)

        this.views.map.model.setRecordsUpdated(this.model.getRecordsUpdated())  
//                  console.log('OutView.updateMapView 8', Date.now() - window.timeFromUpdate)

      }
    },
    updateMapViewView : function(){      
//      console.log("OutView.updateMapView" )
      if (this.model.getOutType() === 'map' && typeof this.views.map !== 'undefined'){
        this.views.map.model.setView(this.model.getActiveMapview())
        this.views.map.model.invalidateSize()    
      }      
    },    
    updateOutMapType:function(){
//      console.log("OutView.updateOutMapType")
      if (this.model.getOutType() === 'map' && typeof this.views.map !== 'undefined'){
        this.views.map.model.set("outType",this.model.getOutMapType())
      }
    },
    updateGeoQuery:function(){
      if (this.model.getOutType() === 'map' && typeof this.views.map !== 'undefined'){      
        this.views.map.model.set("geoQuery",this.model.get('geoQuery'))      
      }
    },        
    updateOutColorColumn:function(){
      if (this.model.getOutType() === 'map' && typeof this.views.map !== 'undefined'){
        this.views.map.model.set("outColorColumn",this.model.getOutColorColumn())
      }
    },
    updateOutPlotColumns:function(){
      if (this.model.getOutType() === 'map' && typeof this.views.map !== 'undefined'){
        this.views.map.model.set("outPlotColumns",this.model.getOutPlotColumns())
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
              label: this.model.getLabels().record.title + " " + record.id,
              selected:record.isSelected(),
              mouseOver:record.id === this.model.get("recordMouseOverId")
            }
          },this)
        : []
      })      
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

    updateSelectedRecord:function(){
    //      console.log("OutView.updateSelectedRecord")
      
      var recordId = this.model.get("recordId")
      
      if (recordId !== "") {
        // update map and table views
        var record = this.model.getRecords().get(recordId)
        if (record.isActive()){     
          if (this.model.getOutType() === 'map' && typeof this.views.map !== 'undefined'){
            this.views.map.model.set("selectedLayerId",record.getLayer().id)
          }
          if (this.model.getOutType() === 'table' && typeof this.views.table !== 'undefined'){
            this.views.table.model.set("recordId",recordId)  
          }
        }                
      } else {    
        if (this.model.getOutType() === 'map' && typeof this.views.map !== 'undefined'){
          this.views.map.model.set("selectedLayerId","")
        }
        if (this.model.getOutType() === 'table' && typeof this.views.table !== 'undefined'){
          this.views.table.model.set("recordId","")
        }
      } 
      
    },

    toggleView:function(e){      
      e.preventDefault()
      this.model.set('dataToggled', false)
      this.$el.trigger('setOutView',{out_view:$(e.currentTarget).attr("data-view")})            
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
        this.updateHeaderActive('data')
      } else {
        this.updateHeaderActive()
      }
    },
    closeData: function(e){
      e.preventDefault()
      this.model.set('dataToggled', false)
      
      this.updateHeaderActive()
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
      if(Modernizr.blobconstructor) {
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
          if (window.__ga__ && ga.loaded) { ga('send', 'event', 'Download', table, '')}

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
    }
  });

  return OutView;
});
