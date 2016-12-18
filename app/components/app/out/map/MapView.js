define([
  'jquery','underscore','backbone',
  'leaflet',
  'esri.leaflet',
  'leaflet.rrose',
  './mapControl/MapControlView', './mapControl/MapControlModel',  
  'text!./map.html',
  'text!./mapPopupMultipeRecords.html',
], function(
  $, _, Backbone,
  leaflet,
  esriLeaflet,
  rrose,
  MapControlView, MapControlModel,    
  template,
  templatePopupMultiple
){
  var MapView = Backbone.View.extend({
    events:{
      "click .layer-select" : "layerSelect"
    },
    initialize : function(){
      console.log('MapView.initialize')
      this.handleActive()  

      // set up an empty layer group for all our overlay and basemap layers
      this.viewUpdating = false      
      this.views = this.model.getViews()

      this.render()
      
      
      this.listenTo(this.model, "change:active",        this.handleActive);
      this.listenTo(this.model, "change:view",          this.handleViewUpdate);
      this.listenTo(this.model, "change:outColorColumn", this.updateOutColorColumn);

      this.listenTo(this.model, "change:invalidateSize",this.invalidateSize);      
      this.listenTo(this.model, "change:layersUpdated",this.layersUpdated);
      this.listenTo(this.model, "change:multipleLayerPopup",this.multipleLayerPopup)
      
      this.listenTo(this.model, "change:selectedLayerId", this.selectedLayerIdChanged);      
      


    },
    render : function(){    
      console.log('MapView.render')      
      this.$el.html(_.template(template)({t:this.model.getLabels()}))
      this.configureMap()
      this.initMapControlView()
      return this
    },
    initMapControlView : function(){
      var componentId = '#map-control'
      
      if (this.$(componentId).length > 0) {

        this.views.control = this.views.control || new MapControlView({
          el:this.$(componentId),
          model: new MapControlModel({
            labels: this.model.getLabels(),
            columnCollection:this.model.get("columnCollection")
          })              
        });           
      }
    },  
    updateOutColorColumn:function(){
      this.views.control.model.set({outColorColumn:this.model.getOutColorColumn()})    
    },
    // map configuration has been read
    configureMap : function(){
      console.log('MapView.configureMap')

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
      this.updateMapView()
      
      console.log('MapView.configureMap  mapConfigured')
      this.model.mapConfigured(true)

    },
    initLayerGroups: function (){
      console.log('MapView.initLayerGroups')
      
      var _map = this.model.getMap()
      var config = this.model.getConfig()
      
      // init layer groups
      var layerGroups = {}
      _.each(config.layerGroups,function(group,id){        
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
      console.log('MapView.updateMapView ')      
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

      this.triggerMapViewUpdated()
      
    },
    zoomToDefault:function(){
      var defaultView = this.model.getDefaultView()
      this.model.getMap().setView(defaultView.center,this.getZoomForDimensions(defaultView),{animate:true})
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


    multipleLayerPopup:function(){
      console.log("MapView.multipleLayerPopup")
      var layers = this.model.get("multipleLayerPopup")
      var map = this.model.getMap()
      map.closePopup()      
      console.log("multipleLayerPopup " +layers.length )
      if(layers.length > 0){
        var anchorLayer = layers[0]                
        var multiple_tooltip = new L.Rrose({ 
          offset: new L.Point(0,0), 
          closeButton: false, 
          autoPan: false 
        }).setContent(this.getMultiplesPopupContent(layers))
          .setLatLng(anchorLayer.layer.getLayers()[0].getLatLng())
          .openOn(map)
        this.model.set("multipleTooltip",multiple_tooltip)
      } 
    },    
    layerSelect:function(e){
      console.log("MapView.layerSelect")
      console.log(this.model.attributes.multipleLayerPopup.length)

      e.preventDefault()
      this.$el.trigger('mapLayerSelect',{                
        layerId: $(e.currentTarget).attr("data-layerid")
      })
    },
    selectedLayerIdChanged:function(){  
      console.log("MapView.selectedLayerIdChanged")    
      var layers = this.model.get("multipleLayerPopup")
      if(typeof this.model.get("multipleTooltip") !== "undefined"
      && this.model.get("multipleTooltip") !== null){
        this.model.get("multipleTooltip").setContent(this.getMultiplesPopupContent(layers))
      }
      
      
      
    },
    getMultiplesPopupContent:function(layers){
      return _.template(templatePopupMultiple)({
            layers:_.map(layers,function(layer){
              var crgba = layer.color.colorToRgb() 
              return {
                label:layer.label,
                color:layer.color,
                fillColor: 'rgba('+crgba[0]+','+crgba[1]+','+crgba[2]+',0.4)',
                id:layer.id,
                selected:this.model.get("selectedLayerId") === layer.id
              }
            },this)
          })
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
      console.log("MapView.onPopupClose")
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
