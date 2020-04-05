const gulp = require('gulp');
const fs = require('fs')
const replace = require('gulp-replace')



// ********** Build **********
const content = require('./content/content.js')
const buildPath = './public'
const buildContentPath = `${buildPath}/content`
const buildNamesJson = './.buildnames.json'
const getNextBuildName = () => {
    let buildNames = require(buildNamesJson)
    // Pick random name from 'buildNames.names', that is not equal to 'buildNames.previous'.
    const previous = buildNames.previous
    buildNames = buildNames.names
    if (buildNames.includes(previous))
        buildNames.splice(buildNames.indexOf(previous), 1)
    const buildName = buildNames[Math.round(Math.random() * (buildNames.length - 1))]
    // Mark buildNames.previous.
    if (previous.length > 0)
        buildNames.push(previous)
    fs.writeFileSync(
        buildNamesJson,
        JSON.stringify({
            previous: buildName,
            names: buildNames
        })
    )
    return buildName
}
const getBuildName = () => {
    const buildNames = require(buildNamesJson)
    return buildNames.previous
}
const buildClean = () => new Promise(function(resolve, reject) {
    fs.readdir(buildPath, (err, files) => {
        if (err) throw err
        for (const file of files) {
            fs.unlinkSync(`${buildPath}/${file}`)
        }
    })
    resolve()
})
gulp.task('build-clean', buildClean)
const buildContent = () => new Promise(function(resolve, reject) {
    const buildName = getNextBuildName()
    if (!fs.existsSync(buildPath))
        fs.mkdirSync(buildPath)
    if (!fs.existsSync(buildContentPath))
        fs.mkdirSync(buildContentPath)
    
    // Copy content/index.html to public/index.html
    gulp.src('content/index.html')
        .pipe(replace(/VERSION/g, buildName))
        .pipe(gulp.dest(buildPath))

    var songs = content.songs
    // Write out song contents to individual files.
    var list = []
    for (var song of songs) {
        const { id, name, artist, versions } = song
        if (name.length == 0)
            continue
        
        const fileName = `${artist}_${name}`
            .replace(/\s/g, '_')
            .replace(/,|\'|\.|\(|\)|\:|\&/g, '')
            .toLowerCase()
            + '.json'
        const url = `${fileName}`
        list.push({
            id,
            name,
            artist,
            url
        })
        fs.writeFileSync(
            `${buildContentPath}/${fileName}`,
            JSON.stringify({
                id,
                name,
                artist,
                url,
                versions
            })
        )
    }
    // Write song list.
    fs.writeFileSync(
        `${buildContentPath}/list.json`,
        JSON.stringify(list)
    )
    resolve()
})
gulp.task('build-content', gulp.series('build-clean', buildContent))
const buildWatch = () => new Promise(function(resolve, reject) {
    const watcher = gulp.watch(['content/content.js'])
    console.log('Watching content.')
    watcher.on('change', function(path, stats) {
        console.log('Rebuilding content...')
        buildContent()
            .then(() => console.log('Content ready.'))
    })
})
gulp.task('build-watch', gulp.series('build-content', buildWatch))
const buildLog = () => new Promise(function(resolve, reject) {
    console.log(`
Build name: ${getBuildName()}
`)
    resolve()
})
gulp.task('build-log', buildLog)
gulp.task('default', buildContent)
