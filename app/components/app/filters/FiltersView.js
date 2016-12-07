define([
  'jquery',  'underscore',  'backbone',
  'jquery.select2/select2',
  'text!./filters.html',
  'text!./filterMultiSelect.html',
  'text!./filterText.html',
  'text!./filterButtons.html',  
  'text!./filterMinMax.html'
], function (
  $, _, Backbone,
  select2,
  template,
  templateFilterMultiSelect,
  templateFilterText,
  templateFilterButtons,
  templateFilterMinMax
) {

  var FiltersView = Backbone.View.extend({
    events : {
      "click .expand-all": "expandAll",
      "click .expand-group": "expandGroup",
      "click .query-submit": "querySubmit",
      "click .query-reset": "queryReset",
      "click .filter-button": "filterButtonClick",
    },
    initialize : function () {
      this.render()
      this.listenTo(this.model, "change:active", this.handleActive);      
      this.listenTo(this.model, "change:recQuery", this.render);      
      this.listenTo(this.model, "change:expanded", this.render);      
    },
    render: function () {
      
      if (this.model.allExpanded()) {
        this.$el.addClass("expanded") 
      } else {
        this.$el.removeClass("expanded") 
      }
      if (_.isEmpty(this.model.get("recQuery"))) {
        this.$el.removeClass("filtered") 
      } else {
        this.$el.addClass("filtered") 
      }
      
      
      var attributeCollection = this.model.get("attributeCollection").byAttribute("filterable")
      
      this.$el.html(_.template(template)({
        t:this.model.getLabels(),        
        attributeGroups: _.map(this.model.get("attributeGroupCollection").models,function(group){
          // group classes
          var classes = "group-" + group.id 
          if (this.model.isExpanded(group.id)) {
            classes +=  " expanded-group"  
          }

          var attributesByGroup = attributeCollection.byGroup(group.id).models 

          if (attributesByGroup.length === 0) {
            return false
          } else {          
            return {
              title:group.get("title"),
              hint:group.get("hint"),
              id:group.id,
              classes: classes,
              groupFilters: _.filter(
                _.map(attributesByGroup,function(att){
                  return this.getFilterHtml(att, group.id)                              
                },this),
                function(html){
                  return html !== false
                }
              )
            }          
          }          
        },this)
        
      }))
      this.initMultiselect()      
      
      return this
    },    
    
    getFilterHtml:function(att, groupId){      
      switch (att.get("type")){
        case "quantitative":
        case "spatial":                    
          var att_min = att.getQueryAttribute("min")
          var att_max = att.getQueryAttribute("max")

          var value_min = typeof (this.model.get("recQuery")[att_min]) !== "undefined"
            ? this.model.get("recQuery")[att_min]
            : ""              
          var value_max = typeof (this.model.get("recQuery")[att_max]) !== "undefined"
            ? this.model.get("recQuery")[att_max]
            : ""                      
          if (att.get("default") || value_min.trim() !== "" || value_max.trim() !== "" || this.model.isExpanded(groupId) ) {        
            return _.template(templateFilterMinMax)({
              title:att.get("title"),
              title_min:"Min",
              title_max:"Max",
              att_min:att_min,
              att_max:att_max,
              value_min:value_min,
              value_max:value_max
            })        
          } else {
            return false
          }
          break;
        case "date" :
          var att_min = att.getQueryAttribute("min")
          var att_max = att.getQueryAttribute("max")

          var queryValue, att_id
          if (att_min !== null) {       
            att_id = att_min             
          }  
          if (att_max !== null) { 
            att_id = att_max       
          }     
          queryValue = typeof (this.model.get("recQuery")[att_id]) !== "undefined"
            ? this.model.get("recQuery")[att_id]
            : ""          
          if (att.get("default") || queryValue.trim() !== "" || this.model.isExpanded(groupId) ) {
            return _.template(templateFilterText)({
              title:att.get("title") ,
              att:att_id,
              value:queryValue
            })
          } else {
            return false
          }
          break;
        case "categorical":
        case "ordinal":
          var att_id = att.getQueryAttribute()
          var queryValue = typeof (this.model.get("recQuery")[att_id]) !== "undefined"
            ? this.model.get("recQuery")[att_id]
            : ""              
          // only show default attributes or those that are set unless group expanded                        
          if (att.get("default") || queryValue.length || this.model.isExpanded(groupId) ) {


            var options = []

            if (typeof att.getValues().values !== "undefined" ) {
              options = _.map(att.getValues().values,function(value, key){
                return {
                  value:value,
                  label:att.getValues().labels[key],
                  hint:att.getValues().hints.length > 0 ? att.getValues().hints[key] : "",
                  selected:queryValue === value || queryValue.indexOf(value) > -1
                }
              })
              
              // offer options for blanks "blanks"
              if (att.get('blanks')) {
                var value = "null"
                options.push({
                  value:value,
                  label:"Unspecified",
                  hint:"",
                  selected:queryValue === value || queryValue.indexOf(value) > -1
                })
              }
              
            }
            
            if (options.length > 4) {
            
              return _.template(templateFilterMultiSelect)({
                title:att.get("title") ,
                att:att_id,
                options:options
              })
            } else {
              return _.template(templateFilterButtons)({
                title:att.get("title") ,
                att:att_id,
                options:options
              })
            }

          } else {
            return false
          }
          break
        default:
          return false
      }
    },
    
    initMultiselect: function(){
      var that = this
      this.$('.att-filter-multiselect').each(function(){
        var title = $(this).attr('data-ph')
        var $element = $(this)
        $element.select2({
          placeholder : "Select " + title
        })
        .on("select2:select", function(e){
          that.querySubmit(e)
        })
        
        // hack to prevent selct2 from opening "ghost" list after unselect
        // see https://github.com/select2/select2/issues/3320
        .on("select2:unselecting", function (e) {
          $(this).data('unselecting', true);
        })
        .on('select2:open', function(e) {
          if ($(this).data('unselecting')) {
            e.preventDefault();
            $(this).select2('close').removeData('unselecting');            
            // only submit query once opened
            that.querySubmit(e)
          }
        })             
        
      })      
    },
    
    
    handleActive : function(){
      if (this.model.isActive()) {
        this.$el.show()        
      } else {
        this.$el.hide()
      }
    },
    
    
    
    filterButtonClick:function(e){
      e.preventDefault()
      
      $(e.currentTarget).toggleClass('active')
      
      this.querySubmit(e)
      
    },
    
    
    querySubmit:function(e){     
      e.preventDefault()
      
      var query = {}
      
      this.$('.att-filter-text').each(function(index){
        var $filter = $(this)
        if ($filter.val().trim() !== "") {
          query[$filter.attr('data-attribute')] = $filter.val().trim()
        }
      })
      
      this.$('.att-filter-multiselect').each(function(index){
        var $filter = $(this)         
        if ($filter.val() !== null && $filter.val().length) {
          query[$filter.attr('data-attribute')] = $filter.val()
        }    
        $filter.select('destroy')
      })
      
      this.$('.att-filter-buttongroup').each(function(index){
        var $filter = $(this)         
        
        var val = []
        
        $filter.find('.filter-button.active').each(function(){          
          val.push($(this).attr('data-value'))
        })                
        if (val.length) {
          query[$filter.attr('data-attribute')] = val
        }            
      })
      
      this.$el.trigger('recordQuerySubmit',{query:query})
    },    
    queryReset:function(e){      
      e.preventDefault()
      this.$el.trigger('recordQuerySubmit',{query:{}})
    },
    expandAll:function(){
      if (this.model.allExpanded()) {
        this.model.setExpanded([])
      } else {
        this.model.setExpanded(_.pluck(this.model.get("attributeGroupCollection").models,"id"))
      }
    },
    expandGroup:function(e){
      var groupId = $(e.target).attr("data-group")
      if (this.model.isExpanded(groupId)) {
        this.model.removeExpanded(groupId)
      } else {
        this.model.addExpanded(groupId)
      }
    },
    
  });

  return FiltersView;
});
