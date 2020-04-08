import * as React from "react";
import { Button, Layout, Typography, Icon, Input, Affix, Tag } from "antd/lib"
const { Title, Text } = Typography
import { Loading } from '../Common/Loading'
import { ApplicationState, Result } from "../../interfaces";
import { Flag } from '../Common/Flag'
import { playAudioStream, readAudioStream, audio } from "../../audio";
import { SoundOutlined } from '@ant-design/icons'

const SERVER_ADDRESS = `${process.env.REACT_APP_SERVER_IP}:${process.env.REACT_APP_SERVER_PORT ? process.env.REACT_APP_SERVER_PORT : ''}`
console.log( SERVER_ADDRESS )

interface Props {}
interface State {
    serverState: 'loading' | 'offline' | 'online',
    applicationState: undefined | ApplicationState,
    unsupportedLanguageCodes: undefined | string[]
}
export class MainMenu extends React.Component<Props, State> {
    refSoumah: React.RefObject<HTMLImageElement>
    constructor( props: Props ) {
        super( props )
        this.connect()
        this.refSoumah = React.createRef()
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
    playResultSound( result: Result ) {
        // Hack - iPhone restricts playing audio that is not based on user interaction.
        // Audio.play() must be called (once for element) directly in event handler for it to work.
        audio.play()

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
            const soumah = this.refSoumah.current
            if ( soumah ) {
                const t = 2.0 * (window.performance.now( ) - tStart) / 1000

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
                soumah.style.transform = transform
                requestAnimationFrame( animate )
            }
        }
        const tStart = window.performance.now()
        animate()
    }



    render() {
        const { serverState } = this.state
        return <div className='expand'>
            <div className='backgroundDiv'>
                <img
                    className='background'
                    src='wandelsoumah_bg.png'
                />
                <img
                    className='soumah'
                    src='wandelsoumah_avatar.png'
                    ref={ this.refSoumah }
                />
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