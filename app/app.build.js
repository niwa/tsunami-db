({
  appDir: "../",
  baseUrl: "app",
  dir: "../../build",
  paths: {
    'domReady' : 'libs/domReady',    
    'jquery': 'libs/jquery-1.11.2',
    'jquery.deparam': 'libs/jquery.deparam',
    'jquery.select2': 'libs/select2',        
    'underscore': 'libs/underscore', //core
    'backbone': 'libs/backbone', //core
    'bootstrap': 'libs/bootstrap', //carousel
    'leaflet': 'libs/leaflet-src', //gis
    'esri.leaflet' : 'libs/esri-leaflet-src',//gis
    'leaflet.rrose' : 'libs/leaflet.rrose-src',//tooltip    
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