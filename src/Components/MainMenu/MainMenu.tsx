import * as React from "react";
import { Button, Layout, Typography, Icon, Input, Affix, Tag } from "antd/lib"
const { Title, Text } = Typography

interface Props {}
interface State {}
export class MainMenu extends React.Component<Props, State> {
    constructor( props: Props ) {
        super( props )
    }
    render() {
        return <div>
            <Title>
                Hello world!
            </Title>
        </div>
    }
}