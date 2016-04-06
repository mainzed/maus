'use strict';

/**
 * @ngdoc function
 * @name meanMarkdownApp.controller:PreviewCtrl
 * @description
 * # PreviewCtrl
 * Controller of the meanMarkdownApp
 */
angular.module('meanMarkdownApp')
  .controller('PreviewCtrl', function ($scope, temporaryService) {

  	$scope.file = {};
    
    if (temporaryService.getMarkdown().length > 0) {  // markdown exists

    	// convert markdown
		var customRenderer = new marked.Renderer();

		// custom heading renderer
		var counter = 0;
		customRenderer.heading = function (text, level) {
		 	var escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
		 	counter++;

		  	return '<h' + level + ' id="h' + level + '-'+ counter + '">' + text + '</h' + level + '>';
		};




		// create OLAT
		var markdown = temporaryService.getMarkdown();
 		var html = marked(markdown, { renderer: customRenderer });
 		
 		$scope.html = html;


 		// if links exist, create table of links
 		var links = getLinks(html);
 		//console.log(html);
 		//console.log(links);
 		if (links.length) {
 			var linksTable = createLinksTable(links);
 			var definitionsTable = createDefinitionsTable(links);
 			$scope.html = html + linksTable + definitionsTable;
 		}
 		


    } else {
    	$scope.html = "<p>Nothing to preview!</p>";
    }
    
    // returns html containing table of links
    // requires array containing link objects
	function createLinksTable(links) {
		var counter = 0;
		var html = "";
		html += "<div id='links-table'>Links\n<ul>\n";
		for (var key in links) {
			var link = links[key];
			var title = link[3];
			var text = link[2];
			var url = link[1];
			if (!title) {  // skip links with titles (definitions)
				html += "<li><a href='" + url + "'>" + text + "</a></li>\n";
				counter++;
			}
		}
		html += "</ul>\n</div>";

		if (counter < 1) {
			return "";
		} else {
			return html;
		}
	}

	function createDefinitionsTable(links) {
		var counter = 0; 
		var html = "";
		html += "<div id='definitions-table'>Definitions\n<ul>\n";
		for (var key in links) {
			var link = links[key];
			var title = link[3];
			var text = link[2];
			var url = link[1];
			if (title) {  // skip links with titles (definitions)
				html += "<li><a href='" + url + "'>" + text + "</a></li>\n";
				counter++;
			}
		}
		html += "</ul>\n</div>";

		
		if (counter < 1) {
			return "";
		} else {
			return html;
		}
	}

	/**
	 * returns an array that contains all links
	 */
	/*function getLinksFromMarkdown() {
		var links = [];
		var markdown = temporaryService.getMarkdown();	
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
	}*/

	function getLinks(html) {
	    var container = document.createElement("p");
	    container.innerHTML = html;

	    var anchors = container.getElementsByTagName("a");
	    var list = [];

	    for (var i = 0; i < anchors.length; i++) {
	        var href = anchors[i].href;
	        var title = anchors[i].title;
	        var text = anchors[i].textContent;

	        if (text === undefined) text = anchors[i].innerText;

	        list.push(['<a href="' + href + '">' + text + '</a>', href, text, title]);
	    }

	    return list;
	}

	$scope.onOlatClick = function() {
		console.log("trigger!");
        if (temporaryService.getMarkdown().length > 0) {
            var html = marked(temporaryService.getMarkdown());
            if (html !== undefined) {

                // attach body to html
                var content =   "<html>\n" +
                                "  <head>\n" +
                                "  </head>\n"+
                                "  <body>\n" +
                                html + 
                                "  </body>\n"+
                                "</html>\n";

                // trigger download
	            var blob = new Blob([content], { type:"data:text/plain;charset=utf-8;" });           
	            var downloadLink = angular.element('<a></a>');
	            downloadLink.attr('href', window.URL.createObjectURL(blob));
	            downloadLink.attr('download', 'export.html');
	            downloadLink[0].click();

            }

        } else {
            console.log("no markdown available! start editing something or choose existing file");
        }

    };
  	
  });


