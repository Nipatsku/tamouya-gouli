// Application logic implementation.

let state = {
    /**
     * Optional!
     */
    inputLanguage: 'en-GB',
    /**
     * Optional!
     * Generated with speech to text according to inputLanguage.
     */
    input: 'aamyebloeaaa',
    results: [
        {
            language: 'en-GB',
            local: 'this is fokin shit mate',
            translation: 'vittu mitä paskaa'
        }
    ]
}
const getState = () => state




exports.getState = getState
