import React from 'react'
import { Lyrics } from '../Components/LyricsGenerator/LyricsGenerator'

interface Props {
    lyricsFile: string
    tStart: number
}
interface State {
    lyrics?: Lyrics,
    t: number
}
export class LyricsComponent extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props)
        fetch(this.props.lyricsFile)
            .then(r => r.json())
            .then((lyrics: Lyrics) => {
                this.setState({ lyrics })
                console.log(lyrics)
            })
        this.state = {
            lyrics: undefined,
            t: 0
        }
    }
    componentDidMount() {
        const setTime = () => {
            const t = window.performance.now() - this.props.tStart
            this.setState({ t: t * 2 }) // hardcoded 50% speed !
            requestAnimationFrame( setTime )
        }
        requestAnimationFrame( setTime )
    }

    render() {
        const { lyrics, t } = this.state
        if ( !lyrics ) {
            return <div></div>
        }
        
        // Find first line to show.
        const firstShownLine = lyrics.slice().reverse().find(line => line.start < t)
        if ( !firstShownLine ) {
            return <div></div>
        }
        const lines = [
            firstShownLine
        ]
        if ( lyrics.indexOf( firstShownLine ) < lyrics.length - 1 ) {
            lines.push( lyrics[lyrics.indexOf( firstShownLine ) + 1] )
        }
        return <div className='lines-div'>
            {lines.map(( line, i ) => {
                const refRecord = line.records.find(record =>
                    record.delta + line.start - 1500 >= t    
                )
                return <div className='lyrics-line-div'>
                    <span className='lyrics-line'>{ line.text }
                        <div className='lyrics-highlight'
                            style={{
                                width: refRecord && line === firstShownLine ?
                                    `${100 * refRecord.index / line.text.length}%` :
                                    '0px'
                            }}
                        ></div>
                    </span>
                </div>
            })}
        </div>
    }

}