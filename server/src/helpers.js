
var archiver = require('archiver')
var fs = require('fs')
var fse = require('fs-extra')
var path = require('path')

const PREVIEW_FOLDER = '../preview'
const TMP_FOLDER = '../tmp'

// returns the path of the preview file
function createPreview (converterObj, userID) {
  return new Promise((resolve, reject) => {
    // copy stuff into preview folder
    var filename = '/preview_' + userID + '.html'
    var outputPath = path.join(__dirname, '../preview', converterObj.type.toLowerCase(), filename)
    fs.writeFile(outputPath, converterObj.page.html(), (err) => {
      if (err) reject(err)
      // success
      resolve(filename)
    })
  })
}

function createBundle (converterObj, userID) {
  return new Promise((resolve, reject) => {
    // input
    var resourcePath = path.join(__dirname, PREVIEW_FOLDER, 'jahresbericht')
    var inCss = path.join(resourcePath, 'style')
    var inJs = path.join(resourcePath, 'js')

    // output
    var destPath = path.join(__dirname, TMP_FOLDER, userID)
    var outIndex = path.join(destPath, 'index.html')
    var outCss = path.join(destPath, 'style')
    var outJs = path.join(destPath, 'js')

    if (!fs.existsSync(destPath)) {
      fs.mkdirSync(destPath)
    }

    var promises = []
    promises.push(writeFile(outIndex, converterObj.page.html()))
    promises.push(copyFolder(inCss, outCss))
    promises.push(copyFolder(inJs, outJs))

    // when all files are written and copied, compress them into zip archive
    Promise.all(promises).then(values => {
      zipFolder(destPath, destPath + '.zip')
      resolve(path.join('tmp', userID + '.zip'))
    })
    .catch(err => reject(err))
  })
}

function copyFolder (inPath, outPath) {
  return new Promise((resolve, reject) => {
    fse.copy(inPath, outPath, function (err) {
      if (err) reject(err)
      resolve()
    })
  })
}

function writeFile (outPath, content) {
  return new Promise((resolve, reject) => {
    fs.writeFile(outPath, content, err => {
      if (err) reject(err)
      resolve()
    })
  })
}

function zipFolder (sourcePath, destPath) {
  var output = fs.createWriteStream(destPath)
  var archive = archiver('zip', {
    store: true // Sets the compression method to STORE.
  })
  archive.pipe(output)
  archive.directory(sourcePath, '')
  archive.finalize()
}

module.exports = {
  createBundle: createBundle,
  createPreview: createPreview
}
