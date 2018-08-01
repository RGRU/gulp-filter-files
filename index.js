var fs = require('fs');
var through = require('through2');

/**
 * Check the existence of a file
 * @param {string} path Path to a file
 */
var checkExistFile = (path) => path ? fs.existsSync(path) : null;


function filterBy() {
    "use strict";

    /**
     * Working directory
     * @type {string}
     */
    var workingDir = process.cwd();

    /**
     * temp directory
     * @type {string}
     */
    var tempDir = `${workingDir}/temp`;

    /**
     * Storage name
     * @type {string}
     */
    var storageName = 'gulp-filter-files-storage';

    /**
     * Path to storage file
     * @type {string}
     */
    var storagePath = `${tempDir}/${storageName}.json`;

    var dataHandler = function(file, enc, done) {
        var json;
        var ctime = fs.statSync(file.path).ctime.toString();

        // check exist dir
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }

        // check exist file
        if (!checkExistFile(`${storagePath}`)) {
            fs.writeFileSync(`${storagePath}`, JSON.stringify({}), 'utf8')
        }

        // parse json from gulp-filter-files-storage
        json = JSON.parse(fs.readFileSync(`${storagePath}`, 'utf8'));

        if (!json.hasOwnProperty(file.path) || json[file.path] !== ctime) {

            // add file to json
            json[file.path] = ctime;
            // update gulp-filter-files-storage
            fs.writeFileSync(`${storagePath}`, JSON.stringify(json), 'utf8');

            this.push(file);
        }

        done();

    };

    // creating a stream through which each file will pass
    var stream = through.obj(dataHandler);

    // returning the file stream
    return stream;
}

// exporting the plugin main function
module.exports = filterBy;