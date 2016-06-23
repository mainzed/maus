'use strict';

describe('Service: HTMLService', function () {
    var service;
    var httpBackend;
    var definitionService;

    // load the service's module
    beforeEach(module('meanMarkdownApp'));

    // instantiate service
    beforeEach(inject(function (_HTMLService_, _$httpBackend_, _definitionService_) {
        service = _HTMLService_;
        httpBackend = _$httpBackend_;
        definitionService = _definitionService_;
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
        });

        describe('createLinksTable()', function() {

            it('given linksArray should return div containing a list of all links', function() {

                //var html = "some text before <a href='www.google.de'>Google</a> some text after";
                var linksArray = [
                    {
                        url: "www.google.de",
                        text: "Google"
                    }, {
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

        describe('createDefinitionsTable()', function() {
            beforeEach(function () {
                // mock definitions request
                httpBackend.when("GET", "/api/definitions")  // has to be same url that is used in service
                    .respond(200, [{
                                    _id: "571725cd5c6b2bd90ed10b6e",
                                     word: "google",
                                    __v: 0,
                                    url: "www.google.de",
                                    text: "This is the google description!",
                                    updated_at: "2016-04-20T06:46:37.887Z",
                                    author: "John Doe"
                            }, {
                                    _id: "571725cd5c6b2bd90ed10b6f",
                                     word: "duckduck",
                                    __v: 0,
                                    text: "This is the duck description!",
                                    updated_at: "2016-04-20T06:46:37.887Z",
                                    author: "John Doe"
                            }]);
            });

            afterEach(function() {
                try {
                    httpBackend.flush();
                    httpBackend.verifyNoOutstandingExpectation();
                    httpBackend.verifyNoOutstandingRequest();
                } catch(e) {
                    // statements
                    //console.log(e);
                }
            });

            it('should return div containing all definitions', inject(function(definitionService) {
                var expected = "<div id=\"definitions-table\" class=\"definitions-table\">\n" +
                                "<h4>Glossar</h4>\n" +
                                "<ul>\n" +

                                // google
                                "<li>\n" +
                                "<a href=\"#\" target=\"_blank\" class=\"definition\" title=\"This is the google description!\">google</a> (<a href=\"www.google.de\" target=\"_blank\">website</a>)\n" +
                                "</li>\n" +

                                // duckduck
                                "<li>\n" +
                                "<a href=\"#\" target=\"_blank\" class=\"definition\" title=\"This is the duck description!\">duckduck</a>\n" +
                                "</li>\n" +

                                "</ul>\n" +
                                "</div>\n";


                definitionService.query(function(definitions) {

                    var outputHtml = service.createDefinitionsTable(definitions, ["571725cd5c6b2bd90ed10b6e", "571725cd5c6b2bd90ed10b6f"]);

                    expect(definitions[0].word).toEqual("google");
                    expect(definitions[1].word).toEqual("duckduck");

                    expect(outputHtml).toEqual(expected);
                });
            }));

            it('should return only contain definitions used in text', inject(function(definitionService) {
                var usedDefs = ["571725cd5c6b2bd90ed10b6f"];
                var expected = "<div id=\"definitions-table\" class=\"definitions-table\">\n" +
                                "<h4>Glossar</h4>\n" +
                                "<ul>\n" +
                                // only duckduck
                                "<li>\n" +
                                "<a href=\"#\" target=\"_blank\" class=\"definition\" title=\"This is the duck description!\">duckduck</a>\n" +
                                "</li>\n" +

                                "</ul>\n" +
                                "</div>\n";


                definitionService.query(function(definitions) {

                    var outputHtml = service.createDefinitionsTable(definitions, usedDefs);

                    expect(definitions.length).toEqual(2);

                    expect(outputHtml).toEqual(expected);
                });
            }));

            /*it('should return empty string when no definition used in text', inject(function(definitionService) {
                //var usedDefs = [];
                var expected = "<div id=\"definitions-table\" class=\"definitions-table\">\n" +
                                "<h4>Glossar</h4>\n" +
                                "<ul>\n" +
                                // only duckduck
                                "<li>\n" +
                                "<a href=\"#\" target=\"_blank\" class=\"definition\" title=\"This is the duck description!\">duckduck</a>\n" +
                                "</li>\n" +

                                "</ul>\n" +
                                "</div>\n";


                definitionService.query(function(definitions) {
                    expect(definitions.length).toEqual(2);
                    var outputHtml = service.createDefinitionsTable(definitions);
                    console.log(outerHTML);
                    expect(outputHtml).toEqual(2);
                });
            }));*/
        });

        describe('replaceDefinitionTags()', function() {


            beforeEach(function () {
                // mock definitions request
                httpBackend.when("GET", "/api/definitions")  // has to be same url that is used in service
                    .respond(200, [{
                                    _id: "571725cd5c6b2bd90ed10b6e",
                                     word: "definition",
                                    __v: 0,
                                    url: "www.google.de",
                                    text: "This is the definition description!",
                                    updated_at: "2016-04-20T06:46:37.887Z",
                                    filetype: "opOlat",
                                    category: "definition",
                                    author: "John Doe"
                            }]);
            });

            afterEach(function() {
                try {
                    httpBackend.flush();
                    httpBackend.verifyNoOutstandingExpectation();
                    httpBackend.verifyNoOutstandingRequest();
                } catch(e) {
                    // statements
                    //console.log(e);
                }

            });

            it('should mock get request', inject(function(definitionService) {

                definitionService.query(function(definitions) {
                    // gets sync mocked, so no done() needed!
                    expect(definitions.length).toEqual(1);
                    expect(definitions[0].word).toEqual("definition");
                    expect(definitions[0].text).toEqual("This is the definition description!");
                });

            }));

            it('should return input html when no definition in text', inject(function(definitionService) {
                var inputHtml = "<p>This string without a definition!</p>";
                var page = $("<div>" + inputHtml + "</div>");

                definitionService.query(function(definitions) {
                    // gets sync mocked, so no done() needed!
                    service.replaceDefinitionTags(page, definitions);

                    //expect(definitions[0].word).toEqual("definition");
                    expect($(page).html()).toEqual(inputHtml);
                });
            }));

        });

        describe('getOlat()', function() {
            var file;
            var fileWithLinks;
            var fileWithDefinitions;

            beforeEach(function () {
                // mock definitions request
                httpBackend.when("GET", "/api/definitions")  // has to be same url that is used in service
                    .respond(200, [{
                                    _id: "571725cd5c6b2bd90ed10b6e",
                                     word: "definition",
                                    __v: 0,
                                    url: "www.google.de",
                                    text: "This is the definition description!",
                                    updated_at: "2016-04-20T06:46:37.887Z",
                                    author: "John Doe"
                            }]);

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

                fileWithDefinitions = {
                    title: "Test File",
                    author: "John Doe",
                    type: "opOlat",
                    markdown:   "# heading 1\n" +
                                "This is a {definition}!\n\n" +
                                "[Google](www.google.de)"
                };
            });

            afterEach(function() {
                try {
                    httpBackend.flush();
                    httpBackend.verifyNoOutstandingExpectation();
                    httpBackend.verifyNoOutstandingRequest();
                } catch(e) {
                    // statements
                    //console.log(e);
                }
            });

            // it("should return markdown content as html", inject(function(definitionService) {
            //
            //     var config = {
            //         addTitle: false,
            //         addContentTable: false,
            //         addImagesTable: false,
            //         addLinksTable: false
            //     };
            //
            //     var expected =  '<h1 id="h1-1">heading 1</h1>\n' +
            //                     '<p>This is <strong>markdown</strong>!</p>\n';
            //
            //     definitionService.query(function(definitions) {
            //         // gets sync mocked, so no done() needed!
            //
            //         var outputHtml = service.getOlat(file, definitions, config);
            //
            //         expect(definitions.length).toEqual(1);
            //         expect(outputHtml).toEqual(expected);
            //     });
            // }));

            // it("should add title to html", inject(function(definitionService) {
            //
            //     var config = {
            //         addTitle: true,
            //         addContentTable: false,
            //         addImagesTable: false,
            //         addLinksTable: false
            //     };
            //
            //     var expected =  '<h1 class="page-title" id="page-title">Test File</h1>\n' +
            //                     '<h1 id="h1-1">heading 1</h1>\n' +
            //                     '<p>This is <strong>markdown</strong>!</p>\n';
            //
            //     definitionService.query(function(definitions) {
            //         // gets sync mocked, so no done() needed!
            //
            //         var outputHtml = service.getOlat(file, definitions, config);
            //
            //         expect(definitions.length).toEqual(1);
            //         expect(outputHtml).toEqual(expected);
            //     });
            // }));

            it("should add table of content to html", inject(function(definitionService) {

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

                definitionService.query(function(definitions) {
                    // gets sync mocked, so no done() needed!

                    var outputHtml = service.getOlat(file, definitions, config);

                    expect(definitions.length).toEqual(1);
                    expect(outputHtml).toEqual(expected);
                });
            }));

            it("should add table of definitions to html", inject(function(definitionService) {

                var config = {
                    addTitle: false,
                    addContentTable: true,
                    addImagesTable: false,
                    addLinksTable: false,
                    addDefinitionsTable: true
                };

                var expected =  '<div id="headings-table" class="headings-table">\n' +
                                '<ul>\n' +
                                '<li><a href="#h1-1">heading 1</a></li>\n' +
                                '<li class=\"seperator\"></li>\n' +
                                '<li><a href="#definitions-table">Glossar</a></li>\n' +
                                '</ul>\n' +
                                '</div>\n' +

                                '<h1 id="h1-1">heading 1</h1>\n' +
                                '<p>This is a <a href=\"#definitions-table\" title=\"This is the definition description!\" class=\"definition\">definition</a>!</p>\n' +
                                '<p><a href="www.google.de" target="_blank">Google</a></p>\n' +

                                // definitions table
                                '<div id="definitions-table" class="definitions-table">\n' +
                                '<h4>Glossar</h4>\n' +
                                '<ul>\n' +
                                '<li>\n' +
                                '<a href="#" target="_blank" class="definition" title="This is the definition description!">definition</a> (<a href="www.google.de" target="_blank">website</a>)\n' +
                                '</li>\n' +
                                '</ul>\n' +
                                '</div>\n';

                definitionService.query(function(definitions) {
                    var outputHtml = service.getOlat(fileWithDefinitions, definitions, config);
                    expect(definitions.length).toEqual(1);
                    expect(outputHtml).toEqual(expected);
                });
            }));

            it("should only add used used definitions", inject(function() {

                /*var config = {
                    addTitle: false,
                    addContentTable: true,
                    addImagesTable: false,
                    addLinksTable: false,
                    addDefinitionsTable: true
                };

                var expected =  '<div id="headings-table" class="headings-table">\n' +
                                '<ul>\n' +
                                '<li><a href="#h1-1">heading 1</a></li>\n' +
                                '<li class=\"seperator\"></li>\n' +
                                '<li><a href="#definitions-table">Glossar</a></li>\n' +
                                '</ul>\n' +
                                '</div>\n' +

                                '<h1 id="h1-1">heading 1</h1>\n' +
                                '<p>This is a <a href=\"#definitions-table\" title=\"This is the definition description!\" class=\"definition\">definition</a>!</p>\n' +
                                '<p><a href="www.google.de" target="_blank">Google</a></p>\n' +

                                // definitions table
                                '<div id="definitions-table" class="definitions-table">\n' +
                                '<h4>Glossar</h4>\n' +
                                '<ul>\n' +
                                '<li>\n' +
                                '<a href="#" target="_blank" class="definition" title="This is the definition description!">definition</a> (<a href="www.google.de" target="_blank">website</a>)\n' +
                                '</li>\n' +
                                '</ul>\n' +
                                '</div>\n';

                definitionService.query(function(definitions) {
                    var outputHtml = service.getOlat(fileWithDefinitions, definitions, config);
                    expect(definitions.length).toEqual(1);
                    expect(outputHtml).toEqual(expected);
                });*/
            }));
        });  // end getOlat()

        describe('wrapOlatHtml()', function() {
            it('should wrap content', function() {
                var inputHtml = "<p>This is a paragraph</p>";
                var title = "Test";
                var expected = '<!DOCTYPE html>\n' +
                                '<html lang="de">\n' +
                                '<head>\n' +
                                '<title>Test</title>\n' +
                                '<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />\n' +
                                '<meta property="dc:creator" content="Kai Christian Bruhn, Matthias Dufner, Thomas Engel, Axel Kunz" />\n' +
                                '<link rel="stylesheet" href="style/olat.css">\n' +
                                '</head>\n' +
                                '<body>\n' +
                                inputHtml + "\n" +
                                '<script src="https://code.jquery.com/jquery-2.2.3.min.js"></script>\n' +
                                '<script src="javascript/app.js"></script>\n' +
                                '</body>\n' +
                                '</html>';

                var outputHtml = service.wrapOlatHTML(inputHtml, title);

                expect(outputHtml).toEqual(expected);
            });

            it('should wrap content with styles in subfolder', function() {
                var inputHtml = "<p>This is a paragraph</p>";
                var title = "Test";
                var isFolder = true;
                var expected = '<!DOCTYPE html>\n' +
                                '<html lang="de">\n' +
                                '<head>\n' +
                                '<title>Test</title>\n' +
                                '<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />\n' +
                                '<meta property="dc:creator" content="Kai Christian Bruhn, Matthias Dufner, Thomas Engel, Axel Kunz" />\n' +
                                '<link rel="stylesheet" href="../style/olat.css">\n' +
                                '</head>\n' +
                                '<body>\n' +
                                inputHtml + "\n" +
                                '<script src="https://code.jquery.com/jquery-2.2.3.min.js"></script>\n' +
                                '<script src="javascript/app.js"></script>\n' +
                                '</body>\n' +
                                '</html>';

                var outputHtml = service.wrapOlatHTML(inputHtml, title, isFolder);

                expect(outputHtml).toEqual(expected);
            });

        });
    }); // end OLAT

    describe('MainzedPresentation functions', function() {

        describe('getPrMainzed()', function() {
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

                expect(service.getPrMainzed(file)).toEqual(expected);

            });
        });

    });

    describe('replaceEnrichmentTags() for opMainzed', function() {

        it('should replace definition tag', function() {
            var enrichments = [
                {
                    _id: "571725cd5c6b2bd90ed10b6e",
                     word: "someDefinedWord",
                    __v: 0,
                    url: "www.google.de",
                    text: "This is the definition description!",
                    updated_at: "2016-04-20T06:46:37.887Z",
                    filetype: "opMainzed",
                    category: "definition",
                    author: "John Doe"
                }
            ];

            // make jQuery compatible
            var page = $('<div><div id="read"><p>String with a {definition: someDefinedWord}!</p></div><div id="footnotes"></div></div>');

            //var inputHtml = "<p>String with a {definition: someDefinedWord}!</p>";  // string is not a defined definition

            var expected = "<div id=\"read\"><p>String with a <span id=\"" + enrichments[0]._id + "\" class=\"shortcut\">" + enrichments[0].word + "</span>!</p>" +
            "</div><div id=\"footnotes\"><div class=\"" + enrichments[0]._id + "\">" +
            "<h4>" + enrichments[0].word + "</h4><p>" + enrichments[0].text + "</p>\n</div>\n</div>";

            //page = $("<div>" + inputHtml + "</div>");

            service.replaceEnrichmentTags(page, enrichments);

            expect($(page).html()).toBe(expected);

            //expect($)

        });

        it('should replace picture tag', function() {
            var enrichments = [
                {
                    _id: "571725cd5c6b2bd90ed10b6e",
                     word: "pic1",
                    __v: 0,
                    url: "www.some-picture.com",
                    text: "This is the caption.",
                    title: "This is the alt",
                    updated_at: "2016-04-20T06:46:37.887Z",
                    filetype: "opMainzed",
                    category: "picture",
                    author: "John Doe"
                }
            ];

            // make jQuery compatible
            var page = $('<div><div id="read">{picture: pic1}</div></div>');

            var expected = '<div id="read"><figure>\n<img src="www.some-picture.com" class="picture" alt="' + enrichments[0].title + '">\n<figcaption>\n' + enrichments[0].text + '</figcaption>\n</figure></div>';

            service.replaceEnrichmentTags(page, enrichments);

            expect(enrichments.length).toBe(1);
            expect($(page).html()).toBe(expected);

        });

        it('should replace picturegroup tag', function() {
            var enrichments = [
                {
                    _id: "571725cd5c6b2bd90ed10b6e",
                     word: "pic1",
                    __v: 0,
                    url: "www.some-picture.com",
                    text: "This is the caption.",
                    title: "This is the alt",
                    updated_at: "2016-04-20T06:46:37.887Z",
                    filetype: "opMainzed",
                    category: "picture",
                    author: "John Doe"
                },{
                    _id: "571725cd5c6b2bd90ed10b6e",
                     word: "pic2",
                    __v: 0,
                    url: "www.some-other-picture.com",
                    text: "This is the caption.",
                    title: "This is the alt",
                    updated_at: "2016-04-20T06:46:37.887Z",
                    filetype: "opMainzed",
                    category: "picture",
                    author: "John Doe"
                }
            ];

            // make jQuery compatible
            var page = $('<div><div id="read">{picturegroup: pic1, pic2}</div></div>');

            var expected = '<div id="read"><div class="picturegroup">' +

            // figure 1
            '<figure>\n<img src="' + enrichments[0].url + '" class="picture" alt="' + enrichments[0].title + '">\n<figcaption>\n' + enrichments[0].text + '</figcaption>\n</figure>' +

            // figure 2
            '<figure>\n<img src="' + enrichments[1].url + '" class="picture" alt="' + enrichments[1].title + '">\n<figcaption>\n' + enrichments[1].text +

            '</figcaption>\n</figure>' +
            '</div></div>';

            service.replaceEnrichmentTags(page, enrichments);

            expect($(page).html()).toBe(expected);

        });


    });

    describe("replaceEnrichmentTags() for opOlat", function() {
        it('should replace definition tag', function() {
            var enrichments = [
                {
                    _id: "571725cd5c6b2bd90ed10b6e",
                     word: "someDefinedWord",
                    __v: 0,
                    url: "www.google.de",
                    text: "This is the definition description!",
                    updated_at: "2016-04-20T06:46:37.887Z",
                    filetype: "opOlat",
                    category: "definition",
                    author: "John Doe"
                }
            ];

            // make jQuery compatible
            var page = $('<div><p>String with a {definition: someDefinedWord}!</p></div>');

            var expected = '<p>String with a <a href="#definitions-table" title="' + enrichments[0].text + '" class="definition">' + enrichments[0].word + '</a>!</p>';

            service.replaceEnrichmentTags(page, enrichments);

            expect(enrichments.length).toBe(1);
            expect($(page).html()).toBe(expected);

        });

        it('should replace legacy syntax definition tag for olat', function() {
            var enrichments = [
                {
                    _id: "571725cd5c6b2bd90ed10b6e",
                     word: "legacyDefinition",
                    __v: 0,
                    url: "www.google.de",
                    text: "This is the legacy definition description!",
                    updated_at: "2016-04-20T06:46:37.887Z",
                    filetype: "opOlat",
                    category: "definition",
                    author: "John Doe"
                }
            ];

            // make jQuery compatible
            var page = $('<div><p>String with a {legacyDefinition}!</p></div>');

            var expected = '<p>String with a <a href="#definitions-table" title="' + enrichments[0].text + '" class="definition">' + enrichments[0].word + '</a>!</p>';

            service.replaceEnrichmentTags(page, enrichments);

            expect(enrichments.length).toBe(1);
            expect($(page).html()).toBe(expected);

        });
    });


        // it('should replace story tag for opOlat', function() {
        //     var enrichments = [
        //         {
        //             _id: "571725cd5c6b2bd90ed10b6e",
        //              word: "story1",
        //             __v: 0,
        //             text: "story text!",
        //             updated_at: "2016-04-20T06:46:37.887Z",
        //             filetype: "opOlat",
        //             category: "story",
        //             author: "John Doe"
        //         }
        //     ];
        //
        //     var inputHtml = "content before story {story: story1} content after!";  // string is not a defined definition
        //     var expected = "content before story <div class=\"story\" id=\"story1\">story text!</div> content after!";
        //
        //     var outputHtml = service.replaceEnrichmentTags(inputHtml, enrichments);
        //
        //     expect(enrichments.length).toBe(1);
        //     expect(outputHtml).toBe(expected);
        //
        // });

        /*it('should replace definition tag',function() {

            var inputHtml = "<p>This string with a {definition: def1}!</p>";
            var expected = "<p>This string with a <a href=\"#definitions-table\" title=\"This is the definition description!\" class=\"definition\">someDefinedWord</a>!</p>";
            var outputHtml;
            var definitions = definitionService.query();

            var outputHtml = service.replaceDefinitionTags(inputHtml, definitions);
            //done();
            //expect(definitions[0].word).toEqual("someDefinedWord");
            //console.log(definitions);

            expect(outputHtml).toEqual(expected);

            //expect(1).toBe(2);
            //console.log("done!");

        });*/

});
