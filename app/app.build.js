({
  appDir: "../",
  baseUrl: "app",
  dir: "../../build",
  paths: {
    'domReady' : 'libs/domReady',    
    'jquery': 'libs/jquery',
    'jquery.deparam': 'libs/jquery.deparam',
    'jquery.dateformat': 'libs/jquery-dateFormat',    
    'jquery.waitforimages': 'libs/jquery.waitforimages',    
    'showdown': 'libs/showdown', //markdown support
    'underscore': 'libs/underscore', //core
    'backbone': 'libs/backbone', //core
    'bootstrap': 'libs/bootstrap', //carousel
    'leaflet': 'libs/leaflet-src', //gis
    'esri.leaflet' : 'libs/esri-leaflet-src',//gis
    'leaflet.rrose' : 'libs/leaflet.rrose-src',//gis    
    'leaflet.markercluster' : 'libs/leaflet.markercluster',//gis        
    'topojson' : 'libs/topojson',//gis
    'templates': 'templates',//core
    "ga": "//www.google-analytics.com/analytics"    
  },    
  modules: [
    {
      name: "main"
    }
  ],
  optimizeCss: 'standard'
})