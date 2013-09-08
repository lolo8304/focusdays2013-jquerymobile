function aa(s) {
	if (s==null) return s;
	var i = s.toLowerCase().indexOf("axa");
	if (i !== -1) {
		return s.substring(0, i+1)+s.substring(i+2);
	}
	return s;
}
function mark(q, s) {
	var i = s.toLowerCase().indexOf(q);
	if (i != -1) {
		s2= s.substr(0, i)+"<mark>"+s.substr(i, q.length)+"</mark>";
		s3 = mark(q, s.substr(i+q.length));
		return s2+s3;
	}
	return s;
}
function unmark(s) {
	return s.replace("<mark>","").replace("</mark>","");
}

var $Timer = {
	startTimeInMs: new Array(),
	elapsedTimeInMs: null,
	start: function() {
		var ms = new Date().getTime();
		this.startTimeInMs.push(ms);
		return ms;
	},
	stop: function(title) {
		this.elapsedTimeInMs = new Date().getTime() - this.startTimeInMs.pop();
		if (title == null) {
			title = "JSON call";
		}
		console.log("Elapsed time "+ title+" = "+this.elapsedTimeInMs+" [ms]");
		return this.elapsedTimeInMs;
	},
	tick: function (title) {
		var ms = this.startTimeInMs.pop();
		this.startTimeInMs.push(ms);
		this.elapsedTimeInMs = new Date().getTime() - ms;
		if (title == null) {
			title = "JSON call";
		}
		console.log("    tick elapsed time "+ title + " = "+this.elapsedTimeInMs+" [ms]");
		return this.elapsedTimeInMs;
	}
};


