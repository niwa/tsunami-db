define([
  'jquery','underscore','backbone',
  'leaflet',
  'esri.leaflet',
  'leaflet.rrose',
  'leaflet.draw',  
  './mapControl/MapControlView', './mapControl/MapControlModel',  
  './mapPlot/mapPlotLat/MapPlotLatView', './mapPlot/MapPlotModel',  
  'text!./map.html',
  'text!./mapPopupMultipeRecords.html',
], function(
  $, _, Backbone,
  leaflet,
  esriLeaflet,
  rrose,
  ldraw,
  MapControlView, MapControlModel,    
  MapPlotLatView, MapPlotModel,    
  template,
  templatePopupMultiple
){
  var MapView = Backbone.View.extend({
    events:{
      "click .layer-select" : "layerSelect",
      "mouseenter .layer-select" : "layerMouseOver",
      "mouseleave .layer-select" : "layerMouseOut",
      "click .toggle-option" : "toggleOptionClick",
      "click .nav-link" : "handleNavLink"      
    },
    initialize : function(){
//      console.log('MapView.initialize')
      this.handleActive()  

      // set up an empty layer group for all our overlay and basemap layers
      this.viewUpdating = false      
      this.views = this.model.getViews()

      this.render()
      
      
      this.listenTo(this.model, "change:active",        this.handleActive);
      this.listenTo(this.model, "change:view",          this.handleViewUpdate);
      this.listenTo(this.model, "change:outColorColumn",this.updateOutColorColumn);
      this.listenTo(this.model, "change:outPlotColumns",this.updateOutPlotColumns);
      this.listenTo(this.model, "change:outType",       this.updateOutType);

      this.listenTo(this.model, "change:invalidateSize",this.invalidateSize);      
      this.listenTo(this.model, "change:layersUpdated",this.layersUpdated);
      this.listenTo(this.model, "change:popupLayers",this.popupLayersUpdated)
      
      this.listenTo(this.model, "change:selectedLayerId", this.selectedLayerUpdated);      
      this.listenTo(this.model, "change:mouseOverLayerId", this.mouseOverLayerUpdated);      
      
      this.listenTo(this.model, "change:recordsUpdated", this.recordsUpdated);      
//      this.listenTo(this.model, "change:currentRecordCollection", this.updateViews);      
      this.listenTo(this.model, "change:geoQuery", this.updateGeoQuery);      


    },
    render : function(){    
//      console.log('MapView.render')      
      this.$el.html(_.template(template)({t:this.model.getLabels()}))
      this.configureMap()
      this.initViews()      
      this.initDraw()      
      return this
    },
    initDraw : function(){
      // Initialise the draw control and pass it the FeatureGroup of editable layers
      var _map = this.model.getMap()
      var drawControl = new L.Control.Draw({
        draw: {
          rectangle: true,
          polyline: false,
          polygon: false,
          marker: false,
          circle: false
        },
        edit: false
      })
      var labels = this.model.getLabels()
      L.drawLocal.draw.toolbar.buttons.rectangle = labels.out.map.draw.draw
      L.drawLocal.draw.handlers.rectangle.tooltip.start = labels.out.map.draw.start
      L.drawLocal.draw.handlers.simpleshape.tooltip.end = labels.out.map.draw.end              
      
      _map.addControl(drawControl)   
      
      this.$('.leaflet-touch .leaflet-draw-toolbar .leaflet-draw-draw-rectangle').html('<span class="icon-icon_draw"></span>') 
      
      _map.on('draw:created', _.bind(this.onDrawCreated,this));
      _map.on('draw:drawstart', _.bind(this.onDrawStart,this));
      
      var that = this
      // add delete control
      var deleteControl = L.Control.extend({

        options: {
          position: 'topleft' 
        },
        
        onAdd: function () {
          
          var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-delete');
          var deleteLink = L.DomUtil.create('a', '',container);
          $(deleteLink).attr('href',"#")
          $(deleteLink).attr('title', labels.out.map.draw.clear)
          L.DomUtil.create('span', 'icon-icon_draw-reset', deleteLink);
          
          deleteLink.onclick = _.bind(that.queryDeleteClicked,that)
          
          return container;
        },

      })
      
      this.model.set("queryDeleteControl",new deleteControl())   
      
      
    },
    initViews:function(){
      this.initMapControlView()
      this.initMapPlotLatView()
    },             
    initMapControlView : function(){
      var componentId = '#map-control'
      
      if (this.$(componentId).length > 0) {

        this.views.control = this.views.control || new MapControlView({
          el:this.$(componentId),
          model: new MapControlModel({
            labels: this.model.getLabels(),
            columnCollection:this.model.get("columnCollection"),
            active: false
          })              
        });           
      }
    },  
    initMapPlotLatView : function(){
      var componentId = '#map-plot-lat'
      
      if (this.$(componentId).length > 0) {
        var plotColumns = this.model.get("columnCollection").byAttribute("plot")
        this.views.plotLat = this.views.plotLat || new MapPlotLatView({
          el:this.$(componentId),
          model: new MapPlotModel({
            labels: this.model.getLabels(),
            columnCollection: plotColumns,            
            currentRecordCollection:[],
            mouseOverLayerId : "",
            selectedLayerId : "",
            active: false,
            outPlotColumns: _.pluck(plotColumns.models,"id")
          })              
        });           
      }
    },  
    updateMapPlotLatView:function(){
      if (typeof this.model.getCurrentRecords() !== "undefined") {
        var ne = this.model.getMap().getBounds().getNorthEast()//.wrap()
        var sw = this.model.getMap().getBounds().getSouthWest()//.wrap()
        
        this.views.plotLat.model.setCurrentRecords(this.model.getCurrentRecords().byBounds({
          north:ne.lat,
          east:ne.lng,
          south:sw.lat,
          west:sw.lng
        }).models)
      }
    },
    updateOutType:function(){
//      console.log("OutView.updateOutType")
      
      this.$('#map-options button').removeClass('active')
      this.$('#map-options [data-option="'+this.model.getOutType()+'"]').addClass('active')      
      
      switch(this.model.getOutType()){
        case "control":
          this.views.plotLat.model.setActive(false)
          this.views.control.model.setActive()
          this.views.control.model.set({outColorColumn:this.model.getOutColorColumn()})                      
          this.$el.removeClass('full-width')          
          break
        case "plot-lat":
          this.views.control.model.setActive(false)
          this.views.plotLat.model.setActive()          
          this.$el.removeClass('full-width')
          break
        default:
          this.$el.addClass('full-width')
          this.views.control.model.setActive(false)
          this.views.plotLat.model.setActive(false)
          break
      }      
      this.invalidateSize(true)
    },
    updateOutColorColumn:function(){
      if (this.model.getOutType() === 'control') {
        this.views.control.model.set({outColorColumn:this.model.getOutColorColumn()})  
      }
    },
    updateOutPlotColumns:function(){
      this.views.plotLat.model.set({outPlotColumns:
        typeof this.model.getOutPlotColumns() !== "undefined" 
        ? this.model.getOutPlotColumns()
        : _.pluck(this.model.get("columnCollection").byAttribute("plot").models,"id")
      })  
    },
    // map configuration has been read
    configureMap : function(){
//      console.log('MapView.configureMap')

      // set map options
      var config = this.model.getConfig()
      
      // initialise leaflet map
      var _map = L.map(
        config.mapID,
        config.mapOptions
      )
      .on('popupclose', _.bind(this.onPopupClose, this))
      .on('zoomstart', _.bind(this.onZoomStart, this))
      .on('movestart', _.bind(this.onMoveStart, this))
      .on('zoomend', _.bind(this.onZoomEnd, this))
      .on('moveend', _.bind(this.onMoveEnd, this))
      .on("resize",  _.debounce(_.bind(this.resize, this), 500))
           
      var attControl = 
        L.control.attribution({position:'bottomright'})
        .setPrefix('')
        .addAttribution(config.attribution)
      _map.addControl(attControl)

      this.model.setMap(_map)
                             
      this.initLayerGroups()
      
      
      // position map on current view
//      this.updateMapView()
      
//      console.log('MapView.configureMap  mapConfigured')
      this.model.mapConfigured(true)

    },
    initLayerGroups: function (){
//      console.log('MapView.initLayerGroups')
      
      var _map = this.model.getMap()
      var config = this.model.getConfig()
      
      // init layer groups
      var layerGroups = {}
      _.each(config.layerGroups,function(conditions,id){        
        var layerGroup = new L.layerGroup()
        layerGroups[id] = layerGroup
        layerGroup.addTo(_map)        
      })
      this.model.setLayerGroups(layerGroups)
      
      // set default layer group
      _.each(this.model.getLayers().models,function(layerModel){
        layerModel.setLayerGroup(this.model.getLayerGroup("default"))
      },this)      
      // set specific layer groups
      _.each(config.layerGroups,function(conditions,id){        
        if (id !== "default") {
          _.each(this.model.getLayers().where(conditions), function(layerModel){
            layerModel.setLayerGroup(this.model.getLayerGroup(id))
            if (id === "base") {
              layerModel.addToMap()
            }
          },this)
        }
      },this)                 
      
    },
    
   
    updateMapView : function(){
//      console.log('MapView.updateMapView ')      
      var currentView = this.model.getView()
      var _map = this.model.getMap()
      
      
      // check if pre-configured view
      if (currentView !== null && typeof currentView === 'string') {
        currentView = this.model.getConfigView(currentView)
      }

      if ( currentView !== null && typeof currentView !== 'undefined' ) { 
        
        // xyz view
        if ( typeof currentView.center !== 'undefined'
              && typeof currentView.zoom !== 'undefined'
              && typeof currentView.dimensions !== 'undefined' ){

          if (this.model.mapConfigured()){
            var zoomUpdated = this.getZoomForDimensions(currentView)

            // check if change really necessary
            if ( _map.getZoom() !== zoomUpdated
                  || this.roundDegrees(_map.getCenter().lat) !== currentView.center.lat
                  || this.roundDegrees(_map.getCenter().lng) !== currentView.center.lng) {
              _map.setView(currentView.center, zoomUpdated,{animate:true})  

            }
          } else {
            // todo not sure about this one
            this.zoomToDefault()
          }
          
          
        // bounds view
        } else if (typeof currentView.south !== 'undefined'
              && typeof currentView.west !== 'undefined'
              && typeof currentView.north !== 'undefined'
              && typeof currentView.east !== 'undefined') {
          _map.fitBounds(
            [
              [currentView.south,currentView.west],
              [currentView.north,currentView.east]            
            ]
          )
        } else {
          this.zoomToDefault()
        }
      } else {
        this.zoomToDefault()
      }
      this.updateMapPlotLatView()
      this.triggerMapViewUpdated()
      
    },
    zoomToDefault:function(){
      var defaultView = this.model.getDefaultView()
      this.model.getMap().setView(defaultView.center,this.getZoomForDimensions(defaultView),{animate:true})
    },
    
    recordsUpdated:function(){
//      console.log('recordsUpdated')
      this.updateMapPlotLatView()      
    },       







    // event handlers for model change events
    handleActive : function(){
      //console.log('MapView.handleActive')
      if (this.model.isActive()) {
        this.$el.show()
        var that = this
        waitFor(
          function(){
            return that.model.mapConfigured()
          },
          function(){
            that.invalidateSize(false);
          }
        )
      } else {
        this.$el.hide()
      }
    },

    handleViewUpdate : function(){
      //console.log('MapView.handleViewUpdate')
      var that = this
      // wait for config files to be read
      waitFor(
        function(){
          return that.model.mapConfigured()
        },
        function(){
          that.updateMapView()          
        }
      )
    },
    mouseOverLayerUpdated:function(){
      this.updatePopupContent()
      this.views.plotLat.model.set("mouseOverRecordId",this.model.get("mouseOverLayerId"))
    },
    selectedLayerUpdated:function(){
      this.updatePopupContent()
      this.views.plotLat.model.set("selectedRecordId",this.model.get("selectedLayerId"))
    },
    popupLayersUpdated:function(){
//      console.log("MapView.popupLayers")
      var layers = this.model.get("popupLayers")  
      var map = this.model.getMap()
      map.closePopup()      
      if(layers.length > 0){
        var anchorLayer = layers[0]                
        var multiple_tooltip = new L.Rrose({ 
          offset: new L.Point(0,-4), 
          closeButton: false, 
          autoPan: false 
        }).setContent(this.getMultiplesPopupContent())
          .setLatLng(anchorLayer.layer.getLayers()[0].getLatLng())
          .openOn(map)
        this.model.set("multipleTooltip",multiple_tooltip)
      } 
    },    

    updatePopupContent:function(){  
//      console.log("MapView.selectedLayerIdChanged")    
      if(typeof this.model.get("multipleTooltip") !== "undefined"
      && this.model.get("multipleTooltip") !== null){
        this.model.get("multipleTooltip").setContent(this.getMultiplesPopupContent())
      }
    },    
    getMultiplesPopupContent:function(){
      var layers = this.model.get("popupLayers")      
      return _.template(templatePopupMultiple)({
            layers:_.map(layers,function(layer){
              var crgba = layer.color.colorToRgb() 
              return {
                label:layer.label,
                color:layer.color,
                fillColor: 'rgba('+crgba[0]+','+crgba[1]+','+crgba[2]+',0.4)',
                id:layer.id,
                selected:this.model.get("selectedLayerId") === layer.id,
                mouseOver:this.model.get("mouseOverLayerId") === layer.id
              }
            },this)
          })
    },
    
    updateGeoQuery:function(){
      var geoQuery = this.model.get("geoQuery")
      var queryLayer = this.model.get("queryLayer")
      var deleteControl = this.model.get("queryDeleteControl")
      var layerGroup = this.model.getLayerGroups()["default"]
      var _map = this.model.getMap()
      
      // remove layer from map
      if (typeof queryLayer !== "undefined") {
        if (layerGroup.hasLayer(queryLayer)){
          layerGroup.removeLayer(queryLayer)
        }
      }
      if (typeof deleteControl !== "undefined") {
          deleteControl.remove()
      }
      
      // add layer from map if at least one boundary defined
      if (typeof geoQuery !== "undefined") {
        // have at least one undefined
        if (typeof geoQuery.north !== "undefined" 
        || typeof geoQuery.south !== "undefined" 
        || typeof geoQuery.west !== "undefined" 
        || typeof geoQuery.east !== "undefined" ) {
          
          
          queryLayer = L.rectangle(
            L.latLngBounds(
              L.latLng(      
                typeof geoQuery.south !== "undefined" ? parseFloat(geoQuery.south) : -90,
                typeof geoQuery.west !== "undefined" 
                  ? geoQuery.west < 0 
                    ? parseFloat(geoQuery.west) + 360
                    : parseFloat(geoQuery.west)
                  : 0
              ),
              L.latLng(
                typeof geoQuery.north !== "undefined" ? parseFloat(geoQuery.north) : 90,
                typeof geoQuery.east !== "undefined" 
                    ? geoQuery.east < 0 
                      ? parseFloat(geoQuery.east) + 360
                      : parseFloat(geoQuery.east)
                    : 360
              )
            ),
            this.model.getConfig().layerStyles.query
          )
          
          layerGroup.addLayer(queryLayer)
          queryLayer.bringToBack()
          this.model.set("queryLayer",queryLayer)
          
          
          _map.addControl(deleteControl)
          
        }
      }
      
    },
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    // event Handlers for view events
    resize : function (){
      //console.log('MapView.resize')
      this.updateMapView()
    },
    
    layersUpdated : function (){
      var _map = this.model.getMap()
      
      
      
    },
    invalidateSize : function (animate){
      animate = typeof animate !== 'undefined' ? animate : false
      //console.log('MapView.invalidateSize')      
      if (typeof this.model.getMap() !== 'undefined' ) {
        this.model.getMap().invalidateSize(animate)
      }
    },
    
    
    onPopupClose:function(e){            
//      console.log("MapView.onPopupClose")
      this.model.set("multipleTooltip",null)
      this.$el.trigger('mapPopupClosed')  

      
    },
    
    onZoomStart : function(e) {
//      console.log('MapView.onZoomStart')
      // make sure map state really changed
      this.zooming = true

    },
    onMoveStart : function(e) {
      //console.log('MapView.onMoveStart')
      this.moving = true
    },
    onZoomEnd : function(e) {
//      console.log('MapView.onZoomEnd')
      this.zooming = false
      this.triggerMapViewUpdated()

    },
    onMoveEnd : function(e) {
      //console.log('MapView.onMoveEnd')
      this.moving = false
      this.triggerMapViewUpdated()
    },
    
    // event triggers (upstream)
    triggerMapViewUpdated : function() {

      //console.log('MapView.triggerMapViewUpdated ')
      var _map = this.model.getMap()
      // make sure only one event gets broadcasted
      // when map is moved and zoomed at the same time
      if (!this.viewUpdating) {
        var that = this
        this.viewUpdating = true
        waitFor(
          function(){
            return that.model.mapConfigured() && that.model.getView()!== null
          },
          function(){
            that.viewUpdating = false
            var view = that.model.getView()
            if (typeof view !== 'undefined'
              && (view.zoom !== _map.getZoom()
              || view.center.lat !== that.roundDegrees(_map.getCenter().lat)
              || view.center.lng !== that.roundDegrees(_map.getCenter().lng)
              || !_.isEqual(view.dimensions, that.getDimensions()))) {
              that.$el.trigger('mapViewUpdated',{
                view: {
                  zoom : _map.getZoom(),
                  center : {
                    lat:that.roundDegrees(_map.getCenter().lat),
                    lng:that.roundDegrees(_map.getCenter().lng)
                  },
                  dimensions : that.getDimensions()
                }
              })
            }
          }
        )
      }
    },



    queryDeleteClicked:function(e){
      e.preventDefault()
      this.$el.trigger('geoQueryDelete')
    },

    layerSelect:function(e){
      console.log("MapView.layerSelect")

      e.preventDefault()
      this.$el.trigger('mapLayerSelect',{                
        layerId: $(e.currentTarget).attr("data-layerid")
      })
    },
    
    layerMouseOver:function(e){      
      e.preventDefault()
      this.$el.trigger('mapLayerMouseOver',{id:$(e.currentTarget).attr("data-layerid")})      
    },    
    layerMouseOut:function(e){      
      e.preventDefault()
      this.$el.trigger('mapLayerMouseOut',{id:$(e.currentTarget).attr("data-layerid")})      
    },      

    toggleOptionClick:function(e){
      e.preventDefault()
      
      this.$el.trigger('mapOptionToggled',{                
        option: $(e.currentTarget).attr("data-option")
      })      
    },



    onDrawStart : function(e) {
      var map = this.model.getMap()
      map.closePopup()
      $(map.getPane("popupPane")).hide()
      
    },
    onDrawCreated : function(e) {
      var map = this.model.getMap()
      map.closePopup()
      $(map.getPane("popupPane")).show()
      
      this.$el.trigger('geoQuerySubmit',{
        geoQuery: {
          north:this.roundDegrees(e.layer.getBounds().getNorth()),
          south:this.roundDegrees(e.layer.getBounds().getSouth()),
          west:this.roundDegrees(e.layer.getBounds().getWest()),
          east:this.roundDegrees(e.layer.getBounds().getEast())
        }
      })  
      
      map.fitBounds(e.layer.getBounds())
      
      
    },

    handleNavLink : function(e){
      e.preventDefault()
      e.stopPropagation()
      
      var id = $(e.target).data('id')
      var route = $(e.target).data('route')
      var type = $(e.target).data('type')
            
      this.$el.trigger('navLink',{
        target:e.target,
        id:id,
        route:route,
        type:type
      })      
    },





    // UTILS
    getDimensions : function() {
      return [this.$el.innerWidth(),this.$el.innerHeight()]
    },
    // figure out best zoom for dimensions
    getZoomOffset : function(view) {

      var dimActual = this.getDimensions()
      var dim = [view.dimensions[0], view.dimensions[1]]

      var factor = 1
      var offset = 0
      var zoomed = 1

      // if actual dimensions wider > scale height
      if (dimActual[0]/dimActual[1] > dim[0]/dim[1]){
        factor = dimActual[1]/dim[1]
      } else {
        factor = dimActual[0]/dim[0]
      }

      // factor 1 >> no zoom level change for factor 1
      if (factor === 1) {
        return offset

      // factor > 1  >> test higher zoom levels
      } else if (factor > 1) {

        while (zoomed*1.9 < factor) {
          zoomed = zoomed*2
          offset++
        }

      // factor < 1  >> test lower zoom levels
      } else {

        var offset = 0
        var zoomed = 1

        while (zoomed > factor) {
          zoomed = zoomed/2
          offset--
        }
      }
      return offset
    },
    getZoomForDimensions : function(view) {
      var _map = this.model.getMap()
      return Math.max(
        Math.min(
          view.zoom + this.getZoomOffset(view),
          _map.getMaxZoom()
        ),
        _map.getMinZoom()
      )

    },
    setZoomClass : function(){      
      // remove previous zoom class
      this.$el.removeClass (function (index, classes) {
        return (classes.match (/\bzoom-level-\S+/g) || []).join(' ');
      });
      // set new zoom class
      this.$el.addClass('zoom-level-' + this.model.getZoom());
    },
    roundDegrees : function(value){
      //round to 4 decimals
      return Math.round(value * 10000) / 10000
    }



  });

  return MapView;

});
