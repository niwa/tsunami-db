window.GoogleAnalyticsObject = "__ga__";
window.__ga__ = {
    q: [["create", "UA-96898658-1", "auto"]],
    l: Date.now()
};


require.config({
  waitSeconds : 30,
  paths: {
    'domReady' : 'libs/domReady',        
    'jquery': 'libs/jquery-1.12',
    'jquery.deparam': 'libs/jquery.deparam',    
    'jquery.select2': 'libs/select2',    
    'jquery.xml2json': 'libs/jquery.xml2json',   
    'jquery.waypoints': 'libs/jquery.waypoints',   
    'nouislider': 'libs/nouislider',  
    'showdown': 'libs/showdown', //markdown support    
    'underscore': 'libs/underscore', //core
    'backbone': 'libs/backbone', //core
    'bootstrap': 'libs/bootstrap',
    'leaflet': 'libs/leaflet-src', //gis
    'esri.leaflet' : 'libs/esri-leaflet-src',//gis
    'leaflet.rrose' : 'libs/leaflet.rrose-src',//tooltip
    'leaflet.draw' : 'libs/leaflet.draw-src',//draw    
    'templates': 'templates',//core
    "ga": "libs/ga"  
  },
  shim: {
    'bootstrap': {
      deps: ['jquery']
    },
    'jquery.deparam': {
      deps: ['jquery']
    },
    'jquery.select2': {
      deps: ['jquery']
    },
    'jquery.waypoints': {
      deps: ['jquery']
    },
    'jquery.xml2json': {
      deps: ['jquery']
    },
    'leaflet.rrose': {
      deps: ['leaflet']
    },    
    'leaflet.draw': {
      deps: ['leaflet']
    },    
    'esri.leaflet': {
      deps: ['leaflet']
    },    
    'leaflet': {
      exports: 'L'
    },
    "ga": {
      exports: "__ga__"
    }  
  }
});

require([
  'app',
  'ga'
], function(App, ga){
  if (window.__ga__ && ga.loaded) { ga("send", "pageview") }
  App.initialize();
});
