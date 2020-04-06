import * as React from "react";
import { Language } from '../../interfaces'
const countryFlags = require('./countryFlags.json') as CountryInfo[]
import { Tooltip } from 'antd';

interface Props {
    language: Language
    size?: 16 | 24 | 32 | 48 | 64
    style?: 'shiny' | 'flat'
}
interface State {
    country: CountryInfo | undefined
}
interface CountryInfo {
    short: string
    long: string
}
export class Flag extends React.Component<Props, State> {
    constructor( props: Props ) {
        super( props )
        // Find country flag for language.
        this.state = {
            country: countryFlags.find( info =>
                props.language.Code.includes( info.short ) ||
                // TODO: This doesn't work xd | country name !== language name
                ( info.long.length > 0 && props.language.Name.includes( info.long ) )
            )
        }
    }
    render() {
        let { language, size, style } = this.props
        const { country } = this.state
        size = size !== undefined ? size : 32
        style = style !== undefined ? style : 'shiny'
        const tooltip = country ? country.long : language.Name
        // Doesn't look nice for some reason ...
        // return <Tooltip title={ tooltip }>
        return country ?
                <img className='flag' title={tooltip} src={`https://www.countryflags.io/${country.short}/${style}/${size}.png`}></img> :
                <div className='flag' title={tooltip}>
                    (no flag!)
                </div>
            
        // </Tooltip>
    }
}
