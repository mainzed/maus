'use strict';

describe('Service: MetadataService', function () {

  // load the service's module
  beforeEach(module('meanMarkdownApp'));

  // instantiate service
  var MetadataService;
  beforeEach(inject(function (_MetadataService_) {
    MetadataService = _MetadataService_;
  }));

  it('should do something', function () {
    expect(!!MetadataService).toBe(true);
  });

  it('should do something', function () {
    expect(!!MetadataService).toBe(true);
  });

  it('should do something', function () {
    expect(!!MetadataService).toBe(true);
  });

  it("should extract title and clean markdown", function() {
      var markdown = "@title: Title1\n# heading 1\nThis is markdown!";
      var expected = '# heading 1\nThis is markdown!';
      var result = MetadataService.getAndReplace(markdown);

      expect(result.title).toEqual("Title1");
      expect(result.markdown).toEqual(expected);
  });

  it("should extract author and clean markdown", function() {
      var markdown = "@author: John Doe\n# heading 1\nThis is markdown!";
      var expected = '# heading 1\nThis is markdown!';

      var result = MetadataService.getAndReplace(markdown);

      expect(result.author).toEqual("John Doe");
      //expect(result.author).toEqual("John Doe");
      expect(result.markdown).toEqual(expected);
  });

  it("should extract dates and clean markdown", function() {
      var markdown = "@created: 05.05.2015\n@updated: 06.05.2015\n# heading 1\nThis is markdown!";
      var expected = '# heading 1\nThis is markdown!';

      var result = MetadataService.getAndReplace(markdown);

      expect(result.created).toEqual("05.05.2015");
      expect(result.updated).toEqual("06.05.2015");
      expect(result.markdown).toEqual(expected);
  });

  it("should extract cover-description and clean markdown", function() {
      var markdown = [
        "@cover-description: some description",
        "# heading 1",
        "This is markdown!"
      ].join("\n");

      var expected = [
        "# heading 1",
        "This is markdown!"
      ].join("\n");

      var result = MetadataService.getAndReplace(markdown);

      expect(result.coverDescription).toEqual("some description");
      expect(result.markdown).toEqual(expected);
  });

});
