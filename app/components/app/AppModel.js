define(["jquery","underscore","backbone"],function(t,e,i){var r=i.Model.extend({initialize:function(e){this.options=e||{},this.set("appConfigLoaded",!1),this.set("configsLoaded",!1),this.set("recordsLoaded",!1),this.set("proxiesLoaded",!1),this.set("referencesLoaded",!1),this.set("recordsConfigured",!1),this.set("recordsUpdated",!1),this.set("pagesConfigured",!1),this.set("referencesConfigured",!1),this.set("proxiesConfigured",!1),this.set("columnsConfigured",!1),this.set("mapConfigured",!1),this.set("lastDBRoute",{route:"db",path:""}),this.set("shareToggled",!1);var i=this;t.ajax({dataType:"json",url:this.attributes.baseurl+this.attributes.configFile,success:function(e){i.setConfig(e),t.ajax({dataType:"json",url:i.attributes.baseurl+i.attributes.config.labels,success:function(t){i.setLabels(t)},error:function(){console.log("error loading terms config")}})},error:function(){console.log("error loading app config")}})},setConfig:function(t){this.set("config",t)},getConfig:function(){return this.attributes.config},setLabels:function(t){this.set("labels",t)},getLabels:function(){return this.attributes.labels},loadConfigs:function(){var e=this;t.when(t.ajax({dataType:"json",url:this.attributes.baseurl+this.attributes.config.layersConfig}),t.ajax({dataType:"json",url:this.attributes.baseurl+this.attributes.config.mapConfig}),t.ajax({dataType:"json",url:this.attributes.baseurl+this.attributes.config.columns}),t.ajax({dataType:"json",url:this.attributes.baseurl+this.attributes.config.columnGroups})).then(function(t,i,r,n){e.set("layersConfig",t[0]),e.set("mapConfig",i[0]),e.set("columnConfig",r[0]),e.set("columnGroupConfig",n[0]),e.set("configsLoaded",!0)},function(){console.log("error loading configs")})},configsLoaded:function(){return this.attributes.configsLoaded},dataReady:function(){return this.get("recordsLoaded")&&this.get("proxiesLoaded")&&this.get("referencesLoaded")},validateRouter:function(t){t(!0)},getViews:function(){return this.attributes.views},getRouter:function(){return this.attributes.router},getBaseURL:function(){return this.attributes.baseurl},setRoute:function(t){return"db"===t.route&&this.set("lastDBRoute",t),this.set("route",{route:t.route,path:t.path,query:t.query}),this},getRoute:function(){return this.attributes.route.route},getPath:function(){return this.attributes.route.path},getLastDBPath:function(){return this.attributes.lastDBRoute.path},getLastDBRoute:function(){return this.attributes.lastDBRoute},getQuery:function(){return e.clone(this.attributes.route.query)},getRecordQuery:function(){var t={};return e.each(this.getQuery(),function(e,i){i.startsWith("q_")&&(t[i.replace("q_","")]=e)}),t},getGeoQuery:function(){var t=this.attributes.columnCollection.get("lat"),e=this.attributes.columnCollection.get("lng"),i=this.getRecordQuery();return{north:i[t.getQueryColumnByType("max")],south:i[t.getQueryColumnByType("min")],east:i[e.getQueryColumnByType("max")],west:i[e.getQueryColumnByType("min")]}},getOutType:function(){return this.attributes.route.query.out},getOutMapType:function(){return this.attributes.route.query.map},getOutColor:function(){return this.attributes.route.query.colorby},getOutPlotColumns:function(){return this.attributes.route.query.plot},getOutTableSortColumn:function(){return this.attributes.route.query.sortcol},getOutTableSortOrder:function(){return this.attributes.route.query.sortorder},appConfigured:function(){return"undefined"!=typeof this.attributes.config&&"undefined"!=typeof this.attributes.labels},isComponentActive:function(t){var e={page:["#page"],db:["#out"]},i={"#record":"db"===this.getRoute()&&""!==this.getPath(),"#filters":"db"===this.getRoute()&&""===this.getPath()};return"undefined"!=typeof e[this.getRoute()]&&e[this.getRoute()].indexOf(t)>=0||"undefined"!=typeof i[t]&&i[t]},setRecordsUpdated:function(){return this.set("recordsUpdated",Date.now())},getRecordsUpdated:function(){return this.attributes.recordsUpdated},getRouteConfig:function(t){return"undefined"!=typeof t?e.findWhere(this.attributes.config.routes,{id:t}):this.getActiveRouteConfig()},getActiveRouteConfig:function(){var t=this.getRoute();return e.contains(e.pluck(this.attributes.config.routes,"id"),t)?e.findWhere(this.attributes.config.routes,{id:t}):""},layersLoading:function(){return"undefined"==typeof this.attributes.layerCollection||this.attributes.layerCollection.isLoading()},layerLoaded:function(t){return this.getLayers().get(t).isLoaded()},layersConfigLoaded:function(){return"undefined"!=typeof this.attributes.layersConfig},layersConfigured:function(t){return"undefined"==typeof t?this.attributes.layersConfigured:void this.set("layersConfigured",t)},getLayersConfig:function(){return this.attributes.layersConfig},getLayers:function(){return this.attributes.layerCollection},setLayers:function(t){return this.set("layerCollection",t),this},getLayer:function(t){return this.getLayers().get(t)},setActiveLayersFromRoute:function(){return this.attributes.layerCollection.setActive(this.getActiveLayerIds()),this},setDefaultLayersFromRoute:function(){return this.attributes.layerCollection.setDefault(this.getLayerIdsByRoute(this.getActiveRouteConfig().id)),this},getActiveLayerIds:function(){var t=this.attributes.route.query,e="undefined"!=typeof t.layers?t.layers:[];return e},getLayerIdsByRoute:function(i){var r="undefined"!=typeof i?this.getRouteConfig(i):this.getActiveRouteConfig(),n=[];return"undefined"==typeof r.layers&&""!==r.layers||(n=t.isArray(r.layers)?r.layers:"string"==typeof r.layers?e.map(r.layers.split(","),function(t){return t.trim()}):[]),n},getOptionalLayerIdsByRoute:function(i){var r="undefined"!=typeof i?this.getRouteConfig(i):this.getActiveRouteConfig(),n=[];return"undefined"==typeof r.layers_optional&&""!==r.layers_optional||(n=t.isArray(r.layers_optional)?r.layers_optional:"string"==typeof r.layers_optional?e.map(r.layers_optional.split(","),function(t){return t.trim()}):[]),n},getMapConfig:function(){return this.attributes.mapConfig},mapReady:function(){return this.appConfigured()&&this.layersConfigured()&&this.mapConfigured()&&!this.layersLoading()},mapConfigured:function(t){return"undefined"==typeof t?this.attributes.mapConfigured:void this.set("mapConfigured",t)},getActiveMapview:function(t){t="undefined"!=typeof t&&t;var e="undefined"!=typeof this.attributes.route.query.view?this.attributes.route.query.view:"default";return t?e:this.toMapviewObject(e)},toMapviewString:function(t){return t.center.lat+"|"+t.center.lng+"|"+t.zoom+"||"+t.dimensions[0]+"|"+t.dimensions[1]},toMapviewObject:function(t){if("undefined"!=typeof t){var e=t.split("||");if(2===e.length){var i=e[0].split("|"),r=e[1].split("|");return 3===i.length&&2===r.length?{center:{lat:parseFloat(i[0]),lng:parseFloat(i[1])},zoom:parseFloat(i[2]),dimensions:[parseFloat(r[0]),parseFloat(r[1])]}:null}return e=t.split("|"),4===e.length?{south:e[0],west:e[1],north:e[2],east:e[3]}:t}return null},getMapviewForRoute:function(t){t="undefined"!=typeof t&&t;var e,i=this.getActiveRouteConfig();switch(i.id){case"explore":e=i.view;break;default:e=this.getActiveMapview(!0)}return t?e:this.toMapviewObject(e)},getRecord:function(t){return this.attributes.recordCollection.get(t)},setRecords:function(t){this.set("recordCollection",t)},getRecords:function(){return this.attributes.recordCollection},getSelectedRecord:function(){return this.getRecord(this.getSelectedRecordId())},getSelectedRecordId:function(){return"db"===this.attributes.route.route&&""!==this.attributes.route.path?parseInt(this.attributes.route.path):""},recordsConfigured:function(t){return"undefined"==typeof t?this.attributes.recordsConfigured:void this.set("recordsConfigured",t)},getProxy:function(t){return this.attributes.proxyCollection.get(t)},setProxies:function(t){this.set("proxyCollection",t)},getProxies:function(){return this.attributes.proxyCollection},proxiesConfigured:function(t){return"undefined"==typeof t?this.attributes.proxiesConfigured:void this.set("proxiesConfigured",t)},getReference:function(t){return this.attributes.referenceCollection.get(t)},setReferences:function(t){this.set("referenceCollection",t)},getReferences:function(){return this.attributes.referenceCollection},referencesConfigured:function(t){return"undefined"==typeof t?this.attributes.referencesConfigured:void this.set("referencesConfigured",t)},columnsConfigured:function(t){return"undefined"==typeof t?this.attributes.columnsConfigured:void this.set("columnsConfigured",t)},getOutColorColumn:function(){return this.attributes.columnCollection.get(this.getOutColor())},setColumns:function(t){this.set("columnCollection",t)},setColumnGroups:function(t){this.set("columnGroupCollection",t)},getColumns:function(){return this.attributes.columnCollection},getColumnGroups:function(){return this.attributes.columnGroupCollection},pagesConfigured:function(t){return"undefined"==typeof t?this.attributes.pagesConfigured:void this.set("pagesConfigured",t)},setPages:function(t){this.set("pages",t)},getPages:function(){return this.attributes.pages},getActivePage:function(){return"page"===this.getRoute()?this.attributes.pages.findWhere({id:this.getPath()}):null},getPageAnchor:function(){return"undefined"!=typeof this.getQuery().anchor?this.getQuery().anchor:""}});return r});