require('dotenv').config()
const express = require('express')
const expressip = require('express-ip');
const fs = require('fs')
const path = require('path');
const { createLogger, transports, format } = require('winston');
const ngrok = require('ngrok')
const application = require('./app')

const logger = createLogger({
    format: format.combine(
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
      format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
    ),
    transports: [
      new transports.File({
        filename: './log.log',
        json: false,
        maxsize: 5242880,
        maxFiles: 5,
      }),
      new transports.Console(),
    ]
});

const app = express()
const port = process.env.PORT
logger.info(`Start server, mode: ${process.env.NODE_ENV}, port: ${port}`)

app.use(expressip().getIpInfoMiddleware);
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", [
      process.env.NODE_ENV === 'development' ?
        "http://localhost:3000" :
        'https://nipatsku.github.io'
    ]);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.get('/u-there', async (req, res) => {
    // Get info about request sender.
    const ipInfo = req.ipInfo
    logger.info( `Received check request\n${JSON.stringify(ipInfo)}` )
    // Respond that we are indeed here.
    setTimeout(() => res.send( 'we here' ), 100)
})
app.get('/state', async (req, res) => {
    res.send( application.getState( logger ) )
})
app.get('/text-to-speech', async (req, res) => {
    const inputText = req.query.text
    const inputLanguageCode = req.query.languageCode
    const mp3Url = await application.useTextToSpeech( logger, inputText, inputLanguageCode )
    if ( ! mp3Url ) {
      res.status( 400 ).send({
        message: 'Unknown error :('
      })
      return
    }
    const filePath = path.join(__dirname, mp3Url);
    res.sendFile( filePath )
    const readStream = fs.createReadStream( filePath );
    readStream.pipe(res);
})
app.get('/unsupported-languages-text-to-speech', async (req, res) => {
  const result = await application.getUnsupportedTextToSpeechLanguages( logger )
  res.send( result )
})

let start

if ( process.env.NODE_ENV === 'production' ) {
  // ngrok.
  ;(async () => {
    const url = await ngrok.connect( port )
    logger.info('\n' + `NGROK ${url}` + '\n')
    start()
    app.listen(port, () => console.log(`Server running with port: ${port}`))
  })()
} else {
  start()
  app.listen(port, () => console.log(`Server running with port: ${port}`))
}

start = () => {
  application.setStateFromText( logger, 'tamouya gouli', 'fi' )
}

// application.setStateFromFlacFile( logger, '../resources/012.flac', 'sr' )

