define([
  'jquery',  'underscore',  'backbone',
  'bootstrap',
  'jquery.waypoints',
  'text!./record.html',
  'text!./recordMenu.html',
  'text!./recordColumnText.html',
  'text!./recordColumnProxies.html',
  'text!./recordColumnReferences.html',
], function (
  $, _, Backbone,
  bootstrap,
  waypoints,
  template,
  templateRecordMenu,
  templateColumnText,
  templateColumnProxies,
  templateColumnReferences
) {

  var RecordView = Backbone.View.extend({
    events : {
      "click .close-record" : "closeRecord",
      "click .nav-link" : "handleNavLink",
      "click .record-top-menu-link": "handleInViewLink"
    },
    initialize : function () {
      this.render()
      this.listenTo(this.model, "change:active", this.handleActive);         
      this.listenTo(this.model, "change:record", this.update);       
      
      this.scroll_offset_group = 40
      this.waypoints_offset_group = 200
      this._scrolling = false      
      $(window).on('resize', _.debounce(_.bind(this.resize, this), 200))
      
    },
    render: function () {
      return this
    },
    resize: function () {
      if (typeof this.model !== 'undefined'){
        if (this.model.isActive()){
          this.refreshWaypoints()
        }
      }

    },    
    renderTopMenu: function() {
      return _.template(templateRecordMenu)({        
        groups:_.filter(this.model.get("columnGroupCollection").models, function(group) {return group.id !== "id"})
      })      
    },
    
    update: function () {
          
      var columnCollection = this.model.get("columnCollection").byAttribute("single")      
      this.$el.html(_.template(template)({
        t:this.model.getLabels(),
        recordid: this.model.get("record").id,
        recordMenu: this.renderTopMenu(),
        columnGroups:_.filter(
          _.map(this.model.get("columnGroupCollection").models,function(group){
            // group classes
            var classes = "group-" + group.id
            console.log(group)
            var columnsByGroup = columnCollection.byGroup(group.id).models 

            if (columnsByGroup.length === 0 || group.id === "id") {
              return false
            } else {          
              return {
                title:group.get("title"),
                hint:group.get("hint"),
                id:group.id,                
                classes: classes,
                groupColumns: _.filter(
                  _.map(columnsByGroup,function(column){
                    return this.getColumnHtml(column, group.id)                              
                  },this),
                  function(html){
                    return html !== false
                  }     
                )
              }          
            }          
          },this),
          function(group){
            return group !== false
          }
        )
      }))
      
      this.initTooltips()     
      this.initWaypoints()      
      
    },    
    initWaypoints: function () {
      var that = this
      this.$('.record-top-menu-link').removeClass('active')
      // Chapter scrolls into view from bottom
      this.$('.group').waypoint({
        handler: function (direction) {
          if (!that._scrolling && that.model.isActive()) {
            var index = $(this.element).data('index')
            if (direction === 'down') {
              that.groupActive(index)
            } else {         
              var $prev = index > 0
                ? $('.group[data-index="' + (parseInt(index) - 1).toString() + '"]')
                : $(this.element)
              if ($prev.length !== 0) {
                that.groupActive($prev.data('index'))
              }              
            }
          }
        },
        context: this.$('.record-main'),
        offset: this.waypoints_offset_group,
        continuous: true        
      })           
    },
    groupActive: function (groupIndex) {      
      this.$('.record-top-menu-link').removeClass('active')
      this.$('.record-top-menu-link[data-index="' + groupIndex + '"]').addClass('active')
    },    
    refreshWaypoints: function () {
      window.Waypoint.refreshAll()
    },
    initTooltips:function(){
      this.$('[data-toggle="tooltip"]').tooltip()
    },    
    getColumnHtml:function(column){      
      
      var record = this.model.get("record")
      switch (column.get("type")){
        case "index":
          if (column.id === 'references') {              
            return _.template(templateColumnReferences)({
              t:this.model.getLabels(),              
              title:column.get("title"),            
              references:record.getReferences(),
              id:column.id,
              tooltip:column.get("description"),
              tooltip_more:column.hasMoreDescription(),
              hint:column.get("hint")                  
            })
          } else if (column.id === 'proxies') {              
            return _.template(templateColumnProxies)({
              t:this.model.getLabels(),
              title:column.get("title"),            
              proxies:record.getProxies(),
              id:column.id,
              tooltip:column.get("description"),
              tooltip_more:column.hasMoreDescription(),
              hint:column.get("hint")                  
            })
          }  
                       
          break
        case "date" :
          if(column.get('combo') === 1) {
            if (column.get('filterable') === 1) {
              var combo_column = this.model.get("columnCollection").get(column.get('comboColumnId'))
              var value = ""
              if(column.get('comboType') === "min") {
                value = record.getColumnValue(combo_column.get("column"),true)
                  + " - " 
                  + record.getColumnValue(column.get("column"),true)      
                
              } else {
                value = record.getColumnValue(column.get("column"),true)
                  + " - " 
                  + record.getColumnValue(combo_column.get("column"),true)          
              }
              
              return _.template(templateColumnText)({
                t:this.model.getLabels(),                
                title:column.get("comboTitle"),            
                value:value,
                id:column.id,
                tooltip:column.get("comboDescription"),
                tooltip_more:column.hasMoreDescription(),
                hint:column.get("hint")                
              })                 
            } else {
              return ""
            }
          }
          break
        case "quantitative":
        case "spatial":                                      
        case "categorical":
        case "ordinal":
        case "text":
          return _.template(templateColumnText)({
            t:this.model.getLabels(),
            title:column.get("title"),            
            value:record.getColumnValue(column.get("column"),true),
            id:column.id,
            tooltip:column.get("description"),
            tooltip_more:column.hasMoreDescription(),
            hint:column.get("hint")
          })          
          
          break
        default:
          return false
      }    
    },
    
    
    handleActive : function(){
      if (this.model.isActive()) {
        this.$el.show()        
      } else {
        this.$el.hide()
      }
    },
    
    
    
    
    closeRecord : function(e){
      e.preventDefault()
      
      this.$el.trigger('recordClose')      
    },
    handleNavLink : function(e){
      e.preventDefault()
      e.stopPropagation()
      
      this.$el.trigger('navLink',{
        id:$(e.currentTarget).attr("data-id"),
        anchor:$(e.currentTarget).attr("data-page-anchor"),
        route:"page",
        type:"page"
      })      
    },    
    
    handleInViewLink: function(e){
      e.preventDefault()
      var scrolltop = 
        this.$('.record-main').scrollTop()
        + this.$('.group-'+$(e.target).attr('data-group')).offset().top
        - this.$('.record-main').offset().top
        - this.scroll_offset_group

      this._scrolling = true
      var that = this;
      this.$('.record-main').animate({ scrollTop: scrolltop }, 300, function(){
        that._scrolling = false;
        that.groupActive($(e.target).attr('data-index'))
      });
    },    
    
    
  });

  return RecordView;
});
