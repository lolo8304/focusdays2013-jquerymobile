

	function array(value) {
		if (value != null && value != "") {
			if (!(value.constructor === Array)) { return [ value ]; } else { return value; };
		} else {
			return [];
		}
	}

	/*
	Storage.prototype.setObject = function (key, value) {
	    this.setItem(key, JSON.stringify(value));
	}
	Storage.prototype.getObject = function(key) {
	    var value = this.getItem(key);
	    return value && JSON.parse(value);
	}
	*/
	function localStorageSetObject(key, value) {
	    localStorage.setItem(key, JSON.stringify(value));
	}

	function localStorageGetObject(key, value) {
	    var value = localStorage.getItem(key);
	    return value && JSON.parse(value);
	}
	var $M = {
//			var myDomain = getCurrentDomainURL("metadata endpoint", "raspi-lolo.dyndns.org", true);
			localStorageKey: "metadata",
			cache: {},
			locale: "de",
			localStorageSupport: null, 
			sessionStorageSupport: null, 
			cachedPOs: null,
			cachedTexts: new Object(),
			registeredEvents: new Object(),

			getCurrentDomainURL: function (text, defaultHostName, useDefaultPortAndProtocol) {
				var myDomain;
				var loc = window.location;
				if (window.XDomainRequest) {
					console.log("IE detected, IE does not support CORS, current domain location must be used");
					//special trick to support multiple endpoint URLs and using same URL for JSON service
					// will not work for development
					myDomain=loc.protocol + "//"+loc.hostname;
					if (loc.port !== "" && loc.port !== "80" && loc.port !== "443") {
						myDomain = myDomain + ":"+loc.port;
					}
				} else {
					if (useDefaultPortAndProtocol == true) {
						myDomain=loc.protocol + "//"+defaultHostName;
						if (loc.port !== "" && loc.port !== "80" && loc.port !== "443") {
							myDomain = myDomain + ":"+loc.port;
						}
					} else {
						myDomain=defaultHostName;
					}
				}
				console.log(text+" server URL for JSON services "+myDomain);
				return myDomain;
			},
			metaURL: function(poList) {
				return this.getCurrentDomainURL("metadata endpoint", "http://raspi-lolo.dyndns.org:8888", false)
					+'/json-restlet-example-web/jsonREST/V1.0/PsMetadata/execute?poList='+poList+"&locale="+this.locale;
			},
			isLocalStorage : function() {
				if (this.localStorageSupport == null) {
					this.localStorageSupport = Modernizr.localstorage;
					this.sessionStorageSupport = Modernizr.sessionstorage;
//					this.localStorageSupport = false;
//					this.sessionStorageSupport = false;
					console.log("localstorage is supported ="+this.localStorageSupport);
					console.log("sessionstorage is supported ="+this.sessionStorageSupport);
				}
				return this.localStorageSupport;
			},
			getCachedPOs : function () {
				if (this.isLocalStorage()) {
					var storageKey = "$"+$M.localStorageKey+".cachedPOs";
					if (this.cachedPOs == null) {
						localCachedPOs = localStorageGetObject(storageKey);
						if (localCachedPOs != null && localCachedPOs.length > 0) {
							console.log("localstorage found = "+storageKey);
							this.cachedPOs = localCachedPOs;
						} else {
							this.cachedPOs = [];
						}
					}
				} else if (this.cachedPOs == null) {
					this.cachedPOs = [];
				} else {
					this.cachedPOs;
				}
				return this.cachedPOs;
			},
			addPo : function (poName) {
				this.getCachedPOs();
				if (this.isLocalStorage()) {
					var storageKey = "$"+$M.localStorageKey+".cachedPOs";
					if (this.cachedPOs.indexOf(poName) < 0) {
						this.cachedPOs.push(poName);
						localStorageSetObject(storageKey, this.cachedPOs);
						console.log("localstorage added = "+storageKey);
					} else {
//						console.log("localstorage found = "+storageKey);
					}
				} else {
					this.cachedPOs.push(poName);
				}
			},
			loadPOs : function () {
				/* copy to reduce risk of parallel editing in arra during for loop */
				var pos = this.getCachedPOs().slice(0);
				var posToLoad = null;
				for (var i=0;i < pos.length; i++) {
					var po = this.getCachedEntry(pos[i] + "."+this.locale);
					if (po == null) {
						if (posToLoad == null) {
							posToLoad = pos[i];
						} else {
							posToLoad = posToLoad +","+pos[i];
						}
					}
				}
				if (posToLoad != null) {
					console.log("load metadata "+posToLoad +" via URL "+this.metaURL(posToLoad));
					$.support.cors = true;
					$.ajax({
				  		dataType: "json",
				  		url: this.metaURL(posToLoad),
				  		success: function(data) {
				  			var pos = array(data.list.po);
				  			for (var index=0; index < pos.length; index++) {
				  				$M.addMeta(pos[index]);
				  			}
							$M.triggerEvent("changed", posToLoad);
				  		},
				  	    error: function(XMLHttpRequest, textStatus, errorThrown) { 
							console.log("error while retrieving po data "+ textStatus+", "+errorThrown);
							throw errorThrown;
					  	},
				  		async: true
					});
				}
			},
			getCachedEntry : function(cachedEntry) {
				if (this.cache[cachedEntry] != null) {
					return this.cache[cachedEntry];
				}
				if (this.isLocalStorage()) {
					var localCache = localStorageGetObject($M.localStorageKey+"."+ cachedEntry);
					if (localCache != null && localCache.length > 0) {
						console.log("localstorage found = "+$M.localStorageKey+"."+ cachedEntry);
						this.cache[cachedEntry] = localCache;
					}
					return localCache;
				} else {
					this.cache[cachedEntry] = cachedEntry;
					return cachedEntry;
				}
			},
			addCachedEntry : function(cachedEntry, cachedValue) {
				this.cache[cachedEntry] = cachedValue;
				if (this.isLocalStorage()) {
					localStorageSetObject($M.localStorageKey+"."+ cachedEntry, cachedValue);
					console.log("localstorage added = "+$M.localStorageKey+"."+ cachedEntry);
				}
			},
			clearCache : function() {
				if (this.isLocalStorage()) {
					var toRemove = [];
					for (var i = 0; i < localStorage.length; i++){
						if (localStorage.key(i).startsWith($M.localStorageKey+".")) {
							toRemove.push(localStorage.key(i));
						}
					}
					for (var i = 0; i < toRemove.length; i++){
						console.log("localstorage removed = "+toRemove[i]);
						localStorage.removeItem(toRemove[i]);
					}
				}
				this.cache = {};
				this.cachedTexts = new Object();
				$M.setLocale(this.locale);
			},
			supportedLocales : function () {
				return { "de" : "D", "fr" : "F", "it" : "I", "en" : "E"};
			},
			po : function (poName) {
				var po = this.getCachedEntry(poName+"."+this.locale);
				if (po == null) { console.log("po named "+poName+" not found for locale "+this.locale); }
				return po;
			},
			addMetaLocale : function(data, locale) {
				this.addCachedEntry(data.name+"."+locale, data);
			}, 
			addMeta : function(data) {
				this.addMetaLocale(data, this.locale);
			}, 
			setLocale : function (newLocale) {
				this.locale = newLocale;
				this.loadPOs();
				this.triggerEvent("localeChanged", this.locale);
			},
			tag : function (texts, tag) {
				if (texts == null) return "";
				if (!(texts.constructor === Array)) { texts = [ texts ]; }
				for (var tIndex=0;tIndex < texts.length; tIndex++) {
					if (texts[tIndex].tag == tag) { return texts[tIndex].text; }
				}
				return "";
			},
			
			prop : function (poName, propertyName) {
				var po = this.po(poName);
				if (po !== null) {
					var props = array(this.po(poName).properties.property);
					for (var index=0; index < props.length; index++) {
						if (props[index].name == propertyName) {
							return props[index];
						}
					}
					console.log("property "+propertyName+" not found in po "+poName+" in locale "+this.locale);
				}
				return null;
			}, 
			text : function (poName, propertyName, tag, ifAbsent) {
				var ccKey = "text||"+poName+"."+propertyName+"."+tag;
				var ccText = this.cachedText(ccKey);
				if (!(ccText == null)) return ccText;
				var prop = this.prop(poName, propertyName);
				if (!(prop == null)) {
					return this.addCachedText(ccKey, this.tag(prop.texts.text, tag));
				} else {
					if (ifAbsent === null) {
						return this.addCachedText(ccKey, "["+poName+"."+propertyName+"."+tag+"]");
					} else {
						return ifAbsent;
					};
				};
			}, 
			label: function (poName, propertyName) {
				return this.text(poName, propertyName, "label");
			},
			hint: function (poName, propertyName) {
				return this.text(poName, propertyName, "hint", "");
			},
			codes: function (poName, propertyName) {
				var codes = this.prop(poName, propertyName);
				if (codes == null) {
					console.log("property not found "+poName+"."+propertyName);
					return [];
				} else if (codes.valueRanges == ""){
					console.log("no valuerange found for property "+poName+"."+propertyName);
					return [];
				} else {
					return array(codes.valueRanges.valueRange.codeTable.codes.code);
				}
			},			
			code: function (poName, propertyName, value) {
				var codes = this.codes(poName, propertyName);
				for (var i=0; i < codes.length; i++) {
					if (codes[i].key == value) {
						return codes[i];
					}
				}
				return null;
			},
			cachedText: function (key) {
				var k = this.locale+"||"+key;
				return this.cachedTexts[k];
			},
			addCachedText: function (key, value) {
				var k = this.locale+"||"+key;
				this.cachedTexts[k] = value;
				return value;
			},
			codetext: function (poName, propertyName, value, tag) {
				var ccKey = "code||"+poName+"."+propertyName+"."+value+"."+tag;
				var ccText = this.cachedText(ccKey);
				if (ccText != null) return ccText;
				var code = this.code(poName, propertyName, value);
				if (code !== null) {
					var tt = this.tag(array(code.texts.text), tag);
					return this.addCachedText(ccKey, tt);
				} else if (value == null || value == "" || value == "0"){
					//0 is a hack, because 0 in codes normaly is the 'empty' string
					return this.addCachedText(ccKey, "");
				} else {
					return this.addCachedText(ccKey, "["+value+"]");
				}
			},
			codeShort: function (poName, propertyName, value) {
				return this.codetext(poName, propertyName, value, "short");
			},
			codeLong: function (poName, propertyName, value) {
				return this.codetext(poName, propertyName, value, "long");
			},
			bind: function (eventName, handler) {
				var handlers = this.registeredEvents[eventName];
				if (handlers == null) {
					handlers = new Array();
					this.registeredEvents[eventName] = handlers;
				}
				handlers.push(handler);
			},
			triggerEvent: function (eventName, eventData) {
				console.log("trigger event "+eventName+" ["+eventData+"]");
				var handlers = this.registeredEvents[eventName];
				if (handlers !== null) {
					for (var i=0;i < handlers.length; i++) {
						console.log("run handler "+handlers[i]+" for event "+eventName+" ["+eventData+"]");
						handlers[i](eventData);
					}
				}
			}
	};
	
	function switchLocale(newLocale) {
		$M.setLocale(newLocale);
	};
