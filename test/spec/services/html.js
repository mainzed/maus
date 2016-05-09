'use strict';

describe('Service: HTMLService', function () {
    var service;

    // load the service's module
    beforeEach(module('meanMarkdownApp'));

    // instantiate service
    beforeEach(inject(function (_HTMLService_) {
        service = _HTMLService_;
    }));

    it('should be defined', function () {
        expect(service).toBeDefined();
    });

    describe('OLAT functions', function() {

        describe('replaceStoryTags()', function() {

            it('should return same html given simple paragraph', function() {
                var html = "<p>test</p>";
                var result = "<p>test</p>";
                expect(service.replaceStoryTags(html)).toBe(result);
            });

            it('should replace tags with breaks before and after', function() {
                var html =  "<p>story{</p>\n" +
                            "<p>test</p>\n" + 
                            "<p>}story</p>";

                var result =    "<div class=\"story\" id=\"story1\">\n" +
                                "<p>test</p>\n" + 
                                "</div>";
                expect(service.replaceStoryTags(html)).toBe(result);
            });

            it('should replace multiple tags', function() {
                var html =  "<p>story{</p>\n" +
                            "<p>first paragraph</p>\n" + 
                            "<p>}story</p>\n" +
                            "<p>story{</p>\n" +
                            "<p>second paragraph</p>\n" + 
                            "<p>}story</p>";

                var result =    "<div class=\"story\" id=\"story1\">\n" +
                                "<p>first paragraph</p>\n" + 
                                "</div>\n" + 
                                "<div class=\"story\" id=\"story2\">\n" +
                                "<p>second paragraph</p>\n" + 
                                "</div>";
                expect(service.replaceStoryTags(html)).toBe(result);
            });
        }),

        describe('createLinksTable()', function() {
            
            it('given linksArray should return div containing a list of all links', function() {
                
                //var html = "some text before <a href='www.google.de'>Google</a> some text after";
                var linksArray = [
                    {
                        url: "www.google.de",
                        text: "Google"
                    },{
                        url: "www.google2.de",
                        text: "Google2"
                    } 
                ];
                var result =    "<div id=\"links-table\" class=\"links-table\">\n" + 
                                "<h4>Links</h4>\n" + 
                                "<ul>\n" +
                                "<li><a href=\"www.google.de\" target=\"_blank\">Google</a></li>\n" +
                                "<li><a href=\"www.google2.de\" target=\"_blank\">Google2</a></li>\n" +
                                "</ul>\n" + 
                                "</div>";

                expect(service.createLinksTable(linksArray)).toEqual(result);
            });
        
        });

        describe('createImagesTable()', function() {
            
            it('given imagesArray should return div containing a list of all images', function() {
                var imagesArray = [
                    {
                        url: "www.google.de",
                        caption: "This is the caption",
                        author: "John Doe",
                        license: "CC123",
                        title: "Test-Image",
                        preCaption: "Abb.1"
                    }

                ];
                var table =    "<div id=\"images-table\" class=\"images-table\">\n" + 
                                "<h4>Abbildungen</h4>\n" + 
                                "<ul>\n" +
                                "<li>\n" + 
                                "Abb.1<br>\n" +
                                "Test-Image<br>\n" +
                                "John Doe<br>\n" +
                                "CC123<br>\n" +
                                "<a href=\"www.google.de\" target=\"_blank\">Quelle</a>\n" +
                                "</li>\n" + 
                                "</ul>\n" + 
                                "</div>";

                expect(service.createImagesTable(imagesArray)).toEqual(table);
            });

            it('given image without author and license should ommit them', function() {
                var imagesArray = [
                    {
                        url: "www.google.de",
                        caption: "This is the caption",
                        //author: "John Doe",
                        //license: "CC123",
                        title: "Test-Image",
                        preCaption: "Abb.1"
                    }

                ];
                var table =    "<div id=\"images-table\" class=\"images-table\">\n" + 
                                "<h4>Abbildungen</h4>\n" + 
                                "<ul>\n" +
                                "<li>\n" + 
                                "Abb.1<br>\n" +
                                "Test-Image<br>\n" +
                                //"John Doe<br>\n" +
                                //"CC123<br>\n" +
                                "<a href=\"www.google.de\" target=\"_blank\">Quelle</a>\n" +
                                "</li>\n" + 
                                "</ul>\n" + 
                                "</div>";

                expect(service.createImagesTable(imagesArray)).toEqual(table);
            });
        
        });

        describe('getOlat()', function() {
            var file;
            var fileWithLinks;

            beforeEach(function() {
                file = {
                    title: "Test File",
                    author: "John Doe",
                    type: "opOlat",
                    markdown:   "# heading 1\n" + 
                                "This is **markdown**!"
                };

                fileWithLinks = {
                    title: "Test File",
                    author: "John Doe",
                    type: "opOlat",
                    markdown:   "# heading 1\n" + 
                                "This is **markdown**!\n\n" +
                                "[Google](www.google.de)" 
                };




            });

            it("should return markdown content as html", function(done) {
                 
                var config = {
                    addTitle: false,
                    addContentTable: false,
                    addImagesTable: false,
                    addLinksTable: false
                };

                var expected =  '<h1 id="h1-1">heading 1</h1>\n' + 
                                '<p>This is <strong>markdown</strong>!</p>\n';

                setTimeout(function() {
                    service.getOlat(file, config, function(html) {
                        expect(html).toEqual(expected);
                        done();  // async
                    });
                }, 1);
                
            });

            it("should add title to html", function(done) {

                var config = {
                    addTitle: true,
                    addContentTable: false,
                    addImagesTable: false,
                    addLinksTable: false
                };
               
                var expected =  '<h1 class="page-title" id="page-title">Test File</h1>\n' +
                                '<h1 id="h1-1">heading 1</h1>\n' + 
                                '<p>This is <strong>markdown</strong>!</p>\n';

                setTimeout(function() {
                    service.getOlat(file, config, function(html) {
                        expect(html).toEqual(expected);
                        done();
                    });
                }, 1);
            });

            it("should add table of content to html", function(done) {

                var config = {
                    addTitle: false,
                    addContentTable: true,
                    addImagesTable: false,
                    addLinksTable: false
                };
               
                var expected =  '<div id="headings-table" class="headings-table">\n' +
                                '<ul>\n' + 
                                '<li><a href="#h1-1">heading 1</a></li>\n' + 
                                '</ul>\n' +
                                '</div>\n' +

                                '<h1 id="h1-1">heading 1</h1>\n' + 
                                '<p>This is <strong>markdown</strong>!</p>\n';

                setTimeout(function() {
                    service.getOlat(file, config, function(html) {
                        expect(html).toEqual(expected);
                        done();
                    });
                }, 1);
            });

            it("should add table of content with links to html", function(done) {

                var config = {
                    addTitle: false,
                    addContentTable: true,
                    addImagesTable: false,
                    addLinksTable: true
                };
               
                var expected =  '<div id="headings-table" class="headings-table">\n' +
                                '<ul>\n' + 
                                '<li><a href="#h1-1">heading 1</a></li>\n' + 
                                '<li class=\"seperator\"></li>\n' +
                                '<li><a href="#links-table">Links</a></li>\n' + 
                                '</ul>\n' +
                                '</div>\n' +

                                '<h1 id="h1-1">heading 1</h1>\n' + 
                                '<p>This is <strong>markdown</strong>!</p>\n' + 
                                '<p><a href="www.google.de" target="_blank">Google</a></p>\n' +

                                // links table
                                '<div id="links-table" class="links-table">\n' +
                                '<h4>Links</h4>\n' +
                                '<ul>\n' +
                                '<li><a href="www.google.de" target="_blank">Google</a></li>\n' +
                                '</ul>\n' +
                                '</div>';

                setTimeout(function() {
                    service.getOlat(fileWithLinks, config, function(html) {
                        expect(html).toEqual(expected);
                        done();
                    });
                }, 1);
            });


        }); 
    });

    describe('MainzedPresentation functions', function() {

        describe('getMainzedPresentation()', function() {
            var file;
            beforeEach(function() {
                file = {
                    title: "Test File",
                    author: "John Doe",
                    type: "opOlat",
                    markdown:   "# heading 1\n" + 
                                "This is markdown!"
                };
            });

            it("should return html", function() {
                var expected =  "<div class=\"slide\" id=\"slide1\">\n" +
                                '<h1 id="h1-1">heading 1</h1>\n' +
                                "<p>This is markdown!</p>\n" +
                                "</div>";

                expect(service.getMainzedPresentation(file)).toEqual(expected);

            });
        });
        
    });

});
