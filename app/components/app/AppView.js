define([
  'jquery','underscore','backbone',
  'domReady!',
  'jquery.deparam',
  './nav/NavView', './nav/NavModel',
  './filters/FiltersView', './filters/FiltersModel',
  './out/OutView', './out/OutModel',
  'models/ViewModel',
  'models/RecordModel',  
  'models/RecordCollection',  
  'models/LayerCollection',  
  'models/LayerModelGeoJson',
  'models/LayerModelMapboxTiles',
  'models/LayerModelEsriBaselayer',
  'ga',
  'text!./app.html'
], function(
  $, _, Backbone,
  domReady,deparam,
  NavView, NavModel,
  FiltersView, FiltersModel,
  OutView, OutModel,
  ViewModel,
  RecordModel,
  RecordCollection,
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
      
      // filter events
      querySubmit : "querySubmit",
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
      
      // load additional config files
      this.model.loadLayersConfig()
      this.model.loadMapConfig()
      
      var that = this
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
      waitFor(
        function(){
          return that.model.layersConfigured() && that.model.mapConfigLoaded()
        },    
        //then
        function(){ 
          that.configureRecords() 
        }        
      )        
    },
    update: function(){
      // set classes
      this.setClass()

      var that = this
      this.model.validateRouter(function(validated){
        if (validated) {
          // init/update components
          that.updateNav()
          that.updateFilters()
          that.updateOut()
        }
      })

      return this
    },

    setClass : function(){

    },
   

    updateNav : function(){
      var componentId = '#nav'
      this.views.nav = this.views.nav || new NavView({
        el:this.$(componentId),
        model:new NavModel({
          labels:this.model.getLabels()             
        })
      });
    },  

    updateFilters : function(){
      var componentId = '#filters'
      if (this.$(componentId).length > 0) {      
        
        // prep attribute query
        var query = {}
        _.each(this.model.getQuery(),function(val,key){
          if (key.startsWith("att_")){
            query[key.replace("att_","")] = val
          }
        })
        
        this.views.filters = this.views.filters || new FiltersView({
          el:this.$(componentId),
          model:new FiltersModel({
            labels:this.model.getLabels(),
            attQuery : $.param(query)
          })
        });            

        this.views.filters.model.set({
          attQuery : $.param(query)
        })
      }
    },  
    updateOut : function(){
      var componentId = '#out'
      if (this.$(componentId).length > 0) {     
        // set records
        var that = this
        waitFor(
          function(){
            return that.model.recordsConfigured()
          },    
          function(){ 
            that.views.out = that.views.out || new OutView({
              el:that.$(componentId),
              model:new OutModel({
                labels:    that.model.getLabels(),
                mapConfig: that.model.getMapConfig()
              })
            })

            that.views.out.model.set({
              recordCollection: that.model.getRecords(), // TODO apply filters
              outType:          that.model.getOutType(),
              mapView:          that.model.getActiveMapview()
            })

          }
        )
      
      }      
    },  
     


    configureLayers : function(){      
      
      // read layers
      var layersConfig = this.model.getLayersConfig()

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
      var sources = _.chain(layersConfig).pluck('source').uniq().value()

      // build collection for all sources
      _.each(sources,function(source){

        layerCollection.add(
          new LayerCollection(
            _.filter(layersConfig,function(layer){
              return layer.source === source
            }),
            _.extend({},collectionOptions,{model: this.layerModels[source]})
          ).models
        )
      },this)
      this.model.setLayers(layerCollection)      
      
      this.model.layersConfigured(true)
    },
    configureRecords : function(){      
      
      var recordsLayer = this.model.getLayer(this.model.attributes.config.recordsLayerId)
      
      
      if (recordsLayer.isRaw()){
        var that = this
        recordsLayer.getMapLayer(function(recordsRaw){
  //        console.log(mapLayer.options.layerModel.id)
          // check raw        
          var records = new RecordCollection([],{config : recordsLayer})
          records.add(
            // reorganise attributes (move properties up)
            _.map(recordsRaw.features,function(feature){
              return _.extend (
                {},
                feature.properties,
                {
                  feature:{
                    geometry:feature.geometry,                    
                    type:feature.type,
                    properties:feature.properties
                  }
                }
              )
            })
          )                    
          that.model.setRecords(records)

          that.model.recordsConfigured(true)
        })
      }
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
          true // replace
        )
      }
      

    },
    
    
    // filter events
    querySubmit : function(e,args){    
      // remove old attr query args
      var query = _.clone(this.model.getQuery())
      _.each(query,function(val,key){
        if (key.startsWith("att_")) {
          delete query[key]
        }
      })
      // add new attr query args
      _.extend(query,$.deparam("att_" + args.value.replace('&','&att_') ))
      this.model.getRouter().queryUpdate(
        query,
        true, // trigger
        true, // replace
        false // extend
      )      
    },

    


  });
  return AppView;

});
