import * as React from "react";
import { render } from "react-dom";
import { BrowserRouter, Route, Switch } from "react-router-dom"
import "./styles.css";
import { MainMenu } from './Components/MainMenu/MainMenu'

interface Props {}
interface State {}
class App extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {}
    }
    render() {
        return <MainMenu/>
    }
}

const rootElement = document.getElementById("root");
render(<App />, rootElement);
