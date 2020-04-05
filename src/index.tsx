import * as React from "react";
import { render } from "react-dom";
import { BrowserRouter, Route, Switch } from "react-router-dom"
import "./styles.css";

interface Props {}
interface State {}
class App extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {}
    }
    render() {
        return <div>
            Hello World!
        </div>
    }
}

const rootElement = document.getElementById("root");
render(<App />, rootElement);
