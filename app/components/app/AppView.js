define(["jquery","underscore","backbone","domReady!","jquery.deparam","./nav/NavView","./nav/NavModel","./filters/FiltersView","./filters/FiltersModel","./record/RecordView","./record/RecordViewModel","./out/OutView","./out/OutModel","./page/PageView","./page/PageViewModel","models/PageCollection","models/PageModel","models/RecordCollection","models/RecordModel","models/ProxyCollection","models/ReferenceCollection","models/ColumnCollection","models/ColumnGroupCollection","models/LayerCollection","models/LayerModelGeoJson","models/LayerModelMapboxTiles","models/LayerModelEsriBaselayer","ga","text!./app.html","text!./app_share.html"],function(e,o,t,r,i,l,d,s,n,a,u,c,m,g,p,h,f,y,v,C,w,R,L,O,b,M,x,P,S,_){var T=t.View.extend({el:e("#application"),events:{"click .close-share":"closeShare",resetApp:"resetApp",homeLink:"homeLink",navLink:"navLink",recordsPopup:"recordsPopup",recordQuerySubmit:"recordQuerySubmit",recordClose:"recordClose",setOutView:"setOutView",recordSelect:"recordSelect",recordMouseOver:"recordMouseOver",recordMouseOut:"recordMouseOut",colorColumnChanged:"colorColumnChanged",plotColumnsSelected:"plotColumnsSelected",mapConfigured:"mapConfigured",mapViewUpdated:"mapViewUpdated",mapLayerMouseOver:"mapLayerMouseOver",mapLayerMouseOut:"mapLayerMouseOut",pointLayerClick:"pointLayerClick",pointLayerMouseOver:"pointLayerMouseOver",pointLayerMouseOut:"pointLayerMouseOut",mapLayerSelect:"mapLayerSelect",mapPopupClosed:"mapPopupClosed",mapOptionToggled:"mapOptionToggled",geoQuerySubmit:"geoQuerySubmit",geoQueryDelete:"geoQueryDelete",sortRecords:"sortRecords",pageClose:"pageClose"},initialize:function(){this.layerModels={geojson:b,mapbox:M,esribase:x},this.views=this.model.getViews();var e=this;waitFor(function(){return e.model.appConfigured()},function(){e.render()}),waitFor(function(){return e.model.mapReady()},function(){e.$el.removeClass("map-loading")}),waitFor(function(){return e.model.dataReady()},function(){e.$el.removeClass("loading")}),this.listenTo(this.model,"change:route",this.routeChanged),this.listenTo(this.model,"change:shareToggled",this.renderShare)},render:function(){this.$el.html(o.template(S)({t:this.model.getLabels()})),this.update(),this.model.loadConfigs();var e=this;waitFor(function(){return e.model.configsLoaded()},function(){e.loadRecords(),e.loadReferences(),e.loadProxies(),e.configureLayers()}),waitFor(function(){return e.model.columnsConfigured()&&e.model.proxiesConfigured()},function(){e.configurePages()}),waitFor(function(){return e.model.layersConfigured()&&e.model.recordsConfigured()},function(){e.configureColumns()})},update:function(){var e=this;return this.model.validateRouter(function(o){o&&(e.$el.addClass("updating"),e.updateNav(),e.updateFilters(),e.updateRecord(),e.updateOut(),e.updatePage(),e.$el.removeClass("updating"))}),this},updateRecordCollection:function(){var e=this;waitFor(function(){return e.model.recordsConfigured()&&e.model.columnsConfigured()},function(){var t=e.model.getRecords().query,r=e.model.getRecordQuery();e.model.getRecords().updateRecords({query:r,selectedId:e.model.getSelectedRecordId(),colorColumn:e.model.getOutColorColumn()}),e.model.getRecords().moveRecordToFront(),e.model.getRecordsUpdated()&&o.isEqual(t,r)||(window.__ga__&&P.loaded&&P("send","event","Filter",JSON.stringify(r),""),e.model.setRecordsUpdated())})},updateNav:function(){var e="#nav",o=this;waitFor(function(){return o.model.configsLoaded()},function(){o.views.nav=o.views.nav||new l({el:o.$(e),model:new d({labels:o.model.getLabels(),navItems:o.model.getConfig().navitems,route:o.model.getRoute(),path:o.model.getPath()})}),o.views.nav.model.set({route:o.model.getRoute(),path:o.model.getPath()})})},updateFilters:function(){var e="#filters";if(this.$(e).length>0){var o=this;waitFor(function(){return o.model.columnsConfigured()},function(){o.views.filters=o.views.filters||new s({el:o.$(e),model:new n({labels:o.model.getLabels(),recQuery:o.model.getRecordQuery(),columnCollection:o.model.get("columnCollection"),columnGroupCollection:o.model.get("columnGroupCollection")})}),o.model.isComponentActive(e)?(o.views.filters.model.setActive(),o.views.filters.model.set({recQuery:o.model.getRecordQuery()})):o.views.filters.model.setActive(!1)})}},updateRecord:function(){var e="#record";if(this.$(e).length>0){var o=this;waitFor(function(){return o.model.recordsConfigured()&&o.model.columnsConfigured()&&o.model.referencesConfigured()&&o.model.proxiesConfigured()},function(){o.views.record=o.views.record||new a({el:o.$(e),model:new u({labels:o.model.getLabels(),columnCollection:o.model.get("columnCollection"),columnGroupCollection:o.model.get("columnGroupCollection")})}),o.model.isComponentActive(e)?(o.views.record.model.setActive(),o.views.record.model.set({record:o.model.getSelectedRecord()})):o.views.record.model.setActive(!1)})}},updateOut:function(){var e="#out";if(this.$(e).length>0){var o=this;waitFor(function(){return o.model.recordsConfigured()&&o.model.columnsConfigured()&&o.model.proxiesConfigured()&&o.model.referencesConfigured()},function(){o.views.out=o.views.out||new c({el:o.$(e),model:new m({labels:o.model.getLabels(),columnCollection:o.model.getColumns(),columnGroupCollection:o.model.getColumnGroups(),layerCollection:o.model.getLayers(),recordCollection:o.model.getRecords(),mapConfig:o.model.getMapConfig(),recordsUpdated:o.model.getRecordsUpdated(),recordsPopup:[],recordMouseOverId:"",queryLength:0,geoQuery:{},paths:{records:o.model.get("config").records.path,proxies:o.model.get("config").proxies.path,references:o.model.get("config").references.path}})}),o.model.isComponentActive(e)?("map"!==o.model.getOutType()||o.model.mapReady()||(o.$el.addClass("map-loading"),waitFor(function(){return o.model.mapReady()},function(){o.$el.removeClass("map-loading")})),o.views.out.model.set({active:!0,outType:o.model.getOutType(),mapView:o.model.getActiveMapview()}),o.updateRecordCollection(),o.views.out.model.set({outMapType:o.model.getOutMapType(),queryLength:Object.keys(o.model.getRecordQuery()).length,geoQuery:o.model.getGeoQuery(),recordsUpdated:o.model.getRecordsUpdated(),recordId:o.model.getSelectedRecordId(),outColorColumn:o.model.getOutColorColumn(),outPlotColumns:o.model.getOutPlotColumns(),tableSortColumn:o.model.getOutTableSortColumn(),tableSortOrder:o.model.getOutTableSortOrder()})):o.views.out.model.setActive(!1)})}},updatePage:function(){var e="#page";if(this.$(e).length>0){var o=this;waitFor(function(){return o.model.pagesConfigured()},function(){o.views.page=o.views.page||new g({el:o.$(e),model:new p({labels:o.model.getLabels(),pages:o.model.getPages()})}),o.model.isComponentActive(e)?(o.views.page.model.setActive(),o.views.page.model.set({pageId:o.model.getPath(),anchor:o.model.getPageAnchor()})):(o.views.page.model.setActive(!1),o.views.page.model.set({pageId:"",anchor:""}))})}},configurePages:function(){var e=new h([],{model:f,labels:this.model.getLabels(),columnCollection:this.model.get("columnCollection"),columnGroupCollection:this.model.get("columnGroupCollection"),proxyCollection:this.model.getProxies()});o.each(this.model.getConfig().navitems,function(t){"page"===t.type&&e.add(t),"group"===t.type&&o.each(t.navitems,function(o){"page"===o.type&&e.add(o)})}),this.model.setPages(e),this.model.pagesConfigured(!0)},configureLayers:function(){var e=this.model.getLayersConfig(),t={baseurl:this.model.getBaseURL(),mapConfig:this.model.getMapConfig(),eventContext:this.$el},r=new O(null,t),i=o.chain(e).pluck("model").uniq().value();o.each(i,function(i){r.add(new O(o.filter(e,function(e){return e.model===i}),o.extend({},t,{model:this.layerModels[i]})).models)},this),this.model.setLayers(r),this.model.layersConfigured(!0)},loadRecords:function(){var o=this.model.get("config").records,t=this;"undefined"!=typeof o&&e.ajax({dataType:"jsonp",jsonpCallback:"parseRecords",cache:!0,url:o.path+"&outputFormat=text/javascript&format_options=callback:parseRecords",success:function(e){t.model.set("recordsLoaded",!0),t.configureRecords(e)},error:function(e,o,t){console.log(o+"; "+t),console.log("error loading records data")}})},configureRecords:function(e){var t=this.model.get("config").records;if("undefined"!=typeof t){var r=this;waitFor(function(){return r.model.layersConfigured()},function(){var i,l,d=new y([],{config:t});o.each(e.features,function(e){i=new v(o.extend({},e.properties,{id:parseInt(e.id.split(".")[1])})),"undefined"!=typeof e.geometry&&null!==e.geometry?(l=new r.layerModels[t.model](o.extend({},t.layerOptions,{id:i.id,eventContext:r.$el,isRecordLayer:!0})),r.model.getLayers().add(l),l.setData({geometry:e.geometry,type:e.type,properties:{id:i.id}}),i.setLayer(l)):i.setLayer(!1),d.add(i)}),r.model.setRecords(d),r.model.recordsConfigured(!0)})}},configureColumns:function(){this.model.setColumnGroups(new L(this.model.get("columnGroupConfig"))),this.model.setColumns(new R(this.model.get("columnConfig"),{records:this.model.getRecords()})),this.model.get("columnCollection").initializeModels(),this.model.getRecords().setColumns(this.model.get("columnCollection")),this.model.columnsConfigured(!0)},loadProxies:function(){var o=this.model.get("config").proxies,t=this;e.ajax({dataType:"jsonp",jsonpCallback:"parseProxies",cache:!0,url:o.path+"&outputFormat=text/javascript&format_options=callback:parseProxies",success:function(e){t.model.set("proxiesLoaded",!0),t.configureProxies(e)},error:function(e,o,t){console.log(o+"; "+t),console.log("error loading proxies data")}})},configureProxies:function(e){var t=this.model.get("config").proxies,r=this;r.model.setProxies(new C(o.map(e.features,function(e){return o.extend({},e.properties,{featureAttributeMap:t.featureAttributeMap})}),{config:t}));var r=this;waitFor(function(){return r.model.recordsConfigured()},function(){r.model.getRecords().setProxies(r.model.getProxies()),r.model.proxiesConfigured(!0)})},loadReferences:function(){var o=this.model.get("config").references,t=this;e.ajax({dataType:"jsonp",jsonpCallback:"parseReferences",cache:!0,url:o.path+"&outputFormat=text/javascript&format_options=callback:parseReferences",success:function(e){t.model.set("referencesLoaded",!0),t.configureReferences(e)},error:function(e,o,t){console.log(o+"; "+t),console.log("error loading ref data")}})},configureReferences:function(e){var t=this.model.get("config").references,r=this;r.model.setReferences(new w(o.map(e.features,function(e){return o.extend({},e.properties,{id:parseInt(e.id.split(".")[1])})}),{config:t}));var r=this;waitFor(function(){return r.model.recordsConfigured()},function(){r.model.getRecords().setReferences(r.model.getReferences()),r.model.referencesConfigured(!0)})},routeChanged:function(){this.update()},renderShare:function(){var e=window.location.protocol+"//"+window.location.host+"/"+window.location.pathname,t="text="+encodeURIComponent(this.model.getLabels().share.tweet);t+="&url="+e,t+=""!==this.model.getLabels().share.twitter_hashtags.trim()?"&hashtags="+this.model.getLabels().share.twitter_hashtags.trim():"",t+=""!==this.model.getLabels().share.twitter_via.trim()?"&via="+this.model.getLabels().share.twitter_via.trim():"",t+=""!==this.model.getLabels().share.twitter_related.trim()?"&related="+this.model.getLabels().share.twitter_related.trim():"",this.model.get("shareToggled")?(this.$("#share").html(o.template(_)({t:this.model.getLabels(),url_current:window.location.href,url_enc:encodeURIComponent(e),twitter:t})),this.$("#share .select-on-click").on("click",this.selectOnClick)):this.$("#share").html("")},selectOnClick:function(e){e.preventDefault(),e.target.focus(),e.target.select(),setTimeout(function(){e.target.setSelectionRange(0,9999)},1)},resetApp:function(e,o){this.model.getRouter().resetApp()},homeLink:function(e,o){this.model.getRouter().update({link:!0,route:"db",path:"",query:{}})},navLink:function(e,o){"share"===o.id?this.toggleShare():(this.model.set("shareToggled",!1),this.views.nav.model.set({path:this.model.getPath()}),this.model.getRouter().update({link:!0,route:o.route,path:"db"===o.id?this.model.getLastDBPath():o.id,query:{anchor:"undefined"!=typeof o.anchor?o.anchor:""},extendQuery:!0}))},setOutView:function(e,o){this.views.out.model.set("recordsPopup",[]),window.__ga__&&P.loaded&&P("send","event","View",o.out_view,""),this.model.getRouter().queryUpdate({out:o.out_view})},recordSelect:function(e,o){this.model.getSelectedRecordId()!==parseInt(o.id)?this.model.getRouter().update({route:"db",path:o.id}):(o.closeSelected="undefined"==typeof o.closeSelected||o.closeSelected,o.closeSelected&&this.$el.trigger("recordClose"))},recordsPopup:function(e,o){console.log("recordsPopup ",o.records),this.views.out.model.set("recordsPopup",o.records||[])},colorColumnChanged:function(e,o){this.views.out.model.set("recordsPopup",[]),this.model.getRouter().queryUpdate({colorby:o.column})},plotColumnsSelected:function(e,o){this.model.getRouter().queryUpdate({plot:o.columns})},mapConfigured:function(e,o){this.model.mapConfigured(!0)},mapViewUpdated:function(e,o){var t=this.model.toMapviewString(o.view);t!==this.model.getActiveMapview(!0)&&this.model.getRouter().queryUpdate({view:t},!0,!0)},pointLayerClick:function(e,o){var t=o.id;if(""!==t&&this.model.getLayers().get(t).get("isRecordLayer")){var r=this.model.getRecords().byXY(o.x,o.y);this.$el.trigger("recordsPopup",{records:r.models}),this.$el.trigger("recordSelect",{id:t,closeSelected:!0})}},mapLayerSelect:function(e,o){var t=o.id;""!==t&&this.model.getLayers().get(t).get("isRecordLayer")&&this.$el.trigger("recordSelect",{id:parseInt(t),closeSelected:!0})},recordHighlightOn:function(e,o){o="undefined"!=typeof o&&o;var t=this.model.getRecords().highlightRecord(e);"undefined"!=typeof t&&(this.views.out.model.set("recordMouseOverId",t.id),o&&this.$el.trigger("recordsPopup",{records:[t]}))},recordHighlightOff:function(){this.model.getRecords().highlightReset(),this.views.out.model.set("recordMouseOverId","")},recordMouseOver:function(e,o){""!==o.id&&this.recordHighlightOn(o.id,!0)},pointLayerMouseOver:function(e,o){var t=o.id;if(""!==t&&this.model.getLayers().get(t).get("isRecordLayer")){this.recordHighlightOn(t);var r=this.model.getRecords().byActive().byXY(o.x,o.y).models;this.$el.trigger("recordsPopup",{records:[]}),this.$el.trigger("recordsPopup",{records:r})}},mapLayerMouseOver:function(e,o){var t=o.id;""!==t&&this.model.getLayers().get(t).get("isRecordLayer")&&this.recordHighlightOn(t)},recordMouseOut:function(e,o){this.recordHighlightOff(),this.$el.trigger("recordsPopup",{records:[]})},pointLayerMouseOut:function(e,o){},mapLayerMouseOut:function(e,o){var t=o.id;""!==t&&this.model.getLayers().get(t).get("isRecordLayer")&&this.views.out.model.set("recordMouseOverId","")},mapPopupClosed:function(){this.recordHighlightOff()},mapOptionToggled:function(e,o){window.__ga__&&P.loaded&&P("send","event","Map option",this.model.getOutMapType()!==o.option?o.option:"none",""),this.model.getRouter().queryUpdate({map:this.model.getOutMapType()!==o.option?o.option:"none"},!0,!1,!0)},recordClose:function(e){this.model.getRouter().update({route:"db",path:""})},recordQuerySubmit:function(e,t){this.views.out.model.set("recordsPopup",[]);var r={};o.each(t.query,function(e,o){r["q_"+o]=e});var i=o.clone(this.model.getQuery());o.each(i,function(e,o){o.startsWith("q_")&&delete i[o]}),o.extend(i,r),this.model.getRouter().queryUpdate(i,!0,!1,!1)},geoQueryDelete:function(e){var o=this.model.getColumns().get("lat"),t=this.model.getColumns().get("lng");this.model.getRouter().queryDelete(["q_"+o.getQueryColumnByType("max"),"q_"+o.getQueryColumnByType("min"),"q_"+t.getQueryColumnByType("max"),"q_"+t.getQueryColumnByType("min")])},geoQuerySubmit:function(e,o){var t=this.model.getColumns().get("lat"),r=this.model.getColumns().get("lng"),i={};i["q_"+t.getQueryColumnByType("max")]=o.geoQuery.north.toString(),i["q_"+t.getQueryColumnByType("min")]=o.geoQuery.south.toString(),i["q_"+r.getQueryColumnByType("max")]=o.geoQuery.east.toString(),i["q_"+r.getQueryColumnByType("min")]=o.geoQuery.west.toString(),this.model.getRouter().queryUpdate(i,!0,!1,!0)},sortRecords:function(e,o){this.model.getRouter().queryUpdate({sortcol:o.column,sortorder:o.order.toString()},!0,!0)},pageClose:function(e){this.model.getRouter().update(this.model.getLastDBRoute())},toggleShare:function(){this.model.get("shareToggled")||window.__ga__&&P.loaded&&P("send","event","Modal","share",""),this.model.set("shareToggled",!this.model.get("shareToggled")),this.views.nav.model.set({path:this.model.get("shareToggled")?"share":this.model.getPath()})},closeShare:function(e){e.preventDefault(),this.model.set("shareToggled",!1),this.views.nav.model.set({path:this.model.getPath()})}});return T});