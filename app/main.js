window.GoogleAnalyticsObject = "__ga__";
window.__ga__ = {
    q: [["create", "XXX", "auto"]],
    l: Date.now()
};


require.config({
  waitSeconds : 30,
  paths: {
    'domReady' : 'libs/domReady',        
    'jquery': 'libs/jquery-1.11.2',
    'jquery.deparam': 'libs/jquery.deparam',    
    'jquery.select2': 'libs/select2',    
    'underscore': 'libs/underscore', //core
    'backbone': 'libs/backbone', //core
    'bootstrap': 'libs/bootstrap',
    'leaflet': 'libs/leaflet-src', //gis
    'esri.leaflet' : 'libs/esri-leaflet-src',//gis
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
