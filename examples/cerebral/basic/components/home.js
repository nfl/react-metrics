import React from "react";
import {Decorator as Cerebral} from "cerebral-react";

@Cerebral({
    route: ["route"]
}) class Home extends React.Component {
    render() {
        return <h1>Home</h1>;
    }
}

export default Home;
