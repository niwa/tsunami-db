define(["jquery","underscore","backbone","bootstrap","jquery.select2/select2","nouislider","text!./filters.html","text!./filterMultiSelect.html","text!./filterButtons.html","text!./filterMinMaxAddon.html","text!./filterMinMaxSlider.html","text!./filterSearch.html","text!./filterLabel.html","text!./filterGroups.html","text!./filterGroupFilters.html"],function(e,t,i,l,n,r,o,a,u,s,d,c,h,m,p){var f=i.View.extend({events:{"click .expand-all":"expandAll","click .expand-group":"expandGroup","click .query-submit":"querySubmitClick","click .query-reset":"queryReset","click .query-group-reset":"queryGroupReset","click .filter-button":"filterButtonClick","click .filter-range-checkbox:checkbox":"filterRangeCheckboxClick","click .slider-track-click":"filterSliderTrackClick","click .nav-link":"handleNavLink"},initialize:function(){this.render(),this.listenTo(this.model,"change:active",this.handleActive),this.listenTo(this.model,"change:recQuery",this.queryUpdated),this.listenTo(this.model,"change:expanded",this.expandedUpdated),e(window).on("resize",t.debounce(t.bind(this.resize,this),100))},resize:function(){this.initMultiselect()},render:function(){return this.previousQuery=e.extend(!0,{},this.model.get("recQuery")),this.previousExpanded=this.model.getExpanded(),this.$el.html(t.template(o)({t:this.model.getLabels()})),this.renderGroups(),this.renderGroupFilters(),this.checkExpanded(),this.checkFiltered(),this.renderReset(),this},expandedUpdated:function(){this.updateGroupFilters(),this.checkExpanded(),this.previousExpanded=this.model.getExpanded()},queryUpdated:function(){this.updateGroupFilters(),this.updateSearch(),this.checkFiltered(),this.previousQuery=e.extend(!0,{},this.model.get("recQuery")),this.renderReset()},renderReset:function(){Object.keys(this.model.get("recQuery")).length>0&&this.$(".btn.query-reset").html(this.model.getLabels().filters.reset+" ("+Object.keys(this.model.get("recQuery")).length+")")},updateSearch:function(){this.model.allExpanded()&&this.renderSearch()},renderSearch:function(){var e="undefined"!=typeof this.model.get("recQuery").s?this.model.get("recQuery").s:"";this.$(".form-search").html(t.template(c)({title:!1,column:"s",type:"keyword",value:e,placeholder:this.model.getLabels().filters.placeholder_search}))},checkExpanded:function(){this.model.allExpanded()?(this.$el.addClass("expanded"),this.renderSearch()):(this.$el.removeClass("expanded"),this.$(".form-search").html("")),t.each(this.model.get("columnGroupCollection").models,function(e){this.$(".group-"+e.id).toggleClass("expanded-group",this.model.isExpanded(e.id))},this)},checkFiltered:function(){t.isEmpty(this.model.get("recQuery"))?this.$el.removeClass("filtered"):this.$el.addClass("filtered")},renderGroups:function(){this.$(".form-groups").html(t.template(m)({t:this.model.getLabels(),columnGroups:t.reduce(this.model.get("columnGroupCollection").models,function(e,t){return t.get("filter")!==!1&&e.push({title:t.get("title"),hint:t.get("hint"),id:t.id,classes:"group-"+t.id}),e},[],this)}))},renderGroupFilters:function(){var e=this.model.get("columnCollection").byAttribute("filterable");t.each(this.model.get("columnGroupCollection").models,function(i){var l=e.byGroup(i.id).models;this.$(".form-group-"+i.id+" .group-filters").html(t.template(p)({groupFilters:t.map(l,function(e){return{id:e.id,html:this.getFilterHtml(e,i.id)}},this)})),this.$(".form-group-"+i.id+" .query-group-reset").toggle(t.reduce(l,function(e,t){return e||this.isColumnSet(t)},!1,this))},this),this.initMultiselect(),this.initRangeSlider(),this.initTooltips()},updateGroupFilters:function(){var e=this.model.get("columnCollection").byAttribute("filterable");t.each(this.model.get("columnGroupCollection").models,function(i){var l=e.byGroup(i.id).models;t.each(l,function(e){if(this.hasColumnFilterChanged(e)||this.model.isExpanded(i.id)!==this.previousExpanded.indexOf(i.id)>-1){var t=this.$(".form-group-"+i.id+" .group-filters .column-filter-"+e.id);switch(t.html(this.getFilterHtml(e,i.id)||""),e.get("type")){case"date":case"quantitative":this.initRangeSlider(t);break;case"categorical":case"ordinal":this.initMultiselect(t)}this.initTooltips(t)}},this),this.$(".form-group-"+i.id+" .query-group-reset").toggle(t.reduce(l,function(e,t){return e||this.isColumnSet(t)},!1,this))},this)},getColumnMax:function(e){if(1===e.get("combo")&&"min"===e.get("comboType")){var t=this.model.get("columnCollection").get(e.get("comboColumnId"));return t.getQueryColumnByType("max")}return e.getQueryColumnByType("max")},getColumnMin:function(e){if(1===e.get("combo")&&"max"===e.get("comboType")){var t=this.model.get("columnCollection").get(e.get("comboColumnId"));return t.getQueryColumnByType("min")}return e.getQueryColumnByType("min")},hasColumnFilterChanged:function(e){var t=this.model.get("recQuery"),i=e.getQueryColumnByType("value");if(t[i]!==this.previousQuery[i])return!0;var l=this.getColumnMin(e);if(t[l]!==this.previousQuery[l])return!0;var n=this.getColumnMax(e);return t[n]!==this.previousQuery[n]},isColumnSet:function(e,t){t="undefined"!=typeof t?t:this.model.get("recQuery");var i=e.getQueryColumnByType("value"),l="undefined"!=typeof t[i]?t[i]:"";if(l.length>0)return!0;var n=this.getColumnMin(e),r="undefined"!=typeof t[n]?t[n]:"";if(r.length>0)return!0;var o=this.getColumnMax(e),a="undefined"!=typeof t[o]?t[o]:"";return a.length>0},getFilterHtml:function(e,i){switch(e.get("type")){case"spatial":var l=e.getQueryColumnByType("min"),n=e.getQueryColumnByType("max"),r="undefined"!=typeof this.model.get("recQuery")[l]?this.model.get("recQuery")[l]:"",o="undefined"!=typeof this.model.get("recQuery")[n]?this.model.get("recQuery")[n]:"";return!(!e.get("isDefault")&&""===r.trim()&&""===o.trim()&&!this.model.isExpanded(i))&&t.template(s)({label:t.template(h)({t:this.model.getLabels(),id:e.id,forId:"text-"+l,tooltip:e.get("description"),tooltip_more:e.hasMoreDescription(),title:e.get("title"),hint:e.get("hint")}),title_min:e.get("placeholders").min,title_max:e.get("placeholders").max,addon_min:e.get("addons").min,addon_max:e.get("addons").max,column_min:l,column_max:n,type:e.get("type"),value_min:r,value_max:o,input_hint:this.model.getLabels().filters.input_hint});case"date":case"quantitative":var c,m,l,n,p,r,o,f,g,y,v;if(c=e.get("title"),m=e.get("description"),l=e.getQueryColumnByType("min"),n=e.getQueryColumnByType("max"),p=e.getQueryColumnByType("value"),v=e.getValues().range,1===e.get("combo")){c=e.get("comboTitle"),m=e.get("comboDescription");var x=this.model.get("columnCollection").get(e.get("comboColumnId")),b=x.getValues().range;"min"===e.get("comboType")?(v.min=b.min,n=x.getQueryColumnByType("max")):"max"===e.get("comboType")&&(v.max=b.max,l=x.getQueryColumnByType("min"))}return g=v.min[0],y=v.max[0],r="undefined"!=typeof this.model.get("recQuery")[l]?this.model.get("recQuery")[l]:"",o="undefined"!=typeof this.model.get("recQuery")[n]?this.model.get("recQuery")[n]:"",f="undefined"!=typeof this.model.get("recQuery")[p]?this.model.get("recQuery")[p]:"",!!(e.get("isDefault")||r.length>0||o.length>0||f.length>0||this.model.isExpanded(i))&&t.template(d)({label:t.template(h)({t:this.model.getLabels(),id:e.id,forId:"text-"+l,tooltip:m,tooltip_more:e.hasMoreDescription(),title:c,hint:e.get("hint")}),type:e.get("type"),title_min:e.get("placeholders").min,title_max:e.get("placeholders").max,column_min:l,column_max:n,column_val:p,specified:""!==r||""!==o,unspecified:"null"===f,value_min:r,value_max:o,value_min_overall:g,value_max_overall:y,slider_active:""!==r||""!==o,value_range:JSON.stringify(v).replace(/'/g,"\\'"),label_specified:this.model.getLabels().filters.specified,label_unspecified:this.model.getLabels().filters.unspecified,input_hint:this.model.getLabels().filters.input_hint});case"categorical":case"ordinal":var C=e.getQueryColumnByType(),f="undefined"!=typeof this.model.get("recQuery")[C]?this.model.get("recQuery")[C]:"";if(e.get("isDefault")||f.length>0||this.model.isExpanded(i)){var k=[];return"undefined"!=typeof e.getValues().values&&(k=t.map(e.getValues().values,function(t,i){return{value:t,label:e.getValues().labels[i],hint:e.getValues().hints.length>0?e.getValues().hints[i]:"",selected:f===t||f.indexOf(t)>-1}})),k.length>4?t.template(a)({label:t.template(h)({t:this.model.getLabels(),id:e.id,forId:"multiselect-"+C,tooltip:e.get("description"),tooltip_more:e.hasMoreDescription(),title:e.get("title"),hint:e.get("hint")}),title:e.get("title"),column:C,options:k}):t.template(u)({label:t.template(h)({t:this.model.getLabels(),id:e.id,forId:"buttons-"+C,tooltip:e.get("description"),tooltip_more:e.hasMoreDescription(),title:e.get("title"),hint:e.get("hint")}),column:C,options:k})}return!1;default:return!1}},initTooltips:function(t){var i="undefined"!=typeof t?t.find('label a[data-toggle="tooltip"]'):this.$('label a[data-toggle="tooltip"]');i.tooltip(),i="undefined"!=typeof t?t.find('input[type="text"][data-toggle="tooltip"]'):this.$('input[type="text"][data-toggle="tooltip"]'),i.each(function(){e(this).on("input",function(){""!==e(this).val().trim()?e(this).tooltip("show"):e(this).tooltip("hide")}),e(this).on("focusout",function(){e(this).tooltip("hide")})})},initRangeSlider:function(t){var i="undefined"!=typeof t?t.find(".column-filter-min-max-slider .filter-slider"):this.$(".column-filter-min-max-slider .filter-slider"),l=this;i.each(function(){var t=this,i=JSON.parse(e(this).attr("data-value-range")),n=e(this).attr("data-column-type"),o={start:[parseFloat(e(this).attr("data-value-min")),parseFloat(e(this).attr("data-value-max"))],range:i,connect:!0,pips:{mode:"range",density:3}};"date"===n&&(o.pips.format={to:l.formatYearTo,from:l.formatYearFrom}),r.create(t,o);var a=e(this).attr("data-column-min"),u=e(this).attr("data-column-max"),s=e(this).attr("data-column");t.noUiSlider.off(),t.noUiSlider.on("slide",function(e,t){"date"===n?(l.$("input#text-"+a).val(Math.round(e[0])),l.$("input#text-"+u).val(Math.round(e[1]))):(l.$("input#text-"+a).val(e[0]),l.$("input#text-"+u).val(e[1]))}),t.noUiSlider.on("change",function(e,t){l.$("input#checkbox-"+s).prop("checked",!1),l.querySubmit()})})},initMultiselect:function(t){var i="undefined"!=typeof t?t.find(".column-filter-multiselect"):this.$(".column-filter-multiselect"),l=this;i.each(function(){var t=e(this).attr("data-ph"),i=e(this);i.select2({placeholder:l.model.getLabels().filters.placeholder_select+" "+t}).on("select2:select",function(e){e.preventDefault(),l.querySubmit()}).on("select2:unselecting",function(t){e(this).data("unselecting",!0)}).on("select2:open",function(t){e(this).data("unselecting")&&(t.preventDefault(),e(this).select2("close").removeData("unselecting"),l.querySubmit())})})},handleActive:function(){this.model.isActive()?(this.$el.show(),this.render()):this.$el.hide()},filterButtonClick:function(t){t.preventDefault(),e(t.currentTarget).toggleClass("active"),this.querySubmit()},filterRangeCheckboxClick:function(t){var i=e(t.target),l=i.closest(".column-filter").find(".filter-input-fields"),n=i.is(":checked"),r=i.val(),o=i.attr("data-column-min"),a=i.attr("data-column-max");if("specified"===r)if(n){i.closest(".filter-unspecified").find(".filter-checkbox-unspecified").prop("checked",!1);var u=i.attr("data-value-min-overall"),s=i.attr("data-value-max-overall");l.find("input#text-"+o).val(u),l.find("input#text-"+a).val(s)}else l.find("input#text-"+o).val(""),l.find("input#text-"+a).val("");else n&&(i.closest(".filter-unspecified").find(".filter-checkbox-specified").prop("checked",!1),l.find("input#text-"+o).val(""),l.find("input#text-"+a).val(""));this.querySubmit()},querySubmitClick:function(e){e.preventDefault(),this.querySubmit()},querySubmit:function(){var t={};this.$(".column-filter-checkbox").each(function(i){var l=e(this);""!==l.val().trim()&&l.is(":checked")&&(t[l.attr("data-column")]=l.val().trim())});var i=this;this.$(".column-filter-text").each(function(l){var n=e(this);if(""!==n.val().trim()){var r=n.val().trim();isNumber(r)||"date"!==n.attr("data-column-type")||(r=i.formatYearFrom(r)),t[n.attr("data-column")]=r.toString()}}),this.$(".column-filter-multiselect").each(function(i){var l=e(this);null!==l.val()&&l.val().length>0&&(t[l.attr("data-column")]=l.val()),l.select("destroy")}),this.$(".column-filter-buttongroup").each(function(i){var l=e(this),n=[];l.find(".filter-button.active").each(function(){n.push(e(this).attr("data-value"))}),n.length&&(t[l.attr("data-column")]=n)}),this.$el.trigger("recordQuerySubmit",{query:t})},queryGroupReset:function(t){t.preventDefault();var i=e(t.target);this.$(".group-"+i.attr("data-group")).find(".column-filter").each(function(){e(this).find(".column-filter-checkbox, .column-filter-text, .column-filter-multiselect").val(""),e(this).find(".column-filter-buttongroup .filter-button").removeClass("active")}),this.querySubmit()},queryReset:function(e){e.preventDefault(),this.$el.trigger("recordQuerySubmit",{query:{}})},expandAll:function(){this.model.allExpanded()?this.model.setExpanded([]):this.model.setExpanded(t.pluck(this.model.get("columnGroupCollection").models,"id"))},expandGroup:function(t){var i=e(t.currentTarget).attr("data-group");this.model.isExpanded(i)?this.model.removeExpanded(i):this.model.addExpanded(i)},formatYearTo:function(e){var t=e<0,i=Math.abs(e),l=Math.round(i);return i>=1e7?l=Math.round(i/1e6)+"M":i>=1e4&&(l=Math.round(i/1e3)+"k"),t?l+" BC":l},formatYearFrom:function(e){var t=!1,i=!1,l=!1,n=e.toString();return n.indexOf("BC")>-1&&(t=!0,n=n.replace("BC","").trim()),n.indexOf("BP")>-1&&(t=!0,n=n.replace("BP","").trim()),n.indexOf("AD")>-1&&(n=n.replace("AD","").trim()),n.indexOf("k")>-1&&(i=!0,n=n.replace("k","").trim()),n.indexOf("K")>-1&&(i=!0,n=n.replace("K","").trim()),n.indexOf("m")>-1&&(l=!0,n=n.replace("m","").trim()),n.indexOf("M")>-1&&(l=!0,n=n.replace("M","").trim()),isNumber(n)?(e=parseFloat(n),e=t?e*-1:e,e=i?1e3*e:e,e=l?1e6*e:e):e=n,parseInt(e)},handleNavLink:function(t){t.preventDefault(),t.stopPropagation(),this.$el.trigger("navLink",{id:e(t.currentTarget).attr("data-id"),anchor:e(t.currentTarget).attr("data-page-anchor"),route:"page",type:"page"})}});return f});