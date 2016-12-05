define([
  'jquery','underscore','backbone',
  'domReady!',
  'jquery.deparam',
  './nav/NavView', './nav/NavModel',
  './filters/FiltersView', './filters/FiltersModel',
  './out/OutView', './out/OutModel',  
  'models/RecordCollection',  'models/RecordModel',
  'models/AttributeCollection',  
  'models/AttributeGroupCollection',  
  'models/LayerCollection',  
  'models/LayerModelGeoJson',
  'models/LayerModelMapboxTiles',
  'models/LayerModelEsriBaselayer',
  'ga',
  'text!./app.html'
], function(
  $, _, Backbone,
  domReady,
  deparam,
  NavView, NavModel,
  FiltersView, FiltersModel,
  OutView, OutModel,
  RecordCollection,RecordModel,
  AttributeCollection,
  AttributeGroupCollection,
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
      recordQuerySubmit : "recordQuerySubmit",
      
      // out view events
      setOutView: "setOutView",
      
      // map view events
      mapViewUpdated: "mapViewUpdated",            
      mapFeatureClick: "mapFeatureClick",
      mapFeatureMouseOver: "mapFeatureMouseOver",
      mapFeatureMouseOut: "mapFeatureMouseOut",      

    }, // end view events


    initialize : function(){
      //console.log('appview.initialize')

      //the layer model types
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
      this.model.loadConfigs()
      var that = this
      waitFor(
        //when
        function(){
          return that.model.configsLoaded()
        },
        //then
        function(){ 
          that.loadRecords() 
          that.configureLayers() 
        }
      )      
      waitFor(
        function(){
          return that.model.layersConfigured() && that.model.recordsConfigured()
        },    
        //then
        function(){ 
          that.configureAttributes()           
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
        
        var that = this
        waitFor(
          function(){
            return that.model.attributesConfigured()
          },    
          function(){         
        
            that.views.filters = that.views.filters || new FiltersView({
              el:that.$(componentId),
              model:new FiltersModel({
                labels:that.model.getLabels(),
                recQuery : that.model.getRecordQuery(),
                attributeCollection: that.model.get("attributeCollection"),
                attributeGroupCollection: that.model.get("attributeGroupCollection")
              })
            });            

            that.views.filters.model.set({
              recQuery : that.model.getRecordQuery()
            })

          }
        )                
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
              && that.model.attributesConfigured()
          },    
          function(){ 
            that.views.out = that.views.out || new OutView({
              el:that.$(componentId),
              model:new OutModel({
                labels:    that.model.getLabels(),
                attributeCollection: that.model.get("attributeCollection"),
                attributeGroupCollection: that.model.get("attributeGroupCollection"),
                layerCollection: that.model.getLayers(),
                recordCollection: that.model.getRecords(),
                mapConfig: that.model.getMapConfig()
              })
            })
            
            that.model.getRecords().updateActive(that.model.getRecordQuery())
            
            that.views.out.model.set({
              recordsUpdated :  Date.now(),
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
        mapConfig: this.model.getMapConfig(),
        eventContext : this.$el        
      }

      var layerCollection = new LayerCollection(
        null,
        collectionOptions
      )


      // get model types 
      var models = _.chain(layersConfig).pluck('model').uniq().value()

      // build collection for all models
      _.each(models,function(model){

        layerCollection.add(
          new LayerCollection(
            _.filter(layersConfig,function(layer){
              return layer.model === model
            }),
            _.extend({},collectionOptions,{model: this.layerModels[model]})
          ).models
        )
      },this)
      this.model.setLayers(layerCollection)      
      
      this.model.layersConfigured(true)
    },
    loadRecords : function(){      
      
      var records = this.model.get("config").records
      var that = this      
      
      if (records.model === "geojson") {
        $.ajax({
          dataType: "json",
          url: this.model.getBaseURL() + '/' + records.path,
          success: function(data) {
            console.log("success loading records layer: " + that.id)          
            that.configureRecords(data)            
          },
          error: function(){
              console.log("error loading records data")

          }
        });
      }      
    },      
    configureRecords : function(recordData) {
      
      var recordConfig = this.model.get("config").records
      
      var that = this
      waitFor(
        function(){
          return that.model.layersConfigured()
        },    
        //then
        function(){      
      
          var recordCollection = new RecordCollection([],{
            config : recordData            
          })
          var record,layer
          _.each(recordData.features,function(feature){
            record = new RecordModel(
              _.extend (
                {},
                feature.properties,
                {featureAttributeMap:recordConfig.featureAttributeMap}
              )
            )
            if (typeof feature.geometry !== "undefined" && feature.geometry !== null) {
              layer = new that.layerModels[recordConfig.model]( 
                _.extend(
                  {},
                  recordConfig.layerOptions,
                  {
                    id:record.id
                  }
                )
              )
              that.model.getLayers().add(layer)
              layer.setData({
                geometry:feature.geometry,                    
                type:feature.type,
                properties:{id:record.id}
              })              
              record.setLayer(layer)
            } else {
              record.setLayer(false) 
            }
            recordCollection.add(record)
          })
          // reorganise attributes (move properties up)
            
          that.model.setRecords(recordCollection)      
          that.model.recordsConfigured(true)
        }
      )
    },    
    

    configureAttributes:function(){      
      this.model.set("attributeGroupCollection",new AttributeGroupCollection(this.model.get("attributeGroups")))
      this.model.set("attributeCollection",new AttributeCollection(this.model.get("attributes")))      
      
      // generate values where not explicitly set
      _.each(this.model.get("attributeCollection").byAttribute('values','auto').byAttribute("type","categorical").models,function(attribute){        
        var values = this.model.getRecords().getValuesForColumn(attribute.get('queryColumn'))
        attribute.set("values",{
          "values":values,
          "labels":values
        })
      },this)
      this.model.getRecords().setAttributes(this.model.get("attributeCollection"))     
      
      // TODO deal with "blanks"
      
      this.model.attributesConfigured(true)
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
    
    
    setOutView : function(e,args){
      this.model.getRouter().queryUpdate({
        out : args.out_view
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
    recordQuerySubmit : function(e,args){    
      
      // new query
      var q = {}      
      _.each(args.query,function(val,key){
        q["att_"+key] = val        
      })
      
      // old query
      var query = _.clone(this.model.getQuery())
      _.each(query,function(val,key){
        if (key.startsWith("att_")) {
          delete query[key]
        }
      })
      
      // add new attr query args
      _.extend(query,q)
      
      this.model.getRouter().queryUpdate(
        query,
        true, // trigger
        false, // replace
        false // extend
      )      
    },

    


  });
  return AppView;

});
