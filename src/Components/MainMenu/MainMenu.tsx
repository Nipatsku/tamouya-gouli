import * as React from "react";
import { Button, Layout, Typography, Icon, Input, Affix, Tag } from "antd/lib"
const { Title, Text } = Typography
import { Loading } from '../Common/Loading'

const SERVER_ADDRESS = `http://${process.env.REACT_APP_SERVER_IP}:${process.env.REACT_APP_SERVER_PORT}`

interface Props {}
interface State {
    serverState: 'loading' | 'offline' | 'online',
    results: undefined | Result[]
}
interface Result {
    
}
export class MainMenu extends React.Component<Props, State> {
    constructor( props: Props ) {
        super( props )
        this.connect()
        this.state = {
            serverState: 'loading',
            results: undefined
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
                    this.getResults()
                }
            } )
            .catch( this.handleServerError )
    }
    getResults() {
        fetch(
            SERVER_ADDRESS + '/results',
            { mode: 'cors' }
        )
            .then( r => r.json() )
            .then( results => {
                this.setState({ results })
            } )
            .catch( this.handleServerError )
    }



    render() {
        const { serverState } = this.state
        return <div className='expand'>
            {serverState === 'loading' ?
                <Loading/> :
                <div>
                    <Title>
                        Tamouya Gouli
                    </Title>
                    {serverState === 'offline' ?
                        <Text>Server offline</Text> :
                        this.renderServerOnline()
                    }
                </div>
            }
        </div>
    }
    renderServerOnline() {
        return <div>

        </div>
    }
}