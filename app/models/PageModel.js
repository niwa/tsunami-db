define(["jquery","underscore","backbone","leaflet","./ContentModel","text!templates/pageAttributes.html"],function(t,e,n,i,s,o){var r=s.extend({initialize:function(t){this.options=t||{},this.isContentLoading=!1,this.isContentLoaded=!1,"undefined"!=typeof this.attributes.content?this.set("url",!1):this.set("url",this.attributes.path),this.set("class","page-"+this.id),this.set("source",this.attributes.source||"ajax")},getFormat:function(){return this.attributes.format},getTitle:function(){return this.attributes.title},getClass:function(){return this.attributes.class},getContent:function(n){if(this.isContentLoaded&&"undefined"!=typeof this.attributes.content&&""!==this.attributes.content[0].innerHTML)n(this.attributes.content);else{var i=this;this.isContentLoading?waitFor(function(){return i.isContentLoaded},function(){n(i.attributes.content,i)}):(this.isContentLoading=!0,this.loadContent(function(s){if("attributes"===i.id){var r=i.get("columnCollection");i.set("content",e.template(o)({t:i.collection.options.labels,content:s,proxies:i.get("proxyCollection").models,columnGroups:e.map(i.get("columnGroupCollection").models,function(t){var e="group-"+t.id,n=r.byGroup(t.id).models;return{title:t.get("title"),hint:t.get("hint"),id:t.id,classes:e,groupColumns:n}})}))}else i.set("content",i.setupContent(t(s)));i.isContentLoading=!1,i.isContentLoaded=!0,n(i.attributes.content)}))}},setupContent:function(e){return e.find("img").each(function(e,n){var i=t(n);L.Browser.retina&&(i.attr("src",i.attr("src").replace(".png","@2x.png")),i.attr("src",i.attr("src").replace(".jpg","@2x.jpg")),i.attr("src",i.attr("src").replace(".gif","@2x.gif"))),i.addClass("img-responsive")}),e.find('a[href^="http"]').attr("target","_blank"),e}});return r});