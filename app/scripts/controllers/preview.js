'use strict';

/**
 * @ngdoc function
 * @name meanMarkdownApp.controller:PreviewCtrl
 * @description
 * # PreviewCtrl
 * Controller of the meanMarkdownApp
 */
angular.module('meanMarkdownApp')
  .controller('PreviewCtrl', function ($scope, markdownService) {

  	$scope.file = {};
    
    if (markdownService.getMarkdown().length > 0) {  // markdown exists

    	// convert markdown
		var customRenderer = new marked.Renderer();

		// custom heading renderer
		var counter = 0;
		customRenderer.heading = function (text, level) {
		 	var escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
		 	counter++;

		  	return '<h' + level + ' id="h' + level + '-'+ counter + '">' + text + '</h' + level + '>';
		};




		// create OLAT mhtl
		var markdown = markdownService.getMarkdown();
 		var html = marked(markdown, { renderer: customRenderer });
 		
 		$scope.html = html;


 		// if links exist, create table of links
 		var links = getLinksFromHtml(html);

 		if (links.length) {
 			var linksTable = createLinksTable(links);
 			$scope.html = html + linksTable;
 		}
 		


    } else {
    	$scope.html = "<p>Nothing to preview!</p>";
    }
    
    // returns html containing table of links
    // requires array containing link objects
	function createLinksTable(links) {
		var html = "";
		html += "<div id='links'>Links\n<ul>\n";
		for (var key in links) {
			var link = links[key];
			html += "<li><a href='" + link.url + "'>" + link.title + "</a></li>\n";
		}
		html += "</ul>\n</div>";

		return html;
	}

	/**
	 * returns an array that contains all links
	 */
	function getLinksFromMarkdown() {
		var links = [];
		var markdown = markdownService.getMarkdown();	
		var matches = markdown.match(/\[(.*?)\)/g);  // 'g' makes it return all matches
	
		// TODO: skip images
		
		if (matches) {
			matches.forEach(function(link){
				var linkTitle = link.match(/\[([^)]+)\]/g);
				console.log(linkTitle);

				var linkUrl = link.match(/\(([^)]+)\)/g);
				console.log(linkUrl);
				links.push({
					title: linkTitle,
					url: linkUrl
				});
			});
		}
		return links;
	}

	function getLinksFromHtml(html) {
		var links = [];
		
		var matches = html.match(/\<a(.*?)\<\/a\>/g);  // 'g' makes it return all matches
	
		// TODO: skip images
		
		if (matches) {
			matches.forEach(function(link){

				// skip links with tooltips!
				console.log(link.match(/title=([^)]+)\>/g));
				

				var linkText = link.match(/\>([^)]+)\</g)[0].replace("<", "").replace(">", "");
				console.log(linkText);
				var linkUrl = link.match(/\"([^)]+)\"/g)[0].replace('"', "").replace('"', "");
				console.log(linkUrl);
				links.push({
					text: linkText,
					url: linkUrl,
					title: ""
				});
			});
		}
		return links;
	}
  	
  });


