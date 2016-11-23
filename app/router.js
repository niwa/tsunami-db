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
      '!/explore/' : 'explore', // overview > all records
      '!/record' : 'record', // overview > all records
      '!/record/' : 'record', // overview > all records
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
    queryDelete : function(keys, trigger, replace, link){
      //console.log('router.queryDelete')  
      var trigger = typeof trigger !== 'undefined' ? trigger : true
      var replace = typeof replace !== 'undefined' ? replace : false      
      var link = typeof link !== 'undefined' ? link : false      
      
      var query = _.clone(app.model.getQuery())
      if (typeof keys === 'string') {
        delete query[keys]
      } else {
        _.each(keys,function(key){
          delete query[key]
        })
      }
      
      this.update({
        link:link,        
        query:query,
        trigger:trigger,
        replace:replace
      })    
    },
    // update query args
    queryUpdate : function(query, trigger, replace, link){
      //console.log('router.queryUpdate')  
      var trigger = typeof trigger !== 'undefined' ? trigger : true
      var replace = typeof replace !== 'undefined' ? replace : false
      var link = typeof link !== 'undefined' ? link : false      
      var query = _.extend({}, app.model.getQuery(), query)
      this.update({
        link:link,
        query:query,
        trigger:trigger,
        replace:replace
      })      
      return query
    },
    // toggle query args
    queryToggle : function(query, trigger, link){
      //console.log('router.queryToggle')  
      var trigger = typeof trigger !== 'undefined' ? trigger : true
      var link = typeof link !== 'undefined' ? link : false
      
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
          link:link
        })      
      }
      return currentQuery
      
    },
    // update route
    update : function(args){
      var link = typeof args.link !== 'undefined' ? args.link : false
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
    app.Router.on('route:explore', function (query) {
      //console.log('router.home>setRoute ' )
//      if (window.__ga__ && ga.loaded) { ga('send', 'event', 'Route', 'route:home', '')}
      app.model.setRoute({
        route : 'explore',
        path  : '',
        query : query !== null && typeof query !=='undefined' ? $.deparam(query) : {}
      })
      
      if (typeof app.view === 'undefined') {
        app.view = new AppView({model:app.model})
      }  
    })
    // record
    app.Router.on('route:record', function (query) {
      //console.log('router.home>setRoute ' )
//      if (window.__ga__ && ga.loaded) { ga('send', 'event', 'Route', 'route:home', '')}
      app.model.setRoute({
        route : 'record',
        path  : '',
        query : query !== null && typeof query !=='undefined' ? $.deparam(query) : {}
      })
      
      if (typeof app.view === 'undefined') {
        app.view = new AppView({model:app.model})
      }  
    })
           
    

    Backbone.history.start();
  };
  return {
    initialize: initialize
  }
});
