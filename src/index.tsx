import * as React from "react";
import { render } from "react-dom";
import { BrowserRouter, Route, Switch } from "react-router-dom"
import "./styles.css";
import { MainMenu } from './Components/MainMenu/MainMenu'
import { LyricsGenerator } from './Components/LyricsGenerator/LyricsGenerator'

interface Props {}
interface State {}
class App extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {}
    }
    render() {
        // return <LyricsGenerator
        //     audioIn='tamouya_gouli.mp3'
        //     lyricsIn='lyrics-src.txt'
        // />
        return <MainMenu/>
    }
}

const rootElement = document.getElementById("root");
render(<App />, rootElement);
