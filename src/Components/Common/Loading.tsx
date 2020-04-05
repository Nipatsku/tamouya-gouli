import * as React from "react";
import { Spin } from "antd/lib"

interface Props {}
interface State {}
export class Loading extends React.Component<Props, State> {
    render() {
        return <Spin
            size="large"
            className="absoluteCenter"
        />
    }
}
