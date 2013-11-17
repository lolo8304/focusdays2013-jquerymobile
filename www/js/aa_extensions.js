
String.prototype.endsWithChar = function(ch) {
	return this.length >= 1 && this[this.length - 1] == ch;
};
String.prototype.startsWithChar = function(ch) {
	return this.length >= 1 && this[0] == ch;
};

String.prototype.endsWith = function(chars) {
	return this.indexOf(chars, this.length - chars.length) !== -1;
};

String.prototype.startsWith = function(chars) {
	return this.indexOf(chars) == 0;
};

String.prototype.aa = function(){ 
	var i = this.toLowerCase().indexOf("axa");
	if (i !== -1) {
		return this.substring(0, i+1)+this.substring(i+2);
	}
	return this;
};

String.prototype.mark = function(q) {
	q = q.trim();
	if (q == "") return this;
	if (q.indexOf(' ') !== -1) {
		var qList = q.trim().split(" ");
		var i;
		var s2 = this;
		for (i = 0; i < qList.length; ++i) {
		    s2 = s2.mark(qList[i]);
		}
		return s2;
	}
	var i = this.toLowerCase().indexOf(q);
	if (i != -1) {
		s2= this.substr(0, i)+"<mark>"+this.substr(i, q.length)+"</mark>";
		s3 = this.substr(i+q.length).mark(q);
		return s2+s3;
	}
	return this;
};

String.prototype.unmark = function() {
	return this.replace("<mark>","").replace("</mark>","");
};


function Timer(title) {
	this.title = title;
	this.startTimeInMs = null;
	this.startTimeLastTickInMs = null;
	this.elapsedTimeInMs = null;
	this.elapsedTimeLastTickInMs = null;
	
	this.start = function() {
		var ms = new Date().getTime();
		this.startTimeInMs = ms;
		this.startTimeLastTickInMs = ms;
		return ms;
	};
	this.stop = function() {
		var ms = new Date().getTime();
		this.elapsedTimeInMs = ms - this.startTimeInMs;
		this.startTimeLastTickInMs = ms;
		if (title == null) {
			title = "JSON call";
		}
		console.log("Elapsed time "+ this.title+" = "+this.elapsedTimeInMs+" [ms]");
		return this.elapsedTimeInMs;
	},
	this.tick = function (tickTitle) {
		var ms = new Date().getTime();
		this.elapsedTimeLastTickInMs = ms - this.startTimeLastTickInMs;
		this.startTimeLastTickInMs = ms;
		if (title == null) {
			title = "JSON call";
		}
		console.log("    tick elapsed time "+ this.title + " / "+ tickTitle +" = "+this.elapsedTimeLastTickInMs+" [ms]");
		return this.elapsedTimeInMs;
	};
};


