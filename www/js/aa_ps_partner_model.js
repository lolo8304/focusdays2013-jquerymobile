var $PsPartner = {
	name: "pss",
	domainURL: $M.getCurrentDomainURL("partner-endpoint", "http://raspi-lolo.dyndns.org:8888", false),
	endPoints: {
		"search" : "/json-restlet-example-web/json-random/search2?",
		"get" : "/json-restlet-example-web/json-random/get2?partnerNr=",
		"query" : "/json-restlet-example-web/json-random/query?queryFields=partnerName,partnerVorname,strasseName,strasseNr,plz,ort,partnerNr,geburtsdatum&query="
	},
	search : function(paramString, callback) {
		var timer = new Timer(this.name+" search");
		$.getJSON(this.domainURL+this.endPoints.search + paramString)
		.done(function(data) {
			timer.stop();
			callback(data.response.partnerInfos);
		});
	},
	query : function(queryString, callback) {
		var timer = new Timer(this.name+" search");
		$.getJSON(this.domainURL+this.endPoints.query + queryString)
		.done(function(data) {
			timer.stop();
			callback(data.response.partnerInfos);
		});
	},
	get : function(partnerNr, callback) {
		var timer = new Timer(this.name+" search");
		$.getJSON(this.domainURL+this.endPoints.get + partnerNr)
		.done(function(data) {
			timer.stop();
			callback(data.response.partnerDetail);
		});
	}
};
