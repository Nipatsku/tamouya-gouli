
export type Language = string

export interface Result {
    language: Language
    local: string
    translation: string
}

export interface ApplicationState {
    /**
     * Optional!
     */
    inputLanguage: Language,
    /**
     * Optional!
     * Generated with speech to text according to inputLanguage.
     */
    input: string,
    results: Result[]
}
