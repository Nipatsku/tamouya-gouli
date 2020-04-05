// Application logic implementation.
const fs = require('fs')
const speech = require('@google-cloud/speech');
const { TranslationServiceClient } = require('@google-cloud/translate');
const languageCodes = require('../languageCodes.json')
const standardLanguage = 'fi-FI'

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
const getState = ( logger ) => state
const setStateFromFlacFile = async ( logger, fileUrl, inputLanguageCode ) => {
    logger.info(`Set state from FLAC (${fileUrl}) ${inputLanguageCode}`)
    const newState = {
        inputLanguage: getLanguage( inputLanguageCode ),
        input: undefined,
        results: []
    }
    const projectId = process.env.PROJECT_ID
    // Create SpeechToText client.
    const client = new speech.SpeechClient({
        projectId,
        keyFilename: process.env.KEY_FILE
    });
    // Create Translation client.
    const translationClient = new TranslationServiceClient({
        projectId,
        keyFilename: process.env.KEY_FILE
    });
    // Reads a local audio file and converts it to base64
    const file = fs.readFileSync( fileUrl );
    const audioBytes = file.toString('base64');
    // The audio file's encoding, sample rate in hertz, and BCP-47 language code
    const audio = {
        content: audioBytes,
    };
    // Iterate through all supported languages.
    for ( let i = 0; i < languageCodes.length; i += 40 ) {
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
            let [response] = await client.recognize(request);
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
                    const request = {
                        parent: `projects/${projectId}/locations/global`,
                        contents: [selectedSpeech],
                        mimeType: 'text/plain', // mime types: text/plain, text/html
                        sourceLanguageCode: languageCode,
                        targetLanguageCode: standardLanguage,
                    };
                    [response] = await translationClient.translateText(request);
                    const translationTranscription = response.translations
                        .map(result => result.translatedText)
                        .join('\n')
                    logger.info(`Translation Transcription: ${translationTranscription}`)
                    if ( response.translations.length > 0 ) {
                        // Pick one alternative.
                        const selectedTranslation = translationTranscription.split('\n')[0]
                        result.translation = selectedTranslation
                    }
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



exports.getState = getState
exports.setStateFromFlacFile = setStateFromFlacFile
