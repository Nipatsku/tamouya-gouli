import React, { MouseEvent } from 'react'
const fs = require('fs')

export interface Line {
    text: string,
    start: number
    records: Record[]
}
export interface Record {
    index: number,
    delta: number
}
export type Lyrics = Line[]

interface Props {
    audioIn: string
    lyricsIn: string 
}
interface State {
    lyricsRaw?: string,
    tStart?: number,
    lyrics: Lyrics,
    cur?: Line,
    curDiv?: HTMLDivElement
}
export class LyricsGenerator extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props)
        fetch( this.props.lyricsIn )
            .then( r => r.text() )
            .then( text => {
                console.log(`loaded raw lyrics ${text}`)
                this.setState({ lyricsRaw: text })
            } )
        const audio = new Audio()
        audio.src = this.props.audioIn
        audio.playbackRate = 0.5
        setTimeout(() => {
            audio.play()
            this.setState({
                tStart: window.performance.now()
            })
        }, 1000)
        this.state = {
            lyricsRaw: undefined,
            tStart: undefined,
            lyrics: [],
            cur: undefined
        }

        document.addEventListener('click', (e) => {
            if ( this.state.cur ) {
                // export.
                console.log(this.state.lyrics)
                console.log(JSON.stringify( this.state.lyrics ))
            }
        })
        document.addEventListener('mouseover', (e) =>  {
            const curElement = e.target as HTMLSpanElement
            if ( curElement && 'className' in curElement && (curElement as any).className === 'char' ) {
                const lineDiv = curElement.parentNode as HTMLDivElement
                const startNew = () => {
                    const cur = {
                        text: [...lineDiv.getElementsByClassName('char') as any].map(span=>span.innerHTML).join(''),
                        start: (window.performance.now() - this.state.tStart!),
                        records: []
                    }
                    this.state.lyrics.push( cur )
                    console.log(cur)
                    this.setState({
                        cur,
                        curDiv: lineDiv
                    })
                }
                if ( this.state.cur ) {
                    if ( lineDiv !== this.state.curDiv ) {
                        // stop.
                        startNew()
                    }
                    const newRecord = {
                        index: [...lineDiv.getElementsByClassName('char') as any].indexOf( curElement ),
                        delta: ( window.performance.now() - this.state.cur.start )
                    }
                    this.state.cur.records.push( newRecord )
                    console.log(newRecord)
                } else {
                    startNew()
                }
            }
        });
    }

    render() {
        const { lyricsRaw } = this.state
        return lyricsRaw ?
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                width: '100vw',
                marginLeft: '16px',
                marginTop: '16px',
                marginBottom: '16px',
                overflow: 'hidden'
            }}>
                {lyricsRaw.split('\n').map((line, i) => {
                    const chars = []
                    for ( let i2 = 0; i2 < line.length; i2 ++ ) {
                        chars[i2] = line.charAt(i2)
                    }
                    return <div
                        style={{
                            paddingTop: '50px',
                            paddingBottom: '50px',
                            fontSize: '16px',
                            fontWeight: 'bold'
                        }}
                    >
                        {chars.map((char) => <span className='char'>
                            {char}
                        </span> )}
                    </div>
                })
                }
            </div>
            : <span>vittu</span>
    }

}
