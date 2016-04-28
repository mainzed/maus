'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var archivedFileSchema = new Schema({
    fileID: String,
    author: String,
    title: String,
    markdown: String,
    type: String,
    created_at: { type: Date, default: Date.now }

});

var ArchivedFile = module.exports = mongoose.model('ArchivedFile', archivedFileSchema);

/*module.exports.getFiles = function(callback, limit) {
    File.find(callback).limit(limit);
};

module.exports.getFileById = function(id, callback) {
    File.findById(id, callback);
};

module.exports.addFile = function(file, callback) {
    File.create(file, callback);
};

module.exports.updateFile = function(id, file, callback) {
    //console.log("updating player " + player.name + " at ID: " + id);
    // builds a query object with id=providedID, could also be name=specificname
    var query = {
        _id: id
        //name: "specificName"
    };

    // build an updated player object out of the provided object in parameters
    // could also just use the parameter object directly (var update = player;)
    // but this way I can only apply selected attributes and ignore others
    // but: "ALL ATTRIBUTES IN UPDATE HAVE TO BE ASSIGNED IN THE JSON, IT CANNOT BE UNDEFINED"
    var update = {
        author: file.author,
        title: file.title,
        type: file.type,
        markdown: file.markdown
    };

    File.findOneAndUpdate(query, update, callback);
};

module.exports.deleteFile = function(id, callback) {
    var query = {
        _id: id
    };
    File.remove(query, callback);
};
*/