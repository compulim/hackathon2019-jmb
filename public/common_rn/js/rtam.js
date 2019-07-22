function JLJS_RT_TrackTag() {
	this.tag_image = "/common_rn/img/rtam.gif";
	this._host = document.location.hostname;
	this._path = document.location.pathname;
	this._search = document.location.search;
	this._protocol = document.location.protocol;
	this._referrer = document.referrer;
	this._cookie = document.cookie + ";";
	
	this.CK_JALCOJP = "JALCOJP";
	this.CK_LOGIN = "LOGIN";
}

JLJS_RT_TrackTag.prototype = {
	
	init : function(_imgPath) {
		if(_imgPath != "") {
			this.tag_image = _imgPath;
		}
		this.exec();
	},
	
	exec : function() {
		var imgObj = new Image(1,1);
		var i, path, rhost, rpath, param, tag_url, flash_version, jlsession, jllogin;
		
		var now = new Date();
		var utctime = now.toGMTString();
		rhost = "";
		rpath = "";
		i = this._referrer.indexOf("://");
		if(i > 0) {
			this._referrer = this._referrer.substring(i+3, this._referrer.length);
			i = this._referrer.indexOf("/");
			if(i > 0) {
				rhost = this._referrer.substring(0, i);
				rpath = this._referrer.substring(i, this._referrer.length);
			}
		}
		
		path = "";
		i = this._path.indexOf("/");
		if(i >= 0) {
			path = this._path.substring(1, this._path.length);
		}
		
		param = "";
		if(this._search != "") {
			param = "&" + this._search.substring(1, this._search.length);
		}
		
		jlsession = this.get_cookie(this.CK_JALCOJP);
		jllogin = this.get_cookie(this.CK_LOGIN);
		flash_version = this.get_flash_version();
		
		tag_url = this.tag_image + "?rtprotocol=" + this._protocol +
								"&rthost=" + this._host +
								"&rtpath=" + path + param +
								"&rtrhost=" + rhost +
								"&rtrpath=" + escape(rpath) +
								"&rtflash_version=" + flash_version +
								"&rttime=" + escape(utctime) +
								"&rtrand=" + Math.random();
								
		if(jlsession != "") {
			tag_url += "&jlsession=" + jlsession;
		}
		if(jllogin == "YES" || jllogin == "NO") {
			tag_url += "&jllogin=" + jllogin;
		}
		if(typeof JLJS_RTTT_subFunc != "undefined" && typeof JLJS_RTTT_subFunc == "function") {
			var ret = JLJS_RTTT_subFunc();
			if(ret != "") {
				tag_url += ret;
			}
		}
		
		imgObj.src = tag_url;
	},
	
	get_cookie : function(key) {
		var index1 = this._cookie.indexOf(key, 0);
		if(index1 != -1) {
			var ck = this._cookie.substring(index1, this._cookie.length);
			var index2 = ck.indexOf("=", 0) + 1;
			var index3 = ck.indexOf(";", index2);
			return (unescape(ck.substring(index2, index3)));
		}
		return "";
	},
	
	get_flash_version : function() { 
		var version = "0.0.0";
		if(navigator.plugins && navigator.mimeTypes["application/x-shockwave-flash"]) {
			var plugin = navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin;
			if(plugin && plugin.description) {
				version = plugin.description.replace(/^[A-Za-z\s]+/, "").replace(/(\s+r|\s+b[0-9]+)/, ".");
			}
		} else {
			var x = '';
			try {
				// for ver.7 and later
				var axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7");
				x = axo.GetVariable("$version");
			} catch(e) {
				try {
					// for ver.6
					axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6");
					x = "WIN 6,0,21,0";
					axo.AllowScriptAccess = "always";
					x = axo.GetVariable("$version");
				} catch(e) {
					if(!x.match(/^WIN/)) {
						try {
							// for 4.x,5.x
							axo = null;
							axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.3");
							x = axo.GetVariable("$version");
						} catch(e) {
							if(axo) {
								// for 3.x
								x = "WIN 3,0,18,0";
							} else {
								try {
									// for 2.x
									axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
									x = "WIN 2,0,0,11";
								} catch(e) {
									x = "WIN 0,0,0,0";
								}
							}
						}
					}
				}
			}
			version = x.replace(/^WIN /, "").replace(/,[0-9]+$/, "").replace(/,/g, ".");
		}

		// check version string format
		// Quicktime enabled Safari returns a description in natural language
		if(version.match(/^[0-9]+\.[0-9]+\.[0-9]+$/)) {
			return version;
		} else {
			return "0.0.0";
		}
	}
}
var JLJS_RTTT = new JLJS_RT_TrackTag();

function JLJS_RTTT_setup() {
	if(typeof JLJS_RTTT_execFlag != "undefined" && !JLJS_RTTT_execFlag) {
		return;
	}
	var _imgPath = "";
	if(typeof JLJS_RTTT_setupParams != "undefined") {
		if(JLJS_RTTT_setupParams._imgPath) {
			_imgPath = JLJS_RTTT_setupParams._imgPath;
		}
	}
	JLJS_RTTT.init(_imgPath);
}
JLJS_RTTT_setup();