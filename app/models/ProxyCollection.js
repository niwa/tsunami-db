define(["jquery","underscore","backbone","./ProxyModel"],function(t,e,n,i){var o=n.Collection.extend({model:i,initialize:function(t,e){this.options=e||{}},toCSV:function(){var t=",",n="\n",i="",o=e.without(Object.keys(this.models[0].attributes),"featureAttributeMap");return i+=o.join(t),i+=n,e.each(this.models,function(r){e.each(o,function(e,n){n>0&&(i+=t),i+='"',i+=r.get(e)?r.get(e).toString().replace(/"/g,'""'):"",i+='"'}),i+=n}),i}});return o});