'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var File = require('../models/file');

var activeFileSchema = new Schema({
    fileID: String,
    users: []
},{
    timestamps: true  // creates updatedAt and createdAt
});

var ActiveFile = module.exports = mongoose.model('ActiveFile', activeFileSchema);

// check for avtivity status every couple minutes
setInterval(function() {
    //console.log("refreshing active state");


    // get all active files
    ActiveFile.find(function(err, activeFiles) {

        // find according file
        activeFiles.forEach(function(activeFile) {
            //console.log(activeFile);
            File.findById(activeFile.fileID, function(err, file) {
                // check when file was last edited and by whom
                //console.log(file.updatedAt);

                if (file.updatedAt) {
                    var now = new Date();
                    var minutesSinceLastEdit = Math.round((now.getTime() - file.updatedAt.getTime()) / 1000 / 60);
                    var minutesSinceSetActive = Math.round((now.getTime() - activeFile.updatedAt.getTime()) / 1000 / 60);

                    // TODO: remove idle users (file has been changed, but not by the user)

                    // if file has been active for 20 minutes, and no changes have been made within
                    // these last 20 minutes
                    if (minutesSinceSetActive > 20 && minutesSinceLastEdit > 20) {
                        console.log("file hasnt been changed within last 20 minutes, removing file from actives");
                        var query = {
                            _id: activeFile._id
                        };
                        ActiveFile.remove(query, function() {
                            console.log("removed file from actives!");
                        });
                    }
                }

            });
        });

    });
}, 5000);
