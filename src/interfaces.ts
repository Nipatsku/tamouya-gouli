
export type Language = {
    Name: string,
    Code: string
}

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
