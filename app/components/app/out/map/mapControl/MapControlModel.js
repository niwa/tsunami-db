define(["jquery","underscore","backbone","models/ViewModel"],function(e,t,n,o){return o.extend({initialize:function(e){this.options=e||{},this.set("expanded",!1)},getOutColorColumn:function(){return this.attributes.outColorColumn}})});