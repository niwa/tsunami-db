!function(e){if("function"==typeof require&&"object"==typeof exports&&"object"==typeof module){var t=require("jquery");module.exports=e(t)}else if("function"==typeof define&&define.amd)define(["jquery"],function(t){return e(t)});else{var o;try{o=(0,eval)("this")}catch(e){o=window}o.deparam=e(jQuery)}}(function(e){var t=function(e,t){var o={},n={true:!0,false:!1,null:null};return e.replace(/\+/g," ").split("&").forEach(function(e){var r,i=e.split("="),l=decodeURIComponent(i[0]),a=o,f=0,p=l.split("]["),c=p.length-1;if(/\[/.test(p[0])&&/\]$/.test(p[c])?(p[c]=p[c].replace(/\]$/,""),p=p.shift().split("[").concat(p),c=p.length-1):c=0,2===i.length)if(r=decodeURIComponent(i[1]),t&&(r=r&&!isNaN(r)&&+r+""===r?+r:"undefined"===r?void 0:void 0!==n[r]?n[r]:r),c)for(;f<=c;f++)l=""===p[f]?a.length:p[f],a=a[l]=f<c?a[l]||(p[f+1]&&isNaN(p[f+1])?{}:[]):r;else"[object Array]"===Object.prototype.toString.call(o[l])?o[l].push(r):{}.hasOwnProperty.call(o,l)?o[l]=[o[l],r]:o[l]=r;else l&&(o[l]=t?void 0:"")}),o};return e.prototype.deparam=e.deparam=t,t});