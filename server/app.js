// Application logic implementation.
const fs = require('fs')
const speech = require('@google-cloud/speech');
const { TranslationServiceClient } = require('@google-cloud/translate');
const languageCodes = require('../languageCodes.json')
const projectId = process.env.PROJECT_ID
// Create SpeechToText client.
const speechClient = new speech.SpeechClient({
    projectId,
    keyFilename: process.env.KEY_FILE
});
// Create Translation client.
const translationClient = new TranslationServiceClient({
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
        [response] = await translationClient.translateText(request);
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
    for ( let i = 0; i < languageCodes.length; i += 40 ) {
        logger.info(`${i+1}/${languageCodes.length}`)
        const result = {}
        const language = result.language = languageCodes[i]
        result.translation = inputTranslated
        logger.info(`${language.Name} (${language.Code})`)
        try {
            try {
                result.local = await translate( logger, input, inputLanguage, language )
            } catch ( e ) {
                logger.error(`Error while translating ${e.details} ${e.message}`)
            }
            newState.results.push( result )
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
            let [response] = await speechClient.recognize(request);
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



exports.getState = getState
exports.setStateFromText = setStateFromText
exports.setStateFromFlacFile = setStateFromFlacFile
