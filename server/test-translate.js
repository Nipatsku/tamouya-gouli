/**
 * TODO(developer): Uncomment these variables before running the sample.
 */
require('dotenv').config()
const projectId = process.env.PROJECT_ID;
const location = 'global';
const text = 'text to translate';

// Imports the Google Cloud Translation library
const {TranslationServiceClient} = require('@google-cloud/translate');

// Instantiates a client
const translationClient = new TranslationServiceClient({
    projectId: process.env.PROJECT_ID,
    keyFilename: process.env.KEY_FILE
});
async function translateText() {
  // Construct request
  const request = {
    parent: `projects/${projectId}/locations/${location}`,
    contents: [text],
    mimeType: 'text/plain', // mime types: text/plain, text/html
    sourceLanguageCode: 'en',
    targetLanguageCode: 'fi-FI',
  };

  try {
    // Run request
    const [response] = await translationClient.translateText(request);

    for (const translation of response.translations) {
      console.log(`Translation: ${translation.translatedText}`);
    }
  } catch (error) {
    console.error(error.details);
  }
}

translateText();