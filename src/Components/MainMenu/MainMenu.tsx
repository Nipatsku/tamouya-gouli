import * as React from "react";
import { Button, Layout, Typography, Icon, Input, Affix, Tag } from "antd/lib"
const { Title, Text } = Typography
import { Loading } from '../Common/Loading'
import { ApplicationState } from "../../interfaces";
import { Flag } from '../Common/Flag'

const SERVER_ADDRESS = `http://${process.env.REACT_APP_SERVER_IP}:${process.env.REACT_APP_SERVER_PORT}`

interface Props {}
interface State {
    serverState: 'loading' | 'offline' | 'online',
    applicationState: undefined | ApplicationState
}
export class MainMenu extends React.Component<Props, State> {
    constructor( props: Props ) {
        super( props )
        this.connect()
        this.state = {
            serverState: 'loading',
            applicationState: undefined
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
            } )
            .catch( this.handleServerError )
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
        const { inputLanguage, input, results } = applicationState
        return <div className='column'>
            <Title level={3}>Official translations for...</Title>
            <div className='row'>
                <Text className='speechAsText'>"{input}"</Text>
                <Flag language={inputLanguage} size={24}/>
            </div>
            {results.map(( result, i ) =>
                <div className='row' key={i}>
                    <Text>{result.local}</Text>
                    <Flag language={result.language} size={16}/>
                    <Text>({result.translation})</Text>
                </div>
            )}
        </div>
    }
}