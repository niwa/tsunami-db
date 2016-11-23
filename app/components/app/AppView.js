define([
  'jquery','underscore','backbone',
  'domReady!',
  './nav/NavView', './nav/NavModel',
  './map/MapView', './map/MapModel',
  'models/ViewModel',
  'models/LayerCollection',  
  'models/LayerModelGeoJson',
  'models/LayerModelMapboxTiles',
  'models/LayerModelEsriBaselayer',
  'ga',
  'text!./app.html'
], function(
  $, _, Backbone,
  domReady,
  NavView, NavModel,
  MapView, MapModel,
  ViewModel,
  LayerCollection,
  LayerModelGeoJson,
  LayerModelMapboxTiles,
  LayerModelEsriBaselayer,
  ga,
  template
){

  var AppView = Backbone.View.extend({
    el: $("#application"),
    // view events upstream to pass to router if needed ///////////////////////////////////////////////////////
    events : {
      "click .close-item" : "closeItem",
      "click .layer-info-link" : "handleLayerInfoLink",            
      
      // general navigation events
      resetApp : "resetApp",
      homeLink : "homeLink",
      routeLink : "routeLink",
      
      // map view events
      mapViewUpdated: "mapViewUpdated",            
      mapFeatureClick: "mapFeatureClick",
      mapFeatureMouseOver: "mapFeatureMouseOver",
      mapFeatureMouseOut: "mapFeatureMouseOut",      

    }, // end view events


    initialize : function(){
      //console.log('appview.initialize')

      //the layer model types by source
      this.layerModels = {
        geojson:  LayerModelGeoJson,
        mapbox:   LayerModelMapboxTiles,
        esribase: LayerModelEsriBaselayer
      }

      // shortcut
      this.views = this.model.getViews()


      // render app once config is loaded
      var that = this
      waitFor(
        //when
        function(){
          return that.model.appConfigured()          
        },
        //then
        function(){
          
          // render components
          that.render()
          
          // load additional config files
          that.model.loadLayersConfig()
          that.model.loadMapConfig()
          
          waitFor(
            //when
            function(){
              return that.model.layersConfigLoaded()
                  && that.model.mapConfigLoaded()
            },
            //then
            function(){ 
              that.configureLayers() 
            }
          )



        }
      )


      waitFor(
        function(){
          return that.model.mapReady()
        },
        function(){
          console.log('MAP LOADED');
          that.$el.addClass('map-loaded')
        }
      )

      // model change events
      this.listenTo(this.model, "change:route", this.routeChanged);
      
      $(window).on("resize", _.debounce(_.bind(this.resize, this), 100));
      this.checkWindowHeight()
    },
    resize: function(){
      this.checkWindowHeight()
    },    
    
    checkWindowHeight:function(){
      if ($(window).height() < 580){
        this.$el.addClass('window-h-compact')
      } else {
        this.$el.removeClass('window-h-compact')
      }
    },
    
    // render components
    render: function(){
      console.log("AppView.render");
      this.$el.html(_.template(template)({t:this.model.getLabels()}))
      this.update()
    },
    update: function(){
      // set classes
      this.setClass()

      var that = this
      this.model.validateRouter(function(pass){

        if (pass) {

          // init/update components
          that.renderNav()
          that.renderMap()
        }
      })

      return this
    },

    setClass : function(){

    },
   

    renderNav : function(){
      var componentId = '#nav'
      this.views.nav = this.views.nav || new NavView({
        el:this.$(componentId),
        model:new NavModel(),
        labels:this.model.getLabels()        
      });
    },  
    
    
    renderMap : function(){
      var componentId = '#map'
      
      if (this.$(componentId).length > 0) {

        var that = this
        // wait for config files to be read
        waitFor(
          function(){
            return that.model.layersConfigured() && that.model.mapConfigLoaded()
          },
          function(){
            console.log('rendermap')
            that.views.map = that.views.map || new MapView({
              el:that.$(componentId),
              model: new MapModel({
                baseLayers: that.model.getLayers().byBasemap(true), // pass layer collection
                config:     that.model.getMapConfig(),
                labels:     that.model.getLabels()
              })              
            });
            // update map component
            if (that.model.isComponentActive(componentId)) {
              console.log('mapactive')
              that.views.map.model.setActive(true)      
      
              that.views.map.model.setView(that.model.getActiveMapview())
              that.views.map.model.setActiveLayers(that.model.getMapLayers().models) // set active layers
              
              
              
              that.views.map.model.invalidateSize()
              that.$el.removeClass('map-loaded')
              waitFor(
                function(){
                  return that.model.mapReady()
                },
                function(){
                  that.$el.addClass('map-loaded')
                }
              )
            } else {
              that.views.map.model.setActive(false)
            }


          }
        )
      }
    },
     


    configureLayers : function(){      
      
      // read layers
      var layers = this.model.getLayersConfig()

      var collectionOptions = {
        baseurl : this.model.getBaseURL(),
        comparator : 'order',
        mapConfig: this.model.getMapConfig(),
        eventContext : this.$el        
      }

      var layerCollection = new LayerCollection(
        null,
        collectionOptions
      )


      // get types by source
      var sources = _.chain(layers).pluck('source').uniq().value()

      // build collection for all sources
      _.each(sources,function(source){

        layerCollection.add(
          new LayerCollection(
            _.filter(layers,function(layer){
              return layer.source === source
            }),
            _.extend({},collectionOptions,{model: this.layerModels[source]})
          ).models
        )
      },this)
      this.model.setLayers(layerCollection)      
      
      this.model.layersConfigured(true)
    },
    
    
    // VIEW MODEL EVENT: downstream
    routeChanged:function(){
      this.update()
    },
    
    
      
    // SUBVIEW EVENTS

    // general navigation events
    resetApp : function(e,args){
      //console.log('AppView.resetApp')
      this.model.getRouter().resetApp()
    },
    homeLink : function(e,args){
      //console.log('AppView.resetApp')
    
      this.model.getRouter().update({
        link:true,
        route:'explore',
        path:'',
        query:{}
      })
    },
    routeLink : function(e,args){
      // check for route default layers
      // current map layers
      var activeLayers = this.model.getActiveLayerIds()
      // optional layers to be added
      var routeLayers = this.model.getOptionalLayerIdsByRoute(args.id)
      // optional layers already there
      var activeRouteLayers = _.intersection(activeLayers, routeLayers)

      
      this.model.getRouter().update({
        link:true,
        route:args.id,
        path:'',
        query:{
          layers: activeRouteLayers.length !== routeLayers.length 
            ? _.union(activeLayers, routeLayers)  
            : routeLayers
        }        
      })
      
    },

    
    // map view events
    mapViewUpdated : function(e,args){
      //console.log('AppView.mapViewUpdated')

      var viewUpdated = this.model.toMapviewString(args.view)

      if (viewUpdated !== this.model.getActiveMapview(true)) {
        this.model.getRouter().queryUpdate({
            view : viewUpdated
          },
          true, // trigger
          true, // replace
          false // link
        )
      }


    }

    


  });
  return AppView;

});
