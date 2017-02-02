define([
  'jquery',  'underscore',  'backbone',
  'jquery.select2/select2',
  'nouislider',
  'text!./filters.html',
  'text!./filterMultiSelect.html',
  'text!./filterText.html',
  'text!./filterButtons.html',  
  'text!./filterMinMax.html',
  'text!./filterMinMaxSlider.html'
], function (
  $, _, Backbone,
  select2,
  noUiSlider,
  template,
  templateFilterMultiSelect,
  templateFilterText,
  templateFilterButtons,
  templateFilterMinMax,
  templateFilterMinMaxSlider
) {

  var FiltersView = Backbone.View.extend({
    events : {
      "click .expand-all": "expandAll",
      "click .expand-group": "expandGroup",
      "click .query-submit": "querySubmitClick",
      "click .query-reset": "queryReset",
      "click .filter-button": "filterButtonClick",
      "click .filter-range-checkbox:checkbox": "filterRangeCheckboxClick",
      "click .slider-track-click": "filterSliderTrackClick"
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
      
      
      var columnCollection = this.model.get("columnCollection").byAttribute("filterable")
      
      this.$el.html(_.template(template)({
        t:this.model.getLabels(),        
        columnGroups:_.filter(
          _.map(this.model.get("columnGroupCollection").models,function(group){
          // group classes
          var classes = "group-" + group.id 
          if (this.model.isExpanded(group.id)) {
            classes +=  " expanded-group"  
          }

          var columnsByGroup = columnCollection.byGroup(group.id).models 

          if (columnsByGroup.length === 0) {
            return false
          } else {          
            return {
              title:group.get("title"),
              hint:group.get("hint"),
              id:group.id,
              classes: classes,
              groupFilters: _.filter(
                _.map(columnsByGroup,function(column){
                  return this.getFilterHtml(column, group.id)                              
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
      this.initMultiselect()      
      this.initRangeSlider()      
      
      return this
    },    
    
    
    getFilterHtml:function(column, groupId){      
      switch (column.get("type")){
        case "date":
        case "quantitative":
          
          // create the range slider element
          
          var title, // filter title
              column_min, // the query argument for min value
              column_max, // the query argument for max value
              column_value, // the actual query column
              value_min, // the current query min value
              value_max, // the current query max value
              value_column, // the current actual query column value, here can ne null for unspecified
              value_min_overall, // the largest possible value based on dataset
              value_max_overall, // the smallest possible value based on dataset
              range // the scale range definitions as defined in columns.json config and as needed for nouislider
                    
          title = column.get("title")
          column_min = column.getQueryColumnByType("min")
          column_max = column.getQueryColumnByType("max")  
          column_value = column.getQueryColumnByType("value")
          range = column.getValues().range   
            
          // combo column specific values
          // for every column marked as "combo" there should be a "combo_column", 
          // one will have to be type "min" and the other "max"            
          if(column.get('combo') === 1) {  
            // override title
            title = column.get("comboTitle")            
            // get the combo column
            var combo_column = this.model.get("columnCollection").get(column.get('comboColumnId'))            
            // update range and query columns from combo column depedning on type
            var combo_column_range = combo_column.getValues().range
            if(column.get('comboType') === "min") {
              range.min = combo_column_range.min
              column_max = combo_column.getQueryColumnByType("max")
            } else if(column.get('comboType') === "max"){
              range.max = combo_column_range.max
              column_min = combo_column.getQueryColumnByType("min")
            }           
          }
          // get possible min/max values
          value_min_overall = range.min[0]
          value_max_overall = range.max[0]   
          
          // figure out the query values from query for each query column          
          value_min = typeof (this.model.get("recQuery")[column_min]) !== "undefined"
            ? this.model.get("recQuery")[column_min]
            : ""              
          value_max = typeof (this.model.get("recQuery")[column_max]) !== "undefined"
            ? this.model.get("recQuery")[column_max]
            : ""       
          value_column = typeof (this.model.get("recQuery")[column_value]) !== "undefined"
            ? this.model.get("recQuery")[column_value]
            : ""         

          if (column.get("default") || value_min.trim() !== "" || value_max.trim() !== "" || this.model.isExpanded(groupId) ) {        
            return _.template(templateFilterMinMaxSlider)({
              title:title,
              type:column.get("type"),
              title_min:column.get("placeholders").min,
              title_max:column.get("placeholders").max,
              column_min:column_min,
              column_max:column_max,
              column_val:column_value,
              specified:value_min !== "" || value_max !== "",
              unspecified:value_column === "null",
              value_min:value_min,
              value_max:value_max,
              value_min_overall:value_min_overall,
              value_max_overall:value_max_overall,
              slider_active:value_min !== "" || value_max !== "",
              value_range:JSON.stringify(range).replace(/'/g, "\\'")
            })               
          } else {
            return false
          }
          break;
        
        case "spatial":                    
          var column_min = column.getQueryColumnByType("min")
          var column_max = column.getQueryColumnByType("max")

          var value_min = typeof (this.model.get("recQuery")[column_min]) !== "undefined"
            ? this.model.get("recQuery")[column_min]
            : ""              
          var value_max = typeof (this.model.get("recQuery")[column_max]) !== "undefined"
            ? this.model.get("recQuery")[column_max]
            : ""                      
          if (column.get("default") || value_min.trim() !== "" || value_max.trim() !== "" || this.model.isExpanded(groupId) ) {        
            return _.template(templateFilterMinMax)({
              title:column.get("title"),
              title_min:column.get("placeholders").min,
              title_max:column.get("placeholders").max,
              column_min:column_min,
              column_max:column_max,
              value_min:value_min,
              value_max:value_max
            })        
          } else {
            return false
          }
          break;       
        case "categorical":
        case "ordinal":
          var column_id = column.getQueryColumnByType()
          var queryValue = typeof (this.model.get("recQuery")[column_id]) !== "undefined"
            ? this.model.get("recQuery")[column_id]
            : ""              
          // only show default columns or those that are set unless group expanded                        
          if (column.get("default") || queryValue.length || this.model.isExpanded(groupId) ) {


            var options = []

            if (typeof column.getValues().values !== "undefined" ) {
              options = _.map(column.getValues().values,function(value, key){
                return {
                  value:value,
                  label:column.getValues().labels[key],
                  hint:column.getValues().hints.length > 0 ? column.getValues().hints[key] : "",
                  selected:queryValue === value || queryValue.indexOf(value) > -1
                }
              })              
              
            }
            
            if (options.length > 4) {
            
              return _.template(templateFilterMultiSelect)({
                title:column.get("title") ,
                column:column_id,
                options:options
              })
            } else {
              return _.template(templateFilterButtons)({
                title:column.get("title") ,
                column:column_id,
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
    
    initRangeSlider: function(){
      var that = this
      this.$('.column-filter-min-max-slider .filter-slider').each(function(){
        var slider = this;
                
        var ranges = JSON.parse($(this).attr('data-value-range'))
        var colType = $(this).attr('data-column-type') 
        
        var sliderOptions = {
          "start": [parseFloat($(this).attr('data-value-min')), parseFloat($(this).attr('data-value-max'))],
          "range": ranges,          
          "connect": true,
          "pips":{
            "mode":"range",
            "density": 3
          }
        }
        if (colType === "date") {
          sliderOptions.pips.format = {
            "to" : that.formatYearTo,
            "from" : that.formatYearFrom
          }
        }
        
        noUiSlider.create(slider,sliderOptions)
        
        var colMin = $(this).attr('data-column-min')     
        var colMax = $(this).attr('data-column-max')          
                 
        slider.noUiSlider.off()
        slider.noUiSlider.on('slide', function ( values, handle ) {
          if(colType === "date") {
            that.$('input#text-'+colMin).val(Math.round(values[0]))      
            that.$('input#text-'+colMax).val(Math.round(values[1]))
          } else {
            that.$('input#text-'+colMin).val(values[0])      
            that.$('input#text-'+colMax).val(values[1])
          }
        })
        slider.noUiSlider.on('change', function ( values, handle ) {   
          that.querySubmit()          
        })
        
      })
      
    },
    formatYearTo : function(value){
      var isNegative = value < 0
      var value_abs = Math.abs(value) 
      
      var value_abbr = Math.round(value_abs)
      if (value_abs >= 10000000) {
        value_abbr = Math.round(value_abs/1000000) + 'M'
      } else if(value_abs >= 10000) {
        value_abbr = Math.round(value_abs/1000) + 'k' 
      } 
      
      return isNegative 
        ? value_abbr + " BC"
        : value_abbr
        
    },
    formatYearFrom : function(value){
      return parseInt(value.replace('k', '000'))
    },
    
    initMultiselect: function(){
      var that = this
      this.$('.column-filter-multiselect').each(function(){
        var title = $(this).attr('data-ph')
        var $element = $(this)
        $element.select2({
          placeholder : "Select " + title
        })
        .on("select2:select", function(e){
          e.preventDefault();
          that.querySubmit()
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
            that.querySubmit()
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
      
      this.querySubmit()
      
    },
    
    filterRangeCheckboxClick:function(e){
      var $target = $(e.target);
      var $fields = $target.closest(".column-filter").find('.filter-input-fields')
      var selected = $target.is(':checked');      
      var value = $target.val()  
      var colMin = $target.attr('data-column-min')     
      var colMax = $target.attr('data-column-max') 
        
      if (value === "specified") {
        if(selected) {
          // toggle off unspecified
          $target.closest(".filter-unspecified").find(".filter-checkbox-unspecified").prop('checked',false)
          // add min/max values
          var valMin = $target.attr('data-value-min-overall')     
          var valMax = $target.attr('data-value-max-overall')           
          $fields.find('input#text-'+colMin).val(valMin)
          $fields.find('input#text-'+colMax).val(valMax)
          
        } else {
          // remove min/max values
          
          $fields.find('input#text-'+colMin).val("")
          $fields.find('input#text-'+colMax).val("")
          
        }
      } else { //if (value === "null") {
        if(selected) {
          // toggle off specified
          $target.closest(".filter-unspecified").find(".filter-checkbox-specified").prop('checked',false)
          // remove min/max values
          $fields.find('input#text-'+colMin).val("")
          $fields.find('input#text-'+colMax).val("")                    
        }
      }
      
      
      this.querySubmit()      
    },
    
    
    querySubmitClick:function(e){    
      e.preventDefault()
      this.querySubmit()
    },
    querySubmit:function(){     
      
      var query = {}
      
      this.$('.column-filter-checkbox').each(function(index){
        var $filter = $(this)
        if ($filter.val().trim() !== "" && $filter.is(':checked')) {
          query[$filter.attr('data-column')] = $filter.val().trim()
        }
      })
      
      this.$('.column-filter-text').each(function(index){
        var $filter = $(this)
        if ($filter.val().trim() !== "") {
          query[$filter.attr('data-column')] = $filter.val().trim()
        }
      })
      
      this.$('.column-filter-multiselect').each(function(index){
        var $filter = $(this)         
        if ($filter.val() !== null && $filter.val().length) {
          query[$filter.attr('data-column')] = $filter.val()
        }    
        $filter.select('destroy')
      })
      
      this.$('.column-filter-buttongroup').each(function(index){
        var $filter = $(this)         
        
        var val = []
        
        $filter.find('.filter-button.active').each(function(){          
          val.push($(this).attr('data-value'))
        })                
        if (val.length) {
          query[$filter.attr('data-column')] = val
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
        this.model.setExpanded(_.pluck(this.model.get("columnGroupCollection").models,"id"))
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
