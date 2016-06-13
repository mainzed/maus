/*
	Scroll Library
	Use it that way: a.onclick = Scroller(divID);
	where a.href must be #divID
*/
var scrollSpeed = 50;
var scrollProcess = false;
var ScrollProcess = function(id) {
	var aborted = false;
	var divID = id;
	var scrollStep = function(d,v) {
		if (Math.abs(d) > 1) {
			var s = d>0 ? 1 : -1;
			if (s*d < (v+1)*v/2) {
				--v;
				d = document.getElementById(divID).getBoundingClientRect().top - v*s;
			}
			else if (s*d > (v+2)*(v+1)/2 && v < scrollSpeed && Math.random() > v/scrollSpeed)
				++v;
			var t = 200/(v+4);
			var vs = v*s;
			window.setTimeout(function(){if (!aborted) scrollStep(d-vs,v)},t);
			window.scrollBy(0,vs);
		}
	}
	this.start = function(d) {
		scrollStep(d,1);
	}
	this.stop = function() {
		aborted = true;
		scrollProcess = false;
	}
}
var Scroller = function() {
	var divID = this.href.substring(1+this.href.lastIndexOf('#'));
	var body = document.body || document.getElementsByTagName("body")[0];
	var clientTop = document.documentElement.clientTop || body.clientTop || 0;
	var scrollTop = (window.pageYOffset || document.documentElement.scrollTop || body.scrollTop);
	var d = document.getElementById(divID).getBoundingClientRect().top; //document.getElementById(divID).getBoundingClientRect().top + scrollTop - clientTop;
	if (scrollProcess) {
		scrollProcess.stop();
	}
	scrollProcess = new ScrollProcess(divID);
	scrollProcess.start(d);
	return false;
}