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
      '' : 'root', // root
      '/' : 'root', // root
      '!' : 'root', // 
      '!/' : 'root', // 
      '!/explore' : 'explore', // overview > all records
      '!/explore/*path' : 'explore', // overview > all records            

    },
    resetApp : function(){
      //console.log('router.resetApp')             
      this.navigate('',{trigger:true})
      
    },
    goHome : function(){
      //console.log('router.goHome')               
      this.navigate( '!/explore',{trigger:true, replace: true} )       
      
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
  //   - att_[query]: attribute query, eg "att_elevation_below=100"
  //   "out=map" only
  //   - view: map view, "lat|lon|zoom||dimx|dimy"   
  //   - out_color: primary visualisation attribute used for marker colors
  //   - out_size: secondary visualisation attribute used for marker size
  //   - plot: show latitude plot, one of 0,1
  //   - plot_elevation: plot elevation, one of 0,1
  //   - plot_landward_limit: plot landward limit, one of 0,1
  //   "out=table" only
  //   - sort: attribute to sort by
  //   - sort_dir: sort direction
  //   - x_table: attributes expanded, one of 0,1   
  //   /explore only:
  //   - x_[group]: attribute group expanded, one of 0,1
  
  
  
  var initialize = function(args){          
    app.Router = new AppRouter;
    
    var configFile = args.config_file
    
    var url = window.location.pathname
    var sourcePath = url.replace(/\/$/, "").replace(/^\//, "").split('/')    
    
    var route, path
    route  = sourcePath[0]
    path  = sourcePath.length > 1 ? sourcePath[1] : ''
    
    // start app
    app.model = app.model || new AppModel({
      views : {},
      configFile : configFile,
      baseurl : window.location.origin,
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
        this.navigate( '!/explore',{trigger:true, replace: true} )    
    })
    
    // explore
    app.Router.on('route:explore', function (path,query) {
      console.log('router.explore' )
      console.log('--- path ' + path )
      console.log('--- query ' + query )
//      if (window.__ga__ && ga.loaded) { ga('send', 'event', 'Route', 'route:home', '')}

      // set default path if not set
      if (typeof path === "undefined" || path === null || path === '') {
        this.navigate( '!/explore/filters',{trigger:true, replace: true} )
      } else {
        query = query !== null && typeof query !=='undefined' ? $.deparam(query) : {}
        // set default output option if not set
        if (typeof query.out === "undefined" || query.out === null || query.out === "") {
          this.update({
            route:"explore",
            path:path,
            query : {
              out:"table"
            },
            extendQuery:true,
            trigger:true,
            replace:true
          }
          )
        } else {
        
          app.model.setRoute({
            route : 'explore',
            path  : path,
            query : query
          })

          if (typeof app.view === 'undefined') {
            app.view = new AppView({model:app.model})
          }
        }
      }  
    })
           
    

    Backbone.history.start();
  };
  return {
    initialize: initialize
  }
});
