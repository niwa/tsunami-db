define([
  'jquery','underscore','backbone',
  'domReady!',
  'jquery.deparam',
  './nav/NavView', './nav/NavModel',
  './filters/FiltersView', './filters/FiltersModel',
  './record/RecordView', './record/RecordViewModel',
  './out/OutView', './out/OutModel',  
  'models/RecordCollection',  'models/RecordModel',
  'models/ProxyCollection',
  'models/ReferenceCollection',
  'models/ColumnCollection',  
  'models/ColumnGroupCollection',  
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
  RecordView, RecordViewModel,
  OutView, OutModel,
  RecordCollection,RecordModel,
  ProxyCollection,
  ReferenceCollection,
  ColumnCollection,
  ColumnGroupCollection,
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
      
      // record events
      recordClose : "recordClose",
      
      // out view events
      setOutView: "setOutView",
      recordSelect: "recordSelect",
      
      // map view events
      mapViewUpdated: "mapViewUpdated",            
      mapLayerClick: "mapLayerClick",
      mapLayerMouseOver: "mapLayerMouseOver",
      mapLayerMouseOut: "mapLayerMouseOut",     
      
      
      

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
          that.loadReferences() 
          that.loadProxies() 
          that.configureLayers() 
        }
      )      
      waitFor(
        function(){
          return that.model.layersConfigured() && that.model.recordsConfigured()
        },    
        //then
        function(){ 
          that.configureColumns()           
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
          that.updateRecord()
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
            return that.model.columnsConfigured()
          },    
          function(){         
        
            that.views.filters = that.views.filters || new FiltersView({
              el:that.$(componentId),
              model:new FiltersModel({
                labels:that.model.getLabels(),
                recQuery : that.model.getRecordQuery(),
                columnCollection: that.model.get("columnCollection"),
                columnGroupCollection: that.model.get("columnGroupCollection")
              })
            });            
            
            if (that.model.isComponentActive(componentId)) {
              that.views.filters.model.setActive()
              that.views.filters.model.set({               
                recQuery : that.model.getRecordQuery()
              })
            } else {
              that.views.filters.model.setActive(false)
            }

          }
        )                
      }
    },  
    updateRecord : function(){
      var componentId = '#record'
      if (this.$(componentId).length > 0) {      
        
        var that = this
        waitFor(
          function(){
            return that.model.recordsConfigured() 
              && that.model.columnsConfigured()
              && that.model.referencesConfigured()
              && that.model.proxiesConfigured()
          },    
          function(){         
        
            that.views.record = that.views.record || new RecordView({
              el:that.$(componentId),
              model:new RecordViewModel({
                labels:that.model.getLabels(),                
                columnCollection: that.model.get("columnCollection"),
                columnGroupCollection: that.model.get("columnGroupCollection")
              })
            });            
            
            if (that.model.isComponentActive(componentId)) {
              that.views.record.model.setActive()
              that.views.record.model.set({               
                record : that.model.getSelectedRecord()
              })
            } else {
              that.views.record.model.setActive(false)
            }

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
              && that.model.columnsConfigured()
              && that.model.referencesConfigured()
          },    
          function(){ 
            that.views.out = that.views.out || new OutView({
              el:that.$(componentId),
              model:new OutModel({
                labels:    that.model.getLabels(),
                columnCollection: that.model.getColumns(),
                columnGroupCollection: that.model.getColumnGroups(),
                layerCollection: that.model.getLayers(),
                recordCollection: that.model.getRecords(),
                mapConfig: that.model.getMapConfig()
              })
            })
            
            that.model.getRecords().updateActive(that.model.getRecordQuery())
            
            that.views.out.model.set({
              recordsUpdated :  Date.now(),
              outType:          that.model.getOutType(),
              outColorColumn:   that.model.getOutColorColumn(),
              mapView:          that.model.getActiveMapview(),
              recordId :        that.model.getSelectedRecordId()
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
      
      var recordConfig = this.model.get("config").records
      var that = this      
      if (typeof recordConfig !== "undefined") {
        $.ajax({
          dataType: "json",
          url: this.model.getBaseURL() + '/' + recordConfig.path,
          success: function(data) {
            console.log("success loading records data")          
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
      if (typeof recordConfig !== "undefined") {
      
        var that = this
        waitFor(
          function(){
            return that.model.layersConfigured()
          },    
          //then
          function(){      

            var recordCollection = new RecordCollection([],{
              config : recordConfig            
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
                      id:record.id,
                      eventContext : that.$el,
                      isRecordLayer:true
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
      }
    },    
    

    configureColumns:function(){      
      this.model.setColumnGroups(new ColumnGroupCollection(this.model.get("columnGroupConfig")))
      this.model.setColumns(new ColumnCollection(this.model.get("columnConfig")))      
      
      // replace auto values (generate from actual record values where not explicitly set)
      _.each(this.model.get("columnCollection").byColumn('values','auto').byColumn("type","categorical").models,function(columm){        
        var values = this.model.getRecords().getValuesForColumn(columm.get('queryColumn'))
        columm.set("values",{
          "values":values,
          "labels": _.clone(values),
          "hints":[]
        })
      },this)
      
      this.model.getRecords().setColumns(this.model.get("columnCollection"))     
      
      
      this.model.columnsConfigured(true)
    },
    
    
    loadProxies : function(){      
      
      var proxyConfig = this.model.get("config").proxies
      var that = this      
      
      $.ajax({
        dataType: "json",
        url: this.model.getBaseURL() + '/' + proxyConfig.path,
        success: function(data) {
          console.log("success loading proxies data")          
          that.configureProxies(data)            
        },
        error: function(){
            console.log("error loading proxies data")

        }
      });
    },      
    configureProxies : function(proxyData) {
      
      var proxyConfig = this.model.get("config").proxies
      
      var that = this

      that.model.setProxies(new ProxyCollection(
        _.map(proxyData.features,function(feature){
          return _.extend (
            {},
            feature.properties,
            {featureAttributeMap:proxyConfig.featureAttributeMap}
          )    
        }),
        {
          config : proxyConfig            
        }
      ))        
      var that = this
      waitFor(
        function(){
          return that.model.recordsConfigured()
        },    
        //then
        function(){ 
          that.model.getRecords().setProxies(that.model.getProxies()) 
          that.model.proxiesConfigured(true)  
        }        
      )   
          
    },    
    loadReferences : function(){      
      
      var refConfig = this.model.get("config").references
      var that = this      
      
      $.ajax({
        dataType: "json",
        url: this.model.getBaseURL() + '/' + refConfig.path,
        success: function(data) {
          console.log("success loading ref data")          
          that.configureReferences(data)            
        },
        error: function(){
            console.log("error loading ref data")

        }
      });
    },      
    configureReferences : function(refData) {
      
      var refConfig = this.model.get("config").references
      
      var that = this

      that.model.setReferences(new ReferenceCollection(
        _.map(refData.features,function(feature){
          return _.extend (
              {},
              feature.properties,
              {id:feature.id.split('.')[1]},
              {featureAttributeMap:refConfig.featureAttributeMap}
            )
        }),
        {
          config : refConfig            
        }
      ))        
      var that = this
      waitFor(
        function(){
          return that.model.recordsConfigured()
        },    
        //then
        function(){ 
          that.model.getRecords().setReferences(that.model.getReferences())           
          that.model.referencesConfigured(true)   
        }        
      )     

         
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
    recordSelect : function(e,args){
      this.model.getRouter().update({
        route:"record",
        path:args.id        
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
    mapLayerClick : function(e,args){
      // check if location a casestudy
      
      var layerId = args.layerId
      if (layerId !== "") {
        var layer = this.model.getLayers().get(layerId)
        if (layer.get("isRecordLayer")) {
          this.$el.trigger('recordSelect', { id: layerId })                
        }          
      }          
    },
    
    // record events
    recordClose : function(e){    
      this.model.getRouter().update({
        route:"explore",
        path:""        
      })
    
    },
    
    // filter events
    recordQuerySubmit : function(e,args){    
      
      // new query
      var q = {}      
      _.each(args.query,function(val,key){
        q["col_"+key] = val        
      })
      
      // old query
      var query = _.clone(this.model.getQuery())
      _.each(query,function(val,key){
        if (key.startsWith("col_")) {
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
