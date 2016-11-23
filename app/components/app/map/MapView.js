define([
  'jquery','underscore','backbone',
  'leaflet',
  'esri.leaflet',
  'text!./mapTemplate.html'
], function(
  $, _, Backbone,
  leaflet,
  esriLeaflet,
  template
){
  var MapView = Backbone.View.extend({
    initialize : function(){
      //console.log('MapView.initialize')

      // set up an empty layer group for all our overlay and basemap layers
      this._controlPointLayerGroup  = new L.layerGroup()
      this._controlLayerGroup = new L.layerGroup()
      this._layerGroup        = new L.layerGroup()
      this._baseLayerGroup    = new L.layerGroup()
      this.viewUpdating       = false      

      this.listenTo(this.model, "change:active",        this.handleActive);
      this.listenTo(this.model, "change:view",          this.handleViewUpdate);

      this.listenTo(this.model, "change:baseLayers",    this.handleBaseLayersUpdate);
      this.listenTo(this.model, "change:addLayers",     this.handleAddLayersUpdate);
      this.listenTo(this.model, "change:removeLayers",  this.handleRemoveLayersUpdate);
      this.listenTo(this.model, "change:keepLayers", this.handleRefreshLayersUpdate);

      this.listenTo(this.model, "change:mapControl",   this.mapControl);
      this.listenTo(this.model, "change:invalidateSize",   this.invalidateSize);

      this.render()

      var that = this
      waitFor(
        function(){ return that.model.mapConfigLoaded() },
        function(){ that.configureMap() }
      )
    },
    render : function(){
      //console.log('MapView.render')
      this.$el.html(_.template(template)({t:tlang}))
      var that = this
      waitFor(
        function(){
          return that.model.mapConfigured()
        },
        function(){
          that.updateBaseLayers()
        }
      )
      return this
    },
    // map configuration has been read
    configureMap : function(){
      //console.log('MapView.configureMap')

      // set map options
      var config = this.model.getConfig()
      this.model.setMapOptions(config.mapOptions)

      // initialise leaflet map
      this._map = L.map(
        config.mapID,
        this.model.getMapOptions()
      )
      .on('zoomstart', _.bind(this.onZoomStart, this))
      .on('movestart', _.bind(this.onMoveStart, this))
      .on('zoomend', _.bind(this.onZoomEnd, this))
      .on('moveend', _.bind(this.onMoveEnd, this))
      .on("resize",  _.debounce(_.bind(this.resize, this), 500))
           
      
      // position map on current view
      this.updateMapView()

      this._zoomControl = L.control.zoom({
        zoomInText:'<span class="icon-dsmw_plus"></span>',
        zoomOutText:'<span class="icon-dsmw_minus"></span>'
      })
      var attControl = 
        L.control.attribution({position:'bottomleft'})
        .setPrefix('')
        .addAttribution(this.model.getConfig().attribution)
      this._map.addControl(attControl)

      // set up an empty layer group for all our overlay and basemap layers
      this._controlPointLayerGroup.addTo(this._map)
      this._controlLayerGroup.addTo(this._map)
      this._layerGroup.addTo(this._map)
      this._baseLayerGroup.addTo(this._map)            

      this.model.setMap(this._map) // HACK
      this.model.mapConfigured(true)

    },
   
    updateMapView : function(){
//      console.log('MapView.updateMapView ')      
      var currentView = this.model.getView()

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
            if ( this._map.getZoom() !== zoomUpdated
                  || this.roundDegrees(this._map.getCenter().lat) !== currentView.center.lat
                  || this.roundDegrees(this._map.getCenter().lng) !== currentView.center.lng) {
              this._map.setView(currentView.center, zoomUpdated,{animate:true})            
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
          this._map.fitBounds(
            [
              [currentView.south,currentView.west],
              [currentView.north,currentView.east]            
            ],{
              paddingBottomRight : $(window).width() >= 769 ? L.point([0,300]) : L.point([0,0]),
              maxZoom:7
            }
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
      this._map.setView(defaultView.center,this.getZoomForDimensions(defaultView),{animate:true})
    },
    updateBaseLayers : function() {
      this._baseLayerGroup.clearLayers()

      var that = this
      this.model.getBaseLayers().each(function(layer){
        layer.getMapLayer(
          function(mapLayer){
            that._baseLayerGroup.addLayer(mapLayer)
          },
          {
            map:that._map
          }
        )
      })
    },
    
    addLayers : function(){
      var layers = this.model.getAddLayers()      
      var that = this
      if (layers.length){
        // add new layers
        _.each(layers,function(layer){
          layer.getMapLayer(
            function(mapLayer){
              
              that._layerGroup.addLayer(mapLayer) 
              
              if (layer.getType() !== "raster") {
                
                // check for controllayer
                if (layer.hasControlLayer() && layer.showControlLayer()){
                  that._controlLayerGroup.addLayer(layer.getControlLayer())
                }
                // check for markerlayer
                if (layer.hasControlPointLayer() && layer.showControlPointLayer()){
                  that._controlPointLayerGroup.addLayer(layer.getControlPointLayer() )
                }

                // fade animate
                if(layer.fadeEnabled()) {
                  that.$('.leaflet-overlay-pane .map-layer-'+layer.id).animate({opacity:1},'fast', 'linear')
                }                
              } 
                                                             
            },
            {
              map:that._map
            }
          )
        })
       
            
        that.model.setAddLayers([])            
        
        that.bringToFront()
      }
    },

    removeLayers : function(){
      var layers = this.model.getRemoveLayers()
      var that = this
      if (layers.length){
        _.each(layers,function(layer){
          //console.log('map.removelayer: ' + layer.id)
          layer.getMapLayer(
            function(mapLayer){
                          
              if(layer.fadeEnabled()) {
                that.$('.leaflet-overlay-pane .map-layer-'+layer.id).animate({opacity:0},'fast', 'linear').promise().done(function(){
                  that._layerGroup.removeLayer(mapLayer)
                })
              } else {
                that._layerGroup.removeLayer(mapLayer)
              }
              if (layer.getType() !== "raster") {            
                if (layer.hasControlLayer()){
                  that._controlLayerGroup.removeLayer(layer.getControlLayer())                
                }
                if (layer.hasControlPointLayer()){
                  if (that._controlPointLayerGroup.hasLayer(layer.getControlPointLayer())){
                    that._controlPointLayerGroup.removeLayer(layer.getControlPointLayer())
                  }                   
                }
              }
            },
            {
              map:that._map
            }
          )          
        },this)
      }
    },
    refreshLayers : function(){
      var layers = this.model.getKeepLayers()
      var that = this
      if (layers.length){
        _.each(layers,function(layer){
          
          if (layer.getType() !== "raster") {            
            if (layer.hasControlPointLayer()){
              if (layer.showControlPointLayer()){
                if (!that._controlPointLayerGroup.hasLayer(layer.getControlPointLayer())){
                  that._controlPointLayerGroup.addLayer(layer.getControlPointLayer())
                }
              } else {
                if (that._controlPointLayerGroup.hasLayer(layer.getControlPointLayer())){
                  that._controlPointLayerGroup.removeLayer(layer.getControlPointLayer())
                }             
              }             
            }
          }

        },this)
      }
    },
    bringToFront : function(){
      // wait for all layers (execpt raster to be loaded before adding to map to keep correct order
      var that = this
      waitFor(
        function(){
          return !that.model.activeLayersLoading()
        },
        function(){                    
          // ensure order
          _.each(that.model.getActiveLayers(),function(layer){
            layer.getMapLayer(
              function(mapLayer){
                if (typeof mapLayer._markerCluster !== 'undefined') {
                  that._layerGroup.removeLayer(mapLayer)
                  that._layerGroup.addLayer(mapLayer) 
                } else {
                  mapLayer.bringToFront()
                }
                if (layer.getType() !== "raster") {            

                  // check for controllayer
                  if (layer.hasControlLayer() && layer.showControlLayer()){
                    layer.getControlLayer().bringToFront()
                  }
                  // check for markerlayer
                  if (layer.hasControlPointLayer() && layer.showControlPointLayer()){
                    layer.getControlPointLayer().bringToFront()
                  }                
                }
              }
            )
          })

        }
      )
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

    handleAddLayersUpdate : function(){
//      console.log('MapView.handleLayersUpdate')
      var that = this
      // wait for config files to be read
      waitFor(
        function(){
          return that.model.mapConfigured()
        },
        function(){
          that.addLayers()
        }
      )
    },
    handleRemoveLayersUpdate : function(){
      //console.log('MapView.handleLayersUpdate')
      var that = this
      // wait for config files to be read
      waitFor(
        function(){
          return that.model.mapConfigured()
        },
        function(){
          that.removeLayers()
        }
      )
    },
    handleRefreshLayersUpdate : function(){
      //console.log('MapView.handleLayersUpdate')
      var that = this
      // wait for config files to be read
      waitFor(
        function(){
          return that.model.mapConfigured()
        },
        function(){
          that.refreshLayers()
        }
      )
    },
    handleBaseLayersUpdate : function(){
      //console.log('MapView.handleBaseLayersUpdate')
      var that = this
      // wait for config files to be read
      waitFor(
        function(){
          return that.model.mapConfigured()
        },
        function(){
          that.updateBaseLayers()
        }
      )
    },
    
    mapControl : function(){
      var that = this
      // wait for config files to be read
      waitFor(
        function(){
          return that.model.mapConfigured()
        },
        function(){
          if (that.model.getMapControl()) {
            
            that.$el.removeClass('control-disabled')
            
            // zoomControl
            if (!that._zoomControl._map) {
              that._zoomControl.addTo(that._map)
            }
            
            // interactions
            that.enableInteractions()
                    
            
          } else {
            
            that.$el.addClass('control-disabled')
            
            // zoomControl
            if (that._zoomControl._map) {
              that._zoomControl.removeFrom(that._map)
            }
            
            // interactions
            that.disableInteractions()
            
          }
        })
    },
    
    enableInteractions:function(){
      // interactions
      this._map.dragging.enable()
      this._map.touchZoom.enable()
      this._map.doubleClickZoom.enable()
      this._map.scrollWheelZoom.enable()
      this._map.boxZoom.enable()
      if (typeof this._map.tap !== 'undefined') {
        this._map.tap.enable()           
      }

    },
    disableInteractions:function(){
      // interactions
      this._map.dragging.disable()
      this._map.touchZoom.disable()
      this._map.doubleClickZoom.disable()
      this._map.scrollWheelZoom.disable()
      this._map.boxZoom.disable()
      if (typeof this._map.tap !== 'undefined') {
        this._map.tap.disable()           
      }

    },

    // event Handlers for view events
    resize : function (){
      //console.log('MapView.resize')
      this.updateMapView()
    },
    invalidateSize : function (animate){
      //console.log('MapView.invalidateSize')
      animate = typeof animate !== 'undefined' ? animate : false
      if (typeof this._map !== 'undefined' ) {
        this._map.invalidateSize(animate)
      }
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
              && (view.zoom !== that._map.getZoom()
              || view.center.lat !== that.roundDegrees(that._map.getCenter().lat)
              || view.center.lng !== that.roundDegrees(that._map.getCenter().lng)
              || !_.isEqual(view.dimensions, that.getDimensions()))) {
              that.$el.trigger('mapViewUpdated',{
                view: {
                  zoom : that._map.getZoom(),
                  center : {
                    lat:that.roundDegrees(that._map.getCenter().lat),
                    lng:that.roundDegrees(that._map.getCenter().lng)
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
      return Math.max(
        Math.min(
          view.zoom + this.getZoomOffset(view),
          this._map.getMaxZoom()
        ),
        this._map.getMinZoom()
      )

    },
    setZoomClass : function(){
      // remove previous zoom class
      this.$el.removeClass (function (index, classes) {
        return (classes.match (/\bzoom-level-\S+/g) || []).join(' ');
      });
      // set new zoom class
//      this.$el.addClass('zoom-level-' + this._map.getZoom());
      this.$el.addClass('zoom-level-' + this.model.getZoom());
    },
    roundDegrees : function(value){
      //round to 4 decimals
      return Math.round(value * 10000) / 10000
    }



  });

  return MapView;

});
