'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var File = require('./models/file');

var Exporter = function () {
  function Exporter() {
    _classCallCheck(this, Exporter);
  }

  _createClass(Exporter, [{
    key: 'getMapping',

    /**
     * creates map for all stuff that has to be replaced
     * @param {*} input
     */
    value: function getMapping(input) {
      var mapping = [];
      var counter = 1;
      var sectionCounter = 0;
      var pictureCounter = 1;
      // matches headings, definitions and links
      var matches = input.match(/(#+?\s(\w.*)|{\s?.*:\s(.*?)}|(?:__|[*])|\[(.*?)\]\(.*?\))/g);
      matches.forEach(function (match) {
        // reset counter for each main section
        if (match.startsWith('#') && !match.startsWith('##')) {
          // is h1
          sectionCounter++;
          counter = 1;
          pictureCounter = 1;
        } else if (match.startsWith('[')) {
          // is link
          mapping.push({
            section: sectionCounter,
            footnote: counter,
            type: 'link',
            placeholder: match
          });
          counter++;
        } else if (match.includes('definition:')) {
          // is definition
          mapping.push({
            section: sectionCounter,
            footnote: counter,
            type: 'definition',
            placeholder: match
          });
          counter++;
        } else if (match.includes('citation:')) {
          // is definition
          mapping.push({
            type: 'citation',
            placeholder: match
          });
        } else if (match.includes('picture:')) {
          // is definition
          mapping.push({
            section: sectionCounter,
            type: 'picture',
            placeholder: match,
            number: pictureCounter
          });
          pictureCounter++;
        } else if (match.includes('picturegroup:')) {
          var pictures = match.split(':')[1].replace('}', '').split(',');
          var pics = [];
          pictures.forEach(function (pic) {
            pics.push({ id: pic.trim(), number: pictureCounter });
            pictureCounter++;
          });
          mapping.push({
            section: sectionCounter,
            type: 'picturegroup',
            placeholder: match,
            pictures: pics
          });
        }
      });
      return mapping;
    }

    // dont need definitions, since just the word is used

  }, {
    key: 'resolveMapping',
    value: function resolveMapping(input, mapping) {
      var citations = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
      var pictures = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];

      var markdown = input;
      mapping.forEach(function (token) {
        if (token.type === 'link') {
          var link = token.placeholder.split(']')[0].replace('[', '').trim();
          markdown = markdown.replace(token.placeholder, link + ' (' + token.footnote + ')');
        } else if (token.type === 'definition') {
          var definition = token.placeholder.split(':')[1].replace('}', '').trim();
          markdown = markdown.replace(token.placeholder, definition + ' (' + token.footnote + ')');
        } else if (token.type === 'citation') {
          var shortcut = token.placeholder.split(':')[1].replace('}', '').trim();
          var citation = citations.find(function (cit) {
            return cit.word === shortcut;
          });
          if (citation) {
            markdown = markdown.replace(token.placeholder, '> ' + citation.text + '\n' + citation.author);
          }
        } else if (token.type === 'picture') {
          var _shortcut = token.placeholder.split(':')[1].replace('}', '').trim();
          var picture = pictures.find(function (pic) {
            return pic.word === _shortcut;
          });
          if (picture) {
            markdown = markdown.replace(token.placeholder, '<' + picture.url + '>\nAbb. ' + token.number + ': ' + picture.text);
          }
        } else if (token.type === 'picturegroup') {
          var urls = '';
          var captions = '';
          token.pictures.forEach(function (element) {
            var picture = pictures.find(function (pic) {
              return pic.word === element.id;
            });
            if (picture) {
              urls += '<' + picture.url + '>\n';
              captions += 'Abb. ' + element.number + ': ' + picture.text + '\n';
            }
          });
          markdown = markdown.replace(token.placeholder, urls + captions);
        }
      });
      return markdown;
    }

    /**
     * Expects used definitions in array
     */

  }, {
    key: 'getFootnotes',
    value: function getFootnotes(mapping) {
      var definitonsArr = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

      var output = '';

      var currSection = 0;
      mapping.forEach(function (token) {
        if (token.section && token.section > currSection) {
          currSection = token.section;
          output += '\n# Kapitel ' + currSection + '\n';
        }
        if (token.type === 'link') {
          var url = token.placeholder.split(']')[1].replace('(', '').replace(')', '').trim();
          output += token.footnote + '. ' + url + '\n';
        } else if (token.type === 'definition') {
          // get definition details
          var shortcut = token.placeholder.split(':')[1].replace('}', '').trim();
          var definition = definitonsArr.find(function (def) {
            return def.word === shortcut;
          });
          if (definition) {
            output += token.footnote + '. ' + definition.text + ', ' + definition.author + ', ' + definition.url + '\n';
          }
        }
      });
      return output;
    }
  }]);

  return Exporter;
}();

module.exports = Exporter;