define([
  'jquery','underscore','backbone',
  'domReady!',
  'jquery.deparam',
  './nav/NavView', './nav/NavModel',
  './filters/FiltersView', './filters/FiltersModel',
  './record/RecordView', './record/RecordViewModel',
  './out/OutView', './out/OutModel',  
  './page/PageView', './page/PageViewModel',  
  'models/PageCollection',  'models/PageModel',
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
  'text!./app.html',
  'text!./app_share.html'
], function(
  $, _, Backbone,
  domReady,
  deparam,
  NavView, NavModel,
  FiltersView, FiltersModel,
  RecordView, RecordViewModel,
  OutView, OutModel,
  PageView, PageViewModel,
  PageCollection, PageModel,
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
  template,
  templateShare
){

  var AppView = Backbone.View.extend({
    el: $("#application"),
    // view events upstream to pass to router if needed ///////////////////////////////////////////////////////
    events : {                
      "click .close-share" : "closeShare",            
      
      // general navigation events
      resetApp : "resetApp",
      homeLink : "homeLink",
      navLink : "navLink",
      
      // own events
      recordsPopup: "recordsPopup",
      
      // filter events
      recordQuerySubmit : "recordQuerySubmit",
      
      // record events
      recordClose : "recordClose",
      
      // out view events
      setOutView: "setOutView",
      recordSelect: "recordSelect",
      recordMouseOver: "recordMouseOver",
      recordMouseOut: "recordMouseOut",
      colorColumnChanged: "colorColumnChanged",
      plotColumnsSelected: "plotColumnsSelected",
      
      // map view events
      mapViewUpdated: "mapViewUpdated",            
      
      mapLayerClick: "mapLayerClick",
      mapLayerMouseOver: "mapLayerMouseOver",
      mapLayerMouseOut: "mapLayerMouseOut",  
      
      pointLayerClick: "pointLayerClick",
      pointLayerMouseOver: "pointLayerMouseOver",
      pointLayerMouseOut: "pointLayerMouseOut",  
      
      mapLayerSelect: "mapLayerSelect",   
      mapPopupClosed:"mapPopupClosed",
      mapOptionToggled:"mapOptionToggled",
      
      geoQuerySubmit:"geoQuerySubmit",
      geoQueryDelete:"geoQueryDelete",
      
      // table view events
      sortRecords:"sortRecords",

      // page view events
      pageClose:"pageClose"
      

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
      this.listenTo(this.model, "change:shareToggled",this.renderShare)
      
      
      
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
        //when
        function(){
          return that.model.columnsConfigured() && that.model.proxiesConfigured()
        },
        //then
        function(){ 
          that.configurePages() 
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
          that.updatePage() 
          
        }
        
      })

      return this
    },

    setClass : function(){

    },
   
   
    updateRecords:function(){
      var that = this      
      waitFor(
        function(){
          return that.model.recordsConfigured() 
            && that.model.columnsConfigured()
        },    
        function(){ 
          that.model.getRecords().updateRecords({
            query:that.model.getRecordQuery(),
            selectedId:that.model.getSelectedRecordId(),
            colorColumn:that.model.getOutColorColumn()
          })
        }
      )  
    },
   
   
   

    updateNav : function(){
      var componentId = '#nav'
        var that = this
        waitFor(
          function(){
            return that.model.configsLoaded()
          },    
          function(){            
            that.views.nav = that.views.nav || new NavView({
              el:that.$(componentId),
              model:new NavModel({
                labels:that.model.getLabels(),
                navItems:that.model.getConfig().navitems,
                route:that.model.getRoute(),
                path:that.model.getPath()
              })
            });
            
            that.views.nav.model.set({
              route:that.model.getRoute(),
              path:that.model.getPath()
            })
          }
        )
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
              && that.model.proxiesConfigured()
              && that.model.referencesConfigured()
          },    
          function(){ 
            
            console.log("updateOut")
            
            that.views.out = that.views.out || new OutView({
              el:that.$(componentId),
              model:new OutModel({
                labels:    that.model.getLabels(),
                columnCollection: that.model.getColumns(),
                columnGroupCollection: that.model.getColumnGroups(),
                layerCollection: that.model.getLayers(),
                recordCollection: that.model.getRecords(),
                mapConfig: that.model.getMapConfig(),
                recordsUpdated:0,
                recordsPopup:[],
                recordMouseOverId :"",
                querySet:false,               
                geoQuery:{},
                paths:{
                  records:that.model.get("config").records.path,
                  proxies:that.model.get("config").proxies.path,
                  references:that.model.get("config").references.path
                }
              })
            })
            if (that.model.isComponentActive(componentId)) {
            
              // update Records
              that.updateRecords()  

//              that.views.out.model.setActive()
              that.views.out.model.set({
                active:           true,
                recordsUpdated :  Date.now(),
                outType:          that.model.getOutType(),
                outMapType:       that.model.getOutMapType(),
                outColorColumn:   that.model.getOutColorColumn(),
                outPlotColumns:   that.model.getOutPlotColumns(),
                mapView:          that.model.getActiveMapview(),
                recordId :        that.model.getSelectedRecordId(),
                geoQuery:         that.model.getGeoQuery(),
                querySet:         Object.keys(that.model.getRecordQuery()).length > 0,
                tableSortColumn:  that.model.getOutTableSortColumn(),
                tableSortOrder:   that.model.getOutTableSortOrder()
              })
            } else {
              that.views.out.model.setActive(false)
            }

          }
        )
      
      }      
    },  
    updatePage : function(){
      var componentId = '#page'
      if (this.$(componentId).length > 0) {     
        // set records
        var that = this
        waitFor(
          function(){
            return that.model.pagesConfigured()
          },    
          function(){ 
            that.views.page = that.views.page || new PageView({
              el:that.$(componentId),
              model:new PageViewModel({
                labels:that.model.getLabels(),
                pages: that.model.getPages()
              })
            })
            if (that.model.isComponentActive(componentId)) {
                          
              that.views.page.model.setActive()
              that.views.page.model.set({
                pageId:that.model.getPath(),      
                anchor:that.model.getPageAnchor()          
              })
            } else {
              that.views.page.model.setActive(false)
              that.views.page.model.set({
                pageId:"",      
                anchor:""
              })              
            }

          }
        )
      
      }      
    },  
     


















    configurePages : function(){      
      var pagesCollection = new PageCollection([],{
          model:PageModel,
          labels:this.model.getLabels(),
          columnCollection: this.model.get("columnCollection"),        
          columnGroupCollection: this.model.get("columnGroupCollection"),
          proxyCollection: this.model.getProxies()
        })
      
      _.each(this.model.getConfig().navitems,function(item){
        if (!(item.type !== "page")) {
          pagesCollection.add(item)
        }
        if (item.type === "group") {
          _.each(item.navitems,function(childItem){
            if (!(childItem.type !== "page")) {
              pagesCollection.add(childItem)
            }
          })
        }
      })
      
      this.model.setPages(pagesCollection)
      this.model.pagesConfigured(true)
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
      console.log("loadRecords")
      
      var recordConfig = this.model.get("config").records
      var that = this      
      if (typeof recordConfig !== "undefined") {
        $.ajax({
          dataType: "jsonp",
          jsonpCallback:"parseRecords",
          cache:true,
          url: recordConfig.path + "&outputFormat=text/javascript&format_options=callback:parseRecords",
          success: function(data) {
            console.log("success loading records data")          
            that.configureRecords(data)            
          },
        error: function(xhr, status, error){
          console.log(status + '; ' + error);
              console.log("error loading records data")

          }
        });
      }
    },      
    configureRecords : function(recordData) {
      console.log("configureRecords")
      
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
                  {id:parseInt(feature.id.split('.')[1])}
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
            console.log("done... configureRecords")
            
          }
        )
      }
    },    
    

    configureColumns:function(){    
      console.log("configureColumns")
      
      // store column groups
      this.model.setColumnGroups(new ColumnGroupCollection(this.model.get("columnGroupConfig")))
      // store and init columns
      this.model.setColumns(new ColumnCollection(
        this.model.get("columnConfig"),{
          records:this.model.getRecords()
        }
      ))
      this.model.get("columnCollection").initializeModels()
      // store columns reference with record collection            
      this.model.getRecords().setColumns(this.model.get("columnCollection"))     
      this.model.columnsConfigured(true)
      console.log("done... configureColumns")
      
    },
    
    
    loadProxies : function(){      
      console.log("loadProxies")
      
      var proxyConfig = this.model.get("config").proxies
      var that = this      
      
      $.ajax({
        dataType: "jsonp",
        jsonpCallback:"parseProxies",
        cache:true,
        url: proxyConfig.path + "&outputFormat=text/javascript&format_options=callback:parseProxies",
        success: function(data) {
          console.log("success loading proxies data")          
          that.configureProxies(data)            
        },
        error: function(xhr, status, error){
          console.log(status + '; ' + error);
          console.log("error loading proxies data")

        }
      });
    },      
    configureProxies : function(proxyData) {
      console.log("configureProxies")
      
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
          console.log("done... configureProxies")
          
          that.model.getRecords().setProxies(that.model.getProxies()) 
          that.model.proxiesConfigured(true)  
        }        
      )   
          
    },    
    loadReferences : function(){      
      console.log("loadReferences")          
      var refConfig = this.model.get("config").references
      var that = this      
      
      $.ajax({
        dataType: "jsonp",
        jsonpCallback:"parseReferences",
        cache:true,
        url: refConfig.path + "&outputFormat=text/javascript&format_options=callback:parseReferences",
        success: function(data) {
          console.log("success loading ref data")          
          that.configureReferences(data)            
        },
        error: function(xhr, status, error){
          console.log(status + '; ' + error);
            console.log("error loading ref data")

        }
      });
    },      
    configureReferences : function(refData) {
      console.log("configureReferences")

      var refConfig = this.model.get("config").references
      
      var that = this

      that.model.setReferences(new ReferenceCollection(
        _.map(refData.features,function(feature){
          return _.extend (
              {},
              feature.properties,
              {id:parseInt(feature.id.split('.')[1])}
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
          console.log("done... configureReferences")
          
          that.model.getRecords().setReferences(that.model.getReferences())           
          that.model.referencesConfigured(true)   
        }        
      )     

         
    },    
    
            
    
    
    
    
    
    
    
    
    
    // VIEW MODEL EVENT: downstream
    routeChanged:function(){
      this.update()
    },
    
    
    renderShare: function(){
      
      var url = window.location.protocol+'//'+window.location.host+'/'
      
      var twitter = "text=" + encodeURIComponent(this.model.getLabels().share.tweet)
      twitter += "&url=" + url        
      twitter += this.model.getLabels().share.twitter_hashtags.trim() !== "" 
        ? "&hashtags=" + this.model.getLabels().share.twitter_hashtags.trim()
        : ""
      twitter += this.model.getLabels().share.twitter_via.trim() !== "" 
        ? "&via=" + this.model.getLabels().share.twitter_via.trim()
        : ""      
      twitter += this.model.getLabels().share.twitter_related.trim() !== "" 
        ? "&related=" + this.model.getLabels().share.twitter_related.trim()
        : ""      
        
      if (this.model.get('shareToggled')) {
        this.$("#share").html(_.template(templateShare)({
          t:this.model.getLabels(),
          url_current:window.location.href,
          url_enc:encodeURIComponent(url),
          twitter:twitter
        }))
        this.$('#share .select-on-click').on('click', this.selectOnClick)
        
      } else {
        this.$("#share").html("")        
      }
    },
    
    selectOnClick: function(e){
      e.preventDefault()
      e.target.focus();
      e.target.select();
      setTimeout(function () {
        e.target.setSelectionRange(0, 9999);
      }, 1);
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
        route:'db',
        path:'',
        query:{}
      })
    },
    navLink : function(e,args){      
      
      if (args.id === "share") {
        this.toggleShare()
      } else {
        // close share
        this.model.set('shareToggled', false)
        
        this.views.nav.model.set({        
          path:this.model.getPath()
        })
        
        this.model.getRouter().update({
          link:true,
          route:args.route,
          path:args.id === "db" 
            ? this.model.getLastDBPath()
            : args.id,        
          query: {
            anchor:typeof args.anchor !== "undefined" ? args.anchor : ""
          },
          extendQuery:true,
        })
      }
      
    },
    
    
    setOutView : function(e,args){
      console.log("setOutView")   
      this.views.out.model.set('recordsPopup',[]) ;  
      
      this.model.getRouter().queryUpdate({
        out : args.out_view
      })      
    },
    recordSelect : function(e,args){     
      console.log("recordSelect")  
      
      if (this.model.getSelectedRecordId() !== parseInt(args.id)){
        this.model.getRouter().update({
          route:"db",
          path:args.id        
        })
      } else {
        args.closeSelected = typeof args.closeSelected !== "undefined" ? args.closeSelected : true
        if (args.closeSelected) {
          this.$el.trigger('recordClose')                        
        }
      }      
    },    
    
    recordsPopup:function(e,args){
      console.log("recordsPopup ")  

      this.views.out.model.set('recordsPopup',[]);   
      this.views.out.model.set('recordsPopup',args.records);   // models not collection
    },
    
    colorColumnChanged : function(e,args){
      console.log("colorColumnChanged")    
      
      this.views.out.model.set('recordsPopup',[]) ; 
      
      this.model.getRouter().queryUpdate({
        colorby:args.column
      })      
    },    
    plotColumnsSelected : function(e,args){
      console.log("plotColumnsSelected")    
            
      this.model.getRouter().queryUpdate({
        plot:args.columns
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
      console.log("mapLayerClick")  
    },
    pointLayerClick : function(e,args){
      // check if location a casestudy
      console.log("pointLayerClick")
      var layerId = args.layerId
      
      if (layerId !== "") {        
        // for now only handle record layer clicks
        if (this.model.getLayers().get(layerId).get("isRecordLayer")) {          
          //detect other records
          var recordsOverlapping = this.model.getRecords().byXY(args.x,args.y)
                    
          this.$el.trigger('recordsPopup', { 
            records: recordsOverlapping.models
          });            
          this.$el.trigger('recordSelect', { 
            id: layerId,
            closeSelected: true//recordsOverlapping.length === 1 // only if single record
          })                
          
        }          
      }          
    },
    recordMouseOver : function(e,args){
      // check if location a casestudy
      console.log("recordMouseOver")
      var recordId = args.id
      
      if (recordId !== "") {                
        var record = this.model.getRecords().get(recordId)
          
        this.$el.trigger('recordsPopup', { 
          records: [record] 
        }); 

        this.views.out.model.set("recordMouseOverId",recordId) ; 
        record.setMouseOver()     
      }          
    },
    recordMouseOut : function(e,args){
      // check if location a casestudy
      console.log("recordMouseOver")
      var recordId = args.id
      
      if (recordId !== "") {                
        var record = this.model.getRecords().get(recordId)
          
        this.$el.trigger('recordsPopup', { 
          records: [] 
        }); 
            
        this.views.out.model.set("recordMouseOverId","") ; 
        record.setMouseOver(false)     

      }          
    },
    pointLayerMouseOver : function(e,args){
      // check if location a casestudy
      console.log("pointLayerMouseOver")
      var layerId = args.layerId
      
      if (layerId !== "") {        
        // for now only handle record layer clicks
        if (this.model.getLayers().get(layerId).get("isRecordLayer")) { 
          
          if (this.pointLayerMouseOverLayerId !== layerId) {
            this.pointLayerMouseOverLayerId = layerId
            //detect other records            
            this.$el.trigger('recordsPopup', { 
              records: this.model.getRecords().byActive().byXY(args.x,args.y).models
            }); 
            
          }  
          var record = this.model.getRecords().get(args.layerId)
          this.views.out.model.set("recordMouseOverId",record.id) ; 
          record.setMouseOver()     
        }          
      }          
    },
    pointLayerMouseOut : function(e,args){
      // check if location a casestudy
      this.pointLayerMouseOverLayerId = null
      console.log("pointLayerMouseOut")

      var record = this.model.getRecords().get(args.layerId)
      this.views.out.model.set("recordMouseOverId","") ; 
      record.setMouseOver(false)          
       
    },
    mapLayerMouseOver : function(e,args){
      // check if location a casestudy
      console.log("mapLayerMouseOver")
      var layerId = args.id
      
      if (layerId !== "") {        
        // for now only handle record layer clicks
        if (this.model.getLayers().get(layerId).get("isRecordLayer")) { 
          
          var record = this.model.getRecords().get(args.id)
          this.views.out.model.set("recordMouseOverId",record.id) ; 
          record.setMouseOver()     
        }          
      }          
    },
    mapLayerMouseOut : function(e,args){
      // check if location a casestudy
      console.log("mapLayerMouseOut")

      var record = this.model.getRecords().get(args.id)
      this.views.out.model.set("recordMouseOverId","") ; 
      record.setMouseOver(false)          
       
    },
    mapLayerSelect : function(e,args){
      // check if location a casestudy
      console.log("mapLayerSelect")  
      var layerId = args.layerId
      
      if (layerId !== "") {        
        // for now only handle record layer clicks
        
        if (this.model.getLayers().get(layerId).get("isRecordLayer")) {          
          this.$el.trigger('recordSelect', { 
            id: parseInt(layerId),
            closeSelected: true          
          })          
        }          
      }          
    },
    mapPopupClosed:function(){
//      console.log("mapPopupClosed")  
      
    },
    
    
    mapOptionToggled:function(e,args){
      this.model.getRouter().queryUpdate(
        {
          map:this.model.getOutMapType() !== args.option ? args.option : 'none'
        },
        true, // trigger
        false, // replace
        true // extend
      )         
    },
    
    // record events
    recordClose : function(e){    
      this.model.getRouter().update({
        route:"db",
        path:""        
      })
    
    },
    
    // filter events
    recordQuerySubmit : function(e,args){    
      console.log("recordQuerySubmit")    
      
      this.views.out.model.set('recordsPopup',[]) ; 

      // new query
      var q = {}      
      _.each(args.query,function(val,key){
        q["q_"+key] = val        
      })
      
      // old query
      var query = _.clone(this.model.getQuery())
      _.each(query,function(val,key){
        if (key.startsWith("q_")) {
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
    geoQueryDelete:function(e){
      console.log("geoQueryDelete")    
      
      var latColumn = this.model.getColumns().get("lat")
      var lngColumn = this.model.getColumns().get("lng")      
      this.model.getRouter().queryDelete([
        "q_"+latColumn.getQueryColumnByType("max"),
        "q_"+latColumn.getQueryColumnByType("min"),
        "q_"+lngColumn.getQueryColumnByType("max"),
        "q_"+lngColumn.getQueryColumnByType("min"),
      ])
    },
    geoQuerySubmit:function(e,args){
      console.log("geoQuerySubmit")    
      
      var latColumn = this.model.getColumns().get("lat")
      var lngColumn = this.model.getColumns().get("lng")      
      
      // new query
      var query = {}
      
      query["q_"+latColumn.getQueryColumnByType("max")] = args.geoQuery.north.toString()
      query["q_"+latColumn.getQueryColumnByType("min")] = args.geoQuery.south.toString()
      query["q_"+lngColumn.getQueryColumnByType("max")] = args.geoQuery.east.toString()
      query["q_"+lngColumn.getQueryColumnByType("min")] = args.geoQuery.west.toString()
      
      
      this.model.getRouter().queryUpdate(
        query,
        true, // trigger
        false, // replace
        true // extend
      )           
    },
    
    // map events
    sortRecords : function(e,args){    
      this.model.getRouter().queryUpdate({
          sortcol : args.column,
          sortorder : args.order.toString()
        },
        true, // trigger
        true // replace
      )      
    },
  
    // page events
    pageClose : function(e){    
      this.model.getRouter().update(
        this.model.getLastDBRoute()
      )
    
    },
    toggleShare: function(){
      this.model.set('shareToggled', !this.model.get('shareToggled'))
      this.views.nav.model.set({        
        path:this.model.get('shareToggled') ? 'share' : this.model.getPath()
      })      
    },
    closeShare: function(e){
      e.preventDefault()
      this.model.set('shareToggled', false)
      this.views.nav.model.set({        
        path:this.model.getPath()
      })            
    },    


  });
  return AppView;

});
