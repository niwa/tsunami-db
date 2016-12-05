define([
	'jquery', 'underscore', 'backbone'
], function($,_, Backbone
) {

	var AppModel = Backbone.Model.extend({
		initialize : function(options){
			this.options = options || {};

      this.set("appConfigLoaded", false)
      this.set("configsLoaded",false)
      this.set("recordsConfigured",false)
      this.set("attributesConfigured",false)
      
      var that = this
      
           
      /// read global configuration file
      $.ajax({
        dataType:"json",
        url: this.attributes.baseurl + '/' +  this.attributes.configFile,
        success: function(json) {
          console.log("... success loading app config")
          that.setConfig(json)     
          console.log("loading terms")
          $.ajax({
            dataType:"json",
            url: that.attributes.baseurl + '/' +  that.attributes.config.labels,
            success: function(json) {
              console.log("... success loading terms")
              that.setLabels(json)          
            },
            error: function(){
              console.log("error loading terms config")
            }
          })          
        },
        error: function(){
          console.log("error loading app config")
        }
      })
		

			// debug
			//console.log.log('%cVersion: ', systemapic.style, systemapic.version);
		},
    setConfig:function(data) {
      this.set('config',data)
    },
    getConfig:function() {
      return this.attributes.config
    },    
    setLabels:function(data) {
      this.set('labels',data)
    },
    getLabels:function() {
      return this.attributes.labels
    },    
    // config

    loadConfigs : function(){
      var that = this
      $.when(
        $.ajax({
          dataType: "json",
          url: this.attributes.baseurl + '/' + this.attributes.config.layersConfig
        }),
        $.ajax({
          dataType: "json",
          url: this.attributes.baseurl + '/' + this.attributes.config.mapConfig
        }),
        $.ajax({
          dataType: "json",
          url: this.attributes.baseurl + '/' + this.attributes.config.attributes
        }),
        $.ajax({
          dataType: "json",
          url: this.attributes.baseurl + '/' + this.attributes.config.attributeGroups
        })
      ).then(function (layers_json, map_json, att_json, attGroup_json) {                
          //console.log("... success loading layer config")
          that.set("layersConfig",layers_json[0])  
          that.set("mapConfig",map_json[0])
          that.set("attributes",att_json[0])        
          that.set("attributeGroups",attGroup_json[0])       
          that.set("configsLoaded",true)
      }, function(){
        console.log("error loading configs")
      })
    },
    configsLoaded : function(){
      return this.attributes.configsLoaded
    },    
    // ROUTE VALIDATION ===================================================================

    validateRouter : function(callback){
      callback(true)
    },


    getViews:function(){
      return this.attributes.views
    },


    // APP STATE ===================================================================
    getRouter:function(){
      return this.attributes.router
    },
    getBaseURL: function(){
      return this.attributes.baseurl
    },
		setRoute : function(route) {
			// console.log('AppModel.setRoute')
			this.set('route',{
				route : route.route,
				path : route.path,
				query : route.query
			});
			return this;
		},
		getRoute : function (){
			return this.attributes.route.route
		},
		getPath : function (){
			return this.attributes.route.path
		},
		getQuery : function (){
			return this.attributes.route.query
		},
    getRecordQuery:function(){
      // prep attribute query
      var query = {}
      _.each(this.getQuery(),function(val,key){
        if (key.startsWith("att_")){
          query[key.replace("att_","")] = val
        }
      })          
      return query
    },
    getOutType: function(){
      return this.attributes.route.query.out
    },
    
    
		appConfigured : function(){
      return typeof this.attributes.config !== 'undefined' 
          && typeof this.attributes.labels !== 'undefined' 
    },

    isComponentActive : function(componentId) {
      
      // active components by route
      var routeConditions = {        
        explore: [],       
      }
      
      // component conditions
      var componentConditions = {        
      }
      
      return (routeConditions[this.getRoute()].indexOf(componentId) >=0)
          || (typeof componentConditions[componentId] !== 'undefined' && componentConditions[componentId])            
      
    },

    // ROUTECONFIG ===================================================================
    getRouteConfig:function(routeId){
      return typeof routeId !== 'undefined' ? _.findWhere(this.attributes.config.routes,{id:routeId}) : this.getActiveRouteConfig()
    },
    
    getActiveRouteConfig:function(){

      var route = this.getRoute()

      if (_.contains(_.pluck(this.attributes.config.routes,'id'), route)) {
        return _.findWhere(this.attributes.config.routes,{id:route})
      } else {
        return ''
      }

    },





    // LAYERS ===================================================================


    //state
    layersLoading : function(){
      return typeof this.attributes.layerCollection === 'undefined'
        ? true
        : this.attributes.layerCollection.isLoading()      
    },
    layerLoaded : function(layerId){
      return this.getLayers().get(layerId).isLoaded()
    },
    layersConfigLoaded : function(){
      return typeof this.attributes.layersConfig !== 'undefined'
    },
    layersConfigured : function(val){
      if (typeof val !== 'undefined') {
        this.set('layersConfigured',val)
      } else {
        return this.attributes.layersConfigured
      }
    },



    getLayersConfig : function(){
      return this.attributes.layersConfig
    },
    
		getLayers : function() {
			return this.attributes.layerCollection;
		},

		setLayers : function(layers) {
			this.set('layerCollection',layers);
			return this;
		},
    getLayer : function(layerId){
      return this.getLayers().get(layerId)
    },    

    setActiveLayersFromRoute : function() {
			this.attributes.layerCollection.setActive(this.getActiveLayerIds());
			return this;
		},
    setDefaultLayersFromRoute : function() {
			this.attributes.layerCollection.setDefault(this.getLayerIdsByRoute(this.getActiveRouteConfig().id));
			return this;
		},

    // active on map
		getActiveLayerIds : function() {
      
      // active layers from query
			var query = this.attributes.route.query      
      var layers = (typeof query.layers !== 'undefined') ? query.layers : [];

      return layers
		},
        

    getLayerIdsByRoute:function(routeId){
      var routeConfig = typeof routeId !== 'undefined' 
      ? this.getRouteConfig(routeId) 
      : this.getActiveRouteConfig()
      
      var routeLayers = []
      if (typeof routeConfig.layers !== 'undefined' || routeConfig.layers === '') {
        routeLayers = $.isArray(routeConfig.layers) 
          ? routeConfig.layers
          : typeof routeConfig.layers === 'string' 
            ? _.map(routeConfig.layers.split(','),function(layerid){return layerid.trim()})
            : [] 
      }
      
      return routeLayers
    },
    getOptionalLayerIdsByRoute:function(routeId){
      var routeConfig = typeof routeId !== 'undefined' 
      ? this.getRouteConfig(routeId) 
      : this.getActiveRouteConfig()
      
      var routeLayers = []
      if (typeof routeConfig.layers_optional !== 'undefined' || routeConfig.layers_optional === '') {
        routeLayers = $.isArray(routeConfig.layers_optional) 
          ? routeConfig.layers_optional
          : typeof routeConfig.layers_optional === 'string' 
            ? _.map(routeConfig.layers_optional.split(','),function(layerid){return layerid.trim()})
            : [] 
      }
      
      return routeLayers
    },

		
    
    
    
    
    
    

    // MAP ========================================================================


    getMapConfig : function(){
      return this.attributes.mapConfig
    },

    mapReady : function(){
      return this.appConfigured() 
        && this.layersConfigured() 
        && this.mapConfigured() 
        && !this.layersLoading();
    },
    mapConfigured : function() {
      return typeof this.attributes.views.map !== 'undefined' && this.attributes.views.map.model.mapConfigured()
    },

		getActiveMapview : function(raw){
      raw = typeof raw !== 'undefined' ? raw : false
      var view = typeof this.attributes.route.query.view !== 'undefined'
        ? this.attributes.route.query.view
        : 'default'
      return raw ? view : this.toMapviewObject(view)
    },
    toMapviewString : function(view) {
      return view.center.lat 
        + '|'  + view.center.lng 
        + '|'  + view.zoom
        + '||' + view.dimensions[0]
        + '|'  + view.dimensions[1]
    },
    toMapviewObject : function(view){

			if (typeof view !== 'undefined') {
        
        // test XYZ view
				var view_split = view.split('||');

        if (view_split.length === 2) {

          var viewXYZ = view_split[0].split('|');
          var dimensions = view_split[1].split('|');

          if (viewXYZ.length === 3 && dimensions.length === 2) {

            return {
              center : {lat:parseFloat(viewXYZ[0]),lng:parseFloat(viewXYZ[1])},
              zoom : parseFloat(viewXYZ[2]),
              dimensions : [parseFloat(dimensions[0]),parseFloat(dimensions[1])]
            }
          } else {
            return null
          }
        } else {
          // test bounds view
          view_split = view.split('|')
          if (view_split.length === 4) {
            return {
              south: view_split[0],
              west:  view_split[1],
              north: view_split[2],
              east:  view_split[3]
            }
          } else {
            // try predefined view
            return view
          }        

        } 

			} else {
				return null;
			}
		},

    getMapviewForRoute:function(raw){
      raw = typeof raw !== 'undefined' ? raw : false
      var route = this.getActiveRouteConfig()
      var view
      switch (route.id) {
        case 'explore' :
            view = route.view
          break       
        default :
            view = this.getActiveMapview(true) // raw
          break
      }
      return raw ? view : this.toMapviewObject(view)
    },

    // Records ========================================================================
    getRecord: function(recordid){
      return this.attributes.records.findWhere({id:recordid})
    },
    setRecords: function(collection){
      this.set('recordCollection',collection)
    },
    // returns collection
    getRecords : function(){
      return this.attributes.recordCollection
    },
    getActiveRecord:function(){
      return this.getRecord(this.getActiveRecordId())
    },
    getActiveRecordId:function(){
      return (this.attributes.route.route === 'record')
        ? parseInt(this.attributes.route.path)
        : ''
    },
    isActiveRecord:function(){
      return this.attributes.route.route === 'record'        
    },
    recordsConfigured : function(val){
      if (typeof val !== 'undefined') {
        this.set('recordsConfigured',val)
      } else {
        return this.attributes.recordsConfigured
      }
    },    
    
    
    
    
    attributesConfigured : function(val){
      if (typeof val !== 'undefined') {
        this.set('attributesConfigured',val)
      } else {
        return this.attributes.attributesConfigured
      }
    },    
    
    
    
    
    
	});



	return AppModel;

});
