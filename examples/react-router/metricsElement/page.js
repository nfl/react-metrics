import React, {PropTypes} from "react";
import {MetricsElement} from "react-metrics"; // eslint-disable-line import/no-unresolved

// Note: `data-tracking` prefix is set in app.js as `attributePrefix` option

class Page extends React.Component {
    static propTypes = {
        params: PropTypes.object
    }

    render() {
        const {params} = this.props;
        const listItem = Array.from("123").map(key => (
            <li
                key={key}
                data-tracking-event-name="SomeEvent"
                data-tracking-key={key}
                data-tracking-page={params.id}
            >
                <img src={`http://placehold.it/200x50?text=Item+${key}`}/>
            </li>
        ));

        return (
            <div>
                <h1>Page {params.id}</h1>
                {/* Ex 1: self target */}
                <MetricsElement element="a" data-tracking-event-name="SomeEvent" data-tracking-value="SomeValue">Link</MetricsElement>
                {/* Ex 2: render children only */}
                <MetricsElement>
                    <a data-tracking-event-name="SomeEvent" data-tracking-value="SomeValue">
                        <img src="http://placehold.it/200x150?text=Image+1" style={{padding: 5}} />
                    </a>
                </MetricsElement>
                {/* Ex 3: event bubbling */}
                <MetricsElement element="a" data-tracking-event-name="SomeEvent" data-tracking-value="SomeValue">
                    <img src="http://placehold.it/200x150?text=Image+2" style={{padding: 5}} />
                </MetricsElement>
                {/* Ex 4: multiple tracking items */}
                <MetricsElement element="ul" style={{listStyle: "none", width: 200, padding: 0}}>
                    {listItem}
                </MetricsElement>
            </div>
        );
    }
}

export default Page;
