import * as React from "react";
import { Button, Layout, Typography, Icon, Input, Affix, Tag } from "antd/lib"
const { Title, Text } = Typography
import { Loading } from '../Common/Loading'
import { ApplicationState, Result } from "../../interfaces";
import { Flag } from '../Common/Flag'
import { playAudioStream, readAudioStream } from "../../audio";
import { SoundOutlined } from '@ant-design/icons'

const SERVER_ADDRESS = `http://${process.env.REACT_APP_SERVER_IP}:${process.env.REACT_APP_SERVER_PORT}`

interface Props {}
interface State {
    serverState: 'loading' | 'offline' | 'online',
    applicationState: undefined | ApplicationState,
    unsupportedLanguageCodes: undefined | string[]
}
export class MainMenu extends React.Component<Props, State> {
    constructor( props: Props ) {
        super( props )
        this.connect()
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
        fetch(
            SERVER_ADDRESS + `/text-to-speech?text=${result.local}&languageCode=${result.language.Code}`
        )
            .then( readAudioStream)
            .then( playAudioStream )
            .catch( e => {
                console.error( e )
            })
    }



    render() {
        const { serverState } = this.state
        return <div className='expand'>
            {serverState === 'loading' ?
                <Loading/> :
                <div>
                    {serverState === 'offline' ?
                        <Text>Server offline</Text> :
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