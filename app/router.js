define([
  'jquery',
  'underscore',
  'backbone',
  'jquery.deparam',
  'components/app/AppView',
  'components/app/AppModel',
  'ga'
], function($, _, Backbone, deparam, AppView, AppModel,ga) {

  var app = {};


  // The Application router ////////////////////////////////////////////////////
  var AppRouter = Backbone.Router.extend({
    routes: {
      // Default
      '(/)' : 'root', // root            
      '!(/)' : 'root', // 
      '!/page(/*path)' : 'page', // page    '
      '!/db(/*path)' : 'db', // db > all or single record

    },
    resetApp : function(){
      //console.log('router.resetApp')             
      this.navigate('',{trigger:true})
      
    },
    goHome : function(){
      //console.log('router.goHome')               
      this.navigate( '!/db',{trigger:true, replace: true} )       
      
    },
    goToFragment : function(fragment) {
      this.navigate(fragment,{trigger:true})
    },
    // delete illegal query args
    queryAllow : function(allowed){
      //console.log('router.queryAllow')              
      this.queryDelete(
        _.difference(_.keys(app.model.getQuery()),allowed),
        true,
        true                          
      )           
    },
    // delete query args
    queryDelete : function(keys, trigger, replace){
      //console.log('router.queryDelete')  
      trigger = typeof trigger !== 'undefined' ? trigger : true
      replace = typeof replace !== 'undefined' ? replace : false      
      
      var query = _.clone(app.model.getQuery())
      if (typeof keys === 'string') {
        delete query[keys]
      } else {
        _.each(keys,function(key){
          delete query[key]
        })
      }
      
      this.update({
        query:query,
        trigger:trigger,
        replace:replace
      })    
    },
    // update query args
    queryUpdate : function(query, trigger, replace, extend){
      //console.log('router.queryUpdate')  
      trigger = typeof trigger !== 'undefined' ? trigger : true
      replace = typeof replace !== 'undefined' ? replace : false
      extend = typeof extend !== 'undefined' ? extend : true
      
      query = extend
          ? _.extend({}, app.model.getQuery(), query )
          : query 
      this.update({
        query:query,
        trigger:trigger,
        replace:replace
      })      
      return query
    },
    // toggle query args
    queryToggle : function(query, trigger){
      //console.log('router.queryToggle')  
      trigger = typeof trigger !== 'undefined' ? trigger : true
      
      var currentQuery = _.clone(app.model.getQuery())
      
      if (typeof query === 'object') {
        _.each(query,function(value,key){
          if(_.contains(_.keys(currentQuery),key) && currentQuery[key] === value) {
            delete currentQuery [key]
          } else {
            currentQuery[key] = value
          }
        },this)
      } else {
        if(_.contains(_.keys(currentQuery),query)) {
          delete currentQuery [query]
        } else {
          currentQuery[query] = 'true'
        }
      }
      
      if (trigger) {
        this.update({
          query:currentQuery,      
        })      
      }
      return currentQuery
      
    },
    // update route
    update : function(args){
      var trigger = typeof args.trigger !== 'undefined' ? args.trigger : true
      var replace = typeof args.replace !== 'undefined' ? args.replace : false
      var extendQuery = typeof args.extendQuery !== 'undefined' ? args.extendQuery : false
      
      var route = typeof args.route !== 'undefined' ? args.route : app.model.getRoute()
      route = route !== '' ? ('/' + route) : ''
      
      var path  = typeof args.path !== 'undefined' ? args.path : (app.model.getPath() !== '' ? app.model.getPath() : '')
      path = path !== '' ? ('/' + path) : ''
      
      var query = typeof args.query !== 'undefined' 
        ? extendQuery 
          ? _.extend({}, app.model.getQuery(), args.query )
          : args.query 
        : app.model.getQuery()
      
      //remove empty args
      _.each(_.clone(query),function(value,key){
        if (!value.length || (value.length === 1 && value[0] === '') || value === '^^^@]') {
          delete query[key]
        }
      })      
      // get query string
      query = $.param(query)
      query = query !== '' ? ('?' + query) : ''
      
      //console.log('router.update: ' + '!' + route+path+query + ' // replace: ' + replace)  
           
      this.navigate(
        '!' + route + path + query,
        {trigger: trigger, replace: replace}
      )
            
    },
    goBack : function(){
      window.history.back()
    }
  })


  // Routes ////////////////////////////////////////////////////
  //
  // query args
  // 
  //   - out: type of output view, one of "map", "table"
  //   - q_[query]: column query, eg "q_elevation_below=100"
  //   "out=map" only
  //   - view: map view, "lat|lon|zoom||dimx|dimy"   
  //   - colorby: primary visualisation column used for marker colors
  //   - plot: show latitude plot, one of 0,1
  //   - plot_elevation: plot elevation, one of 0,1
  //   - plot_landward_limit: plot landward limit, one of 0,1
  //   "out=table" only
  //   - sort: column to sort by
  //   - sort_dir: sort direction
 
  
  
  var initialize = function(args){          
    app.Router = new AppRouter;
    
    var configFile = args.config_file
    
    var url = window.location.pathname
    var sourcePath = url.replace(/\/$/, "").replace(/^\//, "").split('/')    
    
    var route, path
    route  = sourcePath[0]
    path  = sourcePath.length > 1 ? sourcePath[1] : ''
    
    if (typeof window.location.origin === 'undefined') {
      window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
    }
    
    // start app
    app.model = app.model || new AppModel({
      views : {},
      configFile : configFile,
      baseurl : window.location.origin + window.location.pathname,
      router: app.Router,
      route:{
        route:'',  
        path :'',
        query:{},  
      }
    }) 
    
    
    
    // define route handlers
    app.Router.on('route:root', function () {
      //console.log('router.root')             
        
        //console.log('start application on root')        
        this.navigate( '!/db',{trigger:true, replace: true} )    
    })
    
    // record
    app.Router.on('route:db', function (recordid,query) {
      console.log('router.db' )      
      console.log('--- recordid ' + recordid )
      console.log('--- query ' + query )
//      if (window.__ga__ && ga.loaded) { ga('send', 'event', 'Route', 'route:home', '')}

      // set default path (filters) if not set
        recordid = recordid !== null && typeof recordid !=='undefined' ? recordid : ""
        query = query !== null && typeof query !=='undefined' ? $.deparam(query) : {}
        // set default output options if not set
        if (typeof query.out === "undefined" || query.out === null || query.out === ""
          || typeof query.map === "undefined" || query.map === null || query.map === "" 
          || typeof query.colorby === "undefined" || query.colorby === null || query.colorby === "" ) {
          if (typeof query.out === "undefined" || query.out === null || query.out === ""){
            _.extend(query,{out:"map"})
          }
          if (typeof query.map === "undefined" || query.map === null || query.map === ""){
            _.extend(query,{map:"control"})
          }
          if (typeof query.colorby === "undefined" || query.colorby === null || query.colorby === ""){
            _.extend(query,{colorby:"validity"})
          }
          this.update({
            route:"db",
            path:recordid,
            query : query,
            extendQuery:false,
            trigger:true,
            replace:true
          }
          )          
        } else {
        
          app.model.setRoute({
            route : 'db',
            path  : recordid,
            query : query
          })

          if (typeof app.view === 'undefined') {
            app.view = new AppView({model:app.model})
          }
        }
    })
    // page
    app.Router.on('route:page', function (pageid,query) {
      console.log('router.page' )      
      console.log('--- pageid ' + pageid )
      console.log('--- query ' + query )
//      if (window.__ga__ && ga.loaded) { ga('send', 'event', 'Route', 'route:home', '')}

      // set default path (filters) if not set
        pageid = pageid !== null && typeof pageid !=='undefined' ? pageid : ""
        query = query !== null && typeof query !=='undefined' ? $.deparam(query) : {}
        // set default output options if not set
        if (pageid === "") {
          this.update({
            route:"db",
            path:"",
            query : query,
            extendQuery:true,
            trigger:true,
            replace:true
          }
          )          
        } else {
        
          app.model.setRoute({
            route : 'page',
            path  : pageid,
            query : query
          })

          if (typeof app.view === 'undefined') {
            app.view = new AppView({model:app.model})
          }
        }
    })
           
    

    Backbone.history.start();
  };
  return {
    initialize: initialize
  }
});
