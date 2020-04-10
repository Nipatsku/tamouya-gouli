import * as React from "react";
import { Button, Layout, Typography, Icon, Input, Affix, Tag } from "antd/lib"
const { Title, Text } = Typography
import { Loading } from '../Common/Loading'
import { ApplicationState, Result } from "../../interfaces";
import { Flag } from '../Common/Flag'
import { playAudioStream, readAudioStream, audio } from "../../audio";
import { SoundOutlined } from '@ant-design/icons'
import { LyricsComponent } from '../Lyrics'

const SERVER_ADDRESS = `${process.env.REACT_APP_SERVER_IP}:${process.env.REACT_APP_SERVER_PORT ? process.env.REACT_APP_SERVER_PORT : ''}`
console.log( SERVER_ADDRESS )

interface Props {}
interface State {
    serverState: 'loading' | 'offline' | 'online',
    applicationState: undefined | ApplicationState,
    unsupportedLanguageCodes: undefined | string[]
    bgAudioStart?: number
}
export class MainMenu extends React.Component<Props, State> {
    refSoumah: React.RefObject<HTMLImageElement>
    bgAudio: HTMLAudioElement = new Audio('tamouya_gouli.mp3')
    constructor( props: Props ) {
        super( props )
        this.connect()
        this.refSoumah = React.createRef()
        this.bgAudio.addEventListener( 'play', () => {
            console.log('play')
            this.setState({
                bgAudioStart: window.performance.now()
            })
        } )
        this.bgAudio.play()
        
        this.state = {
            serverState: 'loading',
            applicationState: undefined,
            unsupportedLanguageCodes: undefined
        }
    }
    handleServerError = ( e: Error ) => {
        console.error( e )
        console.log( 'Server offline?' )
        this.setState({ serverState: 'offline' })
    }
    connect() {
        // Check if server is running.
        fetch(
            SERVER_ADDRESS + '/u-there',
            { mode: 'cors' }
        )
            .then( r => r.text() )
            .then( response => {
                // Check expected response.
                if ( response === 'we here' ) {
                    console.log( 'Server online' )
                    this.setState({ serverState: 'online' })
                    // Get active results if any from server.
                    this.getApplicationState()
                }
            } )
            .catch( this.handleServerError )
    }
    getApplicationState() {
        fetch(
            SERVER_ADDRESS + '/state',
            { mode: 'cors' }
        )
            .then( r => r.json() )
            .then( applicationState => {
                this.setState({ applicationState })
                this.sortUnsupportedTextToSpeech()
            } )
            .catch( this.handleServerError )
    }
    sortUnsupportedTextToSpeech() {
        fetch(
            SERVER_ADDRESS + '/unsupported-languages-text-to-speech',
            { mode: 'cors' }
        )
            .then( r => r.json() )
            .then( ( unsupportedLanguages: { languageCode: string }[] ) => {
                console.log(unsupportedLanguages)
                this.setState({
                    unsupportedLanguageCodes: unsupportedLanguages.map( obj => obj.languageCode )
                })
            } )
            .catch( this.handleServerError )
    }
    first = true
    onAnyClick = () => {
        // Hack - iPhone restricts playing audio that is not based on user interaction.
        // Audio.play() must be called (once for element) directly in event handler for it to work.
        if (this.first) {
            audio.play()
            this.bgAudio.play()
            this.first = false
        }
    }
    playResultSound( result: Result ) {
        this.onAnyClick()

        fetch(
            SERVER_ADDRESS + `/text-to-speech?text=${result.local}&languageCode=${result.language.Code}`
        )
            .then( readAudioStream)
            .then( playAudioStream )
            .catch( e => {
                console.error( e )
            })
    }
    componentDidMount() {
        // MLG animations.
        const animate = ( ) => {
            // const soumah = this.refSoumah.current
            const objects = document.getElementsByClassName('soumah')
            // if ( soumah ) {
            for ( let i = 0; i < objects.length; i ++ ) {
                const soumah = objects[i] as any
                const attr_index = soumah.getAttribute('index')
                const attr_scale = soumah.getAttribute('scale')
                const t = 2.0 * ((window.performance.now( ) + attr_index * 1500) - tStart) / 1000

                let rotateX: number = 0
                let rotateY: number = 0
                let rotateZ: number = -10 + Math.sin( t ) * 5
                let skewX: number = 0
                let skewY: number = Math.sin( t ) * 12
                let scale: number = 1 + Math.sin( t * 2 ) * .15
                let translateX: number = -100 + Math.sin( t ) * 150
                let translateY: number = 40 + Math.abs( Math.sin( t ) ) * 100

                let transform = ``
                transform += `translateX(${translateX}px) translateY(${translateY}px) `
                transform += `skewX(${skewX}deg) skewY(${skewY}deg) `
                transform += `rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) ` 
                transform += `scaleX(${scale}) scaleY(${scale}) `
                if ( attr_scale )
                    transform += `scaleX(${attr_scale}) scaleY(${attr_scale}) `
                soumah.style.transform = transform
            }
            requestAnimationFrame( animate )
        }
        const tStart = window.performance.now()
        animate()
    }
    avatars = [
        {
            scale: 1, src: ['momo.png', 'merkit.png', 'baretti.png']
        },
        // { scale: .6, src: [ 'https://img.pngio.com/donald-trump-united-states-republican-party-face-mask-bill-donald-trump-face-png-1846_2496.png' ] }
    ]
    render() {
        const { serverState } = this.state
        return <div className='expand' onClick={() => this.onAnyClick()}>
            <div className='backgroundDiv' onClick={() => this.onAnyClick()}>
                <img
                     onClick={() => this.onAnyClick()}
                    className='background'
                    src='wandelsoumah_bg.png'
                />
                <span className='hint'>If music is not playing, click somewhere</span>
                {this.avatars.map((avatar, i) => {
                    const props = { scale: avatar.scale, index: i }
                    return avatar.src.map((url, i2) => <img
                        key={i+'a'+i2}
                        className='soumah'
                        src={url}
                        {...props}
                        onClick={() => this.onAnyClick()}
                ></img>)
                })}
                {this.state.bgAudioStart && <div className='lyrics-div'>
                    <LyricsComponent
                        lyricsFile='lyrics.json'
                        tStart={this.state.bgAudioStart}
                    />
                </div>}
            </div>
            {serverState === 'loading' ?
                <Loading/> :
                <div className='main'>
                    {serverState === 'offline' ?
                        <Text>Server is offline... more "aamuja" some other time</Text> :
                        this.renderServerOnline()
                    }
                </div>
            }
        </div>
    }
    renderServerOnline() {
        const { applicationState } = this.state
        return <div>
            { applicationState && this.renderApplicationState( applicationState ) }
        </div>
    }
    renderApplicationState( applicationState: ApplicationState ) {
        const { unsupportedLanguageCodes } = this.state
        const { inputLanguage, input, results } = applicationState
        // Sort rendered results so that unsupported languages are last.
        const isResultSupported = ( result: Result ): boolean =>
            unsupportedLanguageCodes === undefined ||
            ! unsupportedLanguageCodes.includes( result.language.Code )
        const sortedResults = results.filter( isResultSupported )
            .concat( results.filter( result => ! isResultSupported( result ) ) )

        return <div className='column'>
            <Title level={3}>Official translations for...</Title>
            <div className='row listStart'>
                <Text className='speechAsText'>"{input}"</Text>
            </div>
            {sortedResults.map(( result, i ) =>
                <div className='row' key={i}>
                    <Text>{result.language.Name}:</Text>
                    <Text className='speechAsText'>{result.local}</Text>
                    {isResultSupported( result ) && <SoundOutlined onClick={() => this.playResultSound( result )} />}
                    { inputLanguage === result.language &&
                        <Text>({result.translation})</Text>
                    }
                </div>
            )}
        </div>
    }
}