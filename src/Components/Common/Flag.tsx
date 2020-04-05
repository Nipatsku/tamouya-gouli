import * as React from "react";
import { Language } from '../../interfaces'
const countryFlags = require('./countryFlags.json') as CountryInfo[]

interface Props {
    language: Language
    size?: 16 | 24 | 32 | 48 | 64
    style?: 'shiny' | 'flat'
}
interface State {
    id: string | undefined
}
interface CountryInfo {
    short: string
    long: string
}
export class Flag extends React.Component<Props, State> {
    constructor( props: Props ) {
        super( props )
        // Find country flag for language.
        const countryInfo = countryFlags.find( info => props.language.includes( info.short ) )
        this.state = {
            id: countryInfo ? countryInfo.short : undefined
        }
    }
    render() {
        let { language, size, style } = this.props
        const { id } = this.state
        size = size !== undefined ? size : 32
        style = style !== undefined ? style : 'shiny'
        return id ?
            <img src={`https://www.countryflags.io/${id}/${style}/${size}.png`}></img> :
            <div>
                {language} flag not available
            </div>
    }
}
