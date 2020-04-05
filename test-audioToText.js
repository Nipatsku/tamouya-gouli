async function main() {
    require('dotenv').config()
    const speech = require('@google-cloud/speech');
    const fs = require('fs');
    const languageCodes = require('./languageCodes.json')
  
    // Creates a client
    const client = new speech.SpeechClient({
        projectId: process.env.PROJECT_ID,
        keyFilename: process.env.KEY_FILE
    });
  
    // The name of the audio file to transcribe
    const fileName = '012';
    const fileFormat = 'flac'
    const inFile = `./resources/${fileName}.${fileFormat}`
  
    // Reads a local audio file and converts it to base64
    const file = fs.readFileSync( inFile );
    const audioBytes = file.toString('base64');

    // The audio file's encoding, sample rate in hertz, and BCP-47 language code
    const audio = {
      content: audioBytes,
    };

    for ( let i = 0; i < languageCodes.length ; i ++ ) {
        const languageCode = languageCodes[i]
        console.log( `${i}/${languageCodes.length-1} | ${languageCode}` )
        const config = {
            encoding: 'FLAC',
            languageCode
        };
        const request = {
        audio: audio,
        config: config,
        };
    
        // Detects speech in the audio file
        const [response] = await client.recognize(request);
        const transcription = response.results
            .map(result => result.alternatives[0].transcript)
            .join('\n');
        console.log(`Transcription: ${transcription}`);
    
        const outFile = `./output/${fileName}_${languageCode}.json`
        console.log(`Writing to ${outFile} ...`)
        fs.writeFileSync( outFile, JSON.stringify( transcription ) )
    }

}
main().catch(console.error);