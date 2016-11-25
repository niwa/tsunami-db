define([
  'jquery',  'underscore',  'backbone',
  './map/MapView', './map/MapModel',
  './table/TableView', './table/TableModel',
  'text!./out.html'
], function (
  $, _, Backbone,
  MapView, MapModel,  
  TableView, TableModel,  
  template
) {

  var OutView = Backbone.View.extend({
    events : {
      
    },
    initialize : function () {
      
      // shortcut
      this.views = this.model.getViews()
      
      this.render()
      
      this.listenTo(this.model, "change:mapInit", this.updateMap);
      this.listenTo(this.model, "change:mapView", this.updateMap);      
      this.listenTo(this.model, "change:outType", this.updateOutType);      
      this.listenTo(this.model, "change:recordCollection", this.updateViews);      
    },
    render: function () {
      this.$el.html(_.template(template)({t:this.model.getLabels()}))   
      this.initViews()
      return this
    }, 
    initViews:function(){
      this.initMapView()
      this.initTableView()
    },
    updateViews:function(){
      this.updateMapView()
      this.updateTableView()      
    },
    updateOutType:function(){
      switch(this.model.getOutType()){
        case "map":
          this.views.map.model.setActive()
          this.views.table.model.setActive(false)
          break
        case "table":
          this.views.map.model.setActive(false)
          this.views.table.model.setActive()
          break
      }
    },
    initTableView : function(){
      var componentId = '#table'
      
      if (this.$(componentId).length > 0) {

        this.views.table = this.views.table || new TableView({
          el:this.$(componentId),
          model: new TableModel({
            labels: this.model.getLabels(),
            active: false
          })              
        });        
      }
    },    
    initMapView : function(){
      var componentId = '#map'
      
      if (this.$(componentId).length > 0) {

        this.views.map = this.views.map || new MapView({
          el:this.$(componentId),
          model: new MapModel({
            labels: this.model.getLabels(),
            config:this.model.getMapConfig(),
            active: false
          })              
        });        
      }
    },    
    updateTableView : function(){      
      this.views.table.model.setCurrentRecords(this.model.getRecords()) 
    },
    updateMapView : function(){
      this.views.map.model.setView(this.model.getActiveMapview())
//      this.views.map.model.setCurrentRecords(this.model.getRecords())            
      this.views.map.model.invalidateSize()
    },
//        var that = this
//        // wait for config files to be read
//        waitFor(
//          function(){
//            return that.model.isMapInit()
//          },
//          function(){
//            console.log('rendermap')
//            that.views.map = that.views.map || new MapView({
//              el:that.$(componentId),
//              model: new MapModel({
//                baseLayers: that.model.getLayers().byBasemap(true), // pass layer collection
//                config:     that.model.getMapConfig(),
//                labels:     that.model.getLabels()
//              })              
//            });
//            // update map component
//            if (that.model.isComponentActive(componentId)) {
//              console.log('mapactive')
//              that.views.map.model.setActive(true)      
//      
//              that.views.map.model.setView(that.model.getActiveMapview())
//              that.views.map.model.setActiveLayers(that.model.getMapLayers().models) // set active layers
//              
//              that.views.map.model.invalidateSize()
//
//            } else {
//              that.views.map.model.setActive(false)
//            }
//
//
//          }
//        )
//    },    
  });

  return OutView;
});
