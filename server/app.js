// Application logic implementation.
const fs = require('fs')
const speech = require('@google-cloud/speech');
const { TranslationServiceClient } = require('@google-cloud/translate');
const textToSpeech = require('@google-cloud/text-to-speech');
const languageCodes = require('../languageCodes.json')
const projectId = process.env.PROJECT_ID
// Create SpeechToText client.
const gSpeechToText = new speech.SpeechClient({
    projectId,
    keyFilename: process.env.KEY_FILE
});
// Create Translation client.
const gTranslation = new TranslationServiceClient({
    projectId,
    keyFilename: process.env.KEY_FILE
});
// Create text to speech client.
const gTextToSpeech = new textToSpeech.TextToSpeechClient({
    projectId,
    keyFilename: process.env.KEY_FILE
});
const getLanguage = ( code ) => languageCodes.find( info => info.Code === code )
let state = {
    inputLanguage: getLanguage('en-GB'),
    input: 'aamyebloeaaa',
    results: [
        {
            language: getLanguage('en-GB'),
            local: 'this is fokin shit mate',
            translation: 'vittu mitä paskaa'
        }
    ]
}
const standardLanguage = getLanguage( 'fi' )
const translate = async ( logger, input, inputLanguage, outputLanguage ) => {
    if ( inputLanguage === outputLanguage ) {
        return input
    }
    try {
        const request = {
            parent: `projects/${projectId}/locations/global`,
            contents: [input],
            mimeType: 'text/plain', // mime types: text/plain, text/html
            sourceLanguageCode: inputLanguage.Code,
            targetLanguageCode: outputLanguage.Code,
        };
        [response] = await gTranslation.translateText(request);
        const translationTranscription = response.translations
            .map(result => result.translatedText)
            .join('\n')
        logger.info(`Translation Transcription: ${translationTranscription}`)
        if ( response.translations.length > 0 ) {
            // Pick one alternative.
            const selectedTranslation = translationTranscription.split('\n')[0]
            return selectedTranslation
        }
    } catch ( e ) {
        logger.error(`Error while translating ${e.details} ${e.message}`)
    }
}
const getState = ( logger ) => state
const setStateFromText = async ( logger, input, inputLanguageCode ) => {
    logger.info(`Set state from TEXT (${input}) ${inputLanguageCode}`)
    const inputLanguage = getLanguage( inputLanguageCode )
    const newState = {
        inputLanguage,
        input,
        results: []
    }
    // Translate to standard language.
    let inputTranslated
    try {
        inputTranslated = await translate( logger, input, inputLanguage, standardLanguage )
    } catch ( e ) {
        logger.error(`Error while translating ${e.details} ${e.message}`)
    }
    // Iterate through all supported languages.
    for ( let i = 0; i < languageCodes.length; i ++ ) {
        logger.info(`${i+1}/${languageCodes.length}`)
        const result = {}
        const language = result.language = languageCodes[i]
        result.translation = inputTranslated
        logger.info(`${language.Name} (${language.Code})`)
        try {
            try {
                result.local = await translate( logger, input, inputLanguage, language )
                newState.results.push( result )
            } catch ( e ) {
                logger.error(`Error while translating ${e.details} ${e.message}`)
            }
        } catch ( e ) {
            logger.error(`Error while translating ${e.details} ${e.message}`)
        }
    }

    logger.info(`New state: ${JSON.stringify( newState )}`)
    state = newState
}
const setStateFromFlacFile = async ( logger, fileUrl, inputLanguageCode ) => {
    logger.info(`Set state from FLAC (${fileUrl}) ${inputLanguageCode}`)
    const newState = {
        inputLanguage: getLanguage( inputLanguageCode ),
        input: undefined,
        results: []
    }
    // Reads a local audio file and converts it to base64
    const file = fs.readFileSync( fileUrl );
    const audioBytes = file.toString('base64');
    // The audio file's encoding, sample rate in hertz, and BCP-47 language code
    const audio = {
        content: audioBytes,
    };
    // Iterate through all supported languages.
    for ( let i = 0; i < languageCodes.length; i ++ ) {
        logger.info(`${i+1}/${languageCodes.length}`)
        const result = {}
        const languageCodeInfo = result.language = languageCodes[i]
        const languageCode = languageCodeInfo.Code
        logger.info(`${languageCodeInfo.Name} (${languageCodeInfo.Code})`)
        try {
            const config = {
                encoding: 'FLAC',
                languageCode
            };
            const request = {
                audio,
                config: config,
            };
            // Detects speech in the audio file
            let [response] = await gSpeechToText.recognize(request);
            const speechTranscription = response.results
                .map(result => result.alternatives[0].transcript)
                .join('\n');
            logger.info(`Speech Transcription: ${speechTranscription}`);
            let len = response.results.length
            if ( len > 0 ) {
                // Pick one alternative.
                const selectedSpeech = speechTranscription.split('\n')[0]
                result.local = selectedSpeech
                // Check if language was same as input language.
                if ( languageCode === inputLanguageCode ) {
                    // Mark transcription.
                    newState.input = selectedSpeech
                }
                // Translate to standard language.
                try {
                    result.translation = await translate( logger, selectedSpeech, languageCode, standardLanguage )
                } catch ( e ) {
                    logger.error(`Error while translating ${e.details} ${e.message}`)
                }
                newState.results.push( result )
            }
        } catch ( e ) {
            logger.error(`Error while transcribing speech to text ${e.details} ${e.message}`)
        }
    }

    logger.info(`New state: ${JSON.stringify( newState )}`)
    state = newState
}
const useTextToSpeech = async ( logger, inputText, inputLanguageCode ) => {
    logger.info(`Text to speech (${inputText}) ${inputLanguageCode}`)
    const fileName = `./temp/${inputLanguageCode}_${inputText}.mp3`
    // Check if file exists.
    if ( fs.existsSync( fileName ) ) {
        // return fileName
    }
    // Construct the request
    // TODO: https://cloud.google.com/text-to-speech
    // pitch, pauses, pronunciation, speed, voice profile...

    const pitch = -20 + Math.random() * 40
    let rand = Math.random()
    const speakingRate =  .25 + rand
    const volumeGainDb = Math.random() * 6

    rand = Math.random()
    const request = {
        input: {text: inputText},
        // Select the language and SSML voice gender (optional)
        voice: {languageCode: inputLanguageCode, ssmlGender: rand < .33 ? 'MALE' : rand ? 'NEUTRAL' : 'FEMALE'}, // MALE, NEUTRAL, FEMALE
        // select the type of audio encoding
        audioConfig: {audioEncoding: 'MP3', pitch, speakingRate, volumeGainDb},
    };
    logger.info( JSON.stringify(request) )
    // Performs the text-to-speech request
    let response
    try {
        ;[response] = await gTextToSpeech.synthesizeSpeech(request);
    } catch ( e ) {
        logger.error(`Error while synthesizing text to speech`)
        logger.error(`${e.message}`)
        return
    }
    try {
        // Write the binary audio content to a local file
        fs.writeFileSync( fileName, response.audioContent, 'binary' )
    } catch ( e ) {
        logger.error(`Error while writing audio to file`)
        logger.error(`${e.message}`)
        return
    }
    return fileName
}



exports.getState = getState
exports.setStateFromText = setStateFromText
exports.setStateFromFlacFile = setStateFromFlacFile
exports.useTextToSpeech = useTextToSpeech
