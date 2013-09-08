var $PsPartner = {
	name: "pss",
	domainURL: $M.getCurrentDomainURL("partner-endpoint", "http://raspi-lolo.dyndns.org:8888", false),
	endPoints: {
		"search" : "/json-restlet-example-web/json-random/search2?",
		"get" : "/json-restlet-example-web/json-random/get2?partnerNr=",
		"query" : "/json-restlet-example-web/json-random/query?queryFields=partnerName,partnerVorname,strasseName,strasseNr,plz,ort,partnerNr,geburtsdatum&query="
	},
	search : function(paramString, callback) {
		$Timer.start();
		$.getJSON(this.domainURL+this.endPoints.search + paramString)
		.done(function(data) {
			$Timer.stop();
			callback(data.response.partnerInfos);
		});
	},
	query : function(queryString, callback) {
		$Timer.start();
		$.getJSON(this.domainURL+this.endPoints.query + queryString)
		.done(function(data) {
			$Timer.stop();
			callback(data.response.partnerInfos);
		});
	},
	get : function(partnerNr, callback) {
		$Timer.start();
		$.getJSON(this.domainURL+this.endPoints.get + partnerNr)
		.done(function(data) {
			$Timer.stop();
			callback(data.response.partnerDetail);
		});
	}
};
