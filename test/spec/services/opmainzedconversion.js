'use strict';

describe('Service: OpMainzedConversion', function () {

  // load the service's module
  beforeEach(module('meanMarkdownApp'));

  // instantiate service
  var OpMainzedConversion;

  beforeEach(inject(function (_OpMainzedConversion_) {
    OpMainzedConversion = _OpMainzedConversion_;
  }));

  it('should do something', function () {
    expect(!!OpMainzedConversion).toBe(true);
  });

  it('should inherite filetype from parent', function () {
    var conversion = new OpMainzedConversion();
    expect(conversion.filetype).toBeDefined();
    expect(conversion.filetype).toBe("opMainzed");
  });

  describe("getHtmlFromMarkdown()", function() {
    var conversion;
    beforeEach(function() {
        conversion = new OpMainzedConversion();
    });

    it("should return html", function() {
        var markdown = "This is **markdown**!";
        var expected = '<p>This is <strong>markdown</strong>!</p>\n';
        expect(conversion.getHtmlFromMarkdown(markdown)).toEqual(expected);
    });

    it("should return custom rendered headers", function() {
        var markdown = ["# heading 1",
                        "## heading 1-1",
                        "### heading 1-1-1",
                        "# heading 2"].join("\n");
        var expected = ['<h1 id="section-1">heading 1</h1>',
                        '<h2 id="section-1-1">heading 1-1</h2>',
                        '<h3 id="section-1-1-1">heading 1-1-1</h3>',
                        '<h1 id="section-2">heading 2</h1>',
                        ].join("");
        expect(conversion.getHtmlFromMarkdown(markdown)).toEqual(expected);
    });

    it("should return custom rendered links", function() {
        var markdown = '[google](http://www.google.de)';
        var expected = '<p><a href="http://www.google.de" class="external-link" target="_blank">google</a></p>\n';
        expect(conversion.getHtmlFromMarkdown(markdown)).toEqual(expected);
    });

  })








});
