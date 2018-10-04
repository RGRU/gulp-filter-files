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
     * Check production environment
     * @type {boolean}
     */
    var isProd = process.argv.some(item => /env\s?=\s?prod/g.test(item));

    /**
     * Environment
     * @type {string}
     */
    var env = isProd ? 'prod' : 'dev';

    /**
     * Check off-ff argument
     * @type {boolean}
     */
    var isFilterOff = process.argv.some(item => /off-ff|force/g.test(item));

    var isClear = process.argv.some(item => /clear/g.test(item));

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
        var mtime = fs.statSync(file.path).mtime.toString();
        var ctime = fs.statSync(file.path).ctime.toString();

        // check exist dir
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }

        // check clear param
        if (isClear) {
            // clear storage file
            fs.writeFileSync(`${storagePath}`, JSON.stringify({}), 'utf8');
            return false
        }

        // check exist file
        if (!checkExistFile(`${storagePath}`)) {
            fs.writeFileSync(`${storagePath}`, JSON.stringify({}), 'utf8');
        }

        // parse json from gulp-filter-files-storage
        json = JSON.parse(fs.readFileSync(`${storagePath}`, 'utf8'));

        // creating empty object
        if (!json[file.path] || typeof json[file.path] === 'string') {
            json[file.path] = {};
        }

        // create mtime, ctime object
        if (!json[file.path][env]) {
            json[file.path][env] = {
                mtime: null,
                ctime: null
            }
        }

        if (
            isFilterOff ||
            json[file.path][env].mtime !== mtime ||
            json[file.path][env].ctime !== ctime ||
            !json.hasOwnProperty(file.path)
        ) {

            // add file to json
            json[file.path][env].mtime = mtime;
            json[file.path][env].ctime = ctime;

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