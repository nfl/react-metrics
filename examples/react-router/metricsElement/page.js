import React, {PropTypes} from "react";
import {MetricsElement} from "react-metrics"; // eslint-disable-line import/no-unresolved

// Note: `data-tracking` prefix is set in app.js as `attributePrefix` option

class Page extends React.Component {
    static propTypes = {
        params: PropTypes.object
    };

    render() {
        const {params} = this.props;
        const listItem = Array.from("123").map(key => (
            <li
                data-tracking-event-name="SomeEvent"
                data-tracking-key={key}
                data-tracking-page={params.id}
                key={key}
            >
                <img
                    alt=""
                    src={`http://placehold.it/200x50?text=Item+${key}`}
                />
            </li>
        ));

        return (
            <div>
                <h1>Page {params.id}</h1>
                {/* Ex 1: self target */}
                <MetricsElement
                    data-tracking-event-name="SomeEvent"
                    data-tracking-merge-pagedefaults="true"
                    data-tracking-value="SomeValue"
                    element="a"
                >
                    Link
                </MetricsElement>
                {/* Ex 2: render children only */}
                <MetricsElement>
                    <a
                        data-tracking-event-name="SomeEvent"
                        data-tracking-value="SomeValue"
                    >
                        <img
                            alt=""
                            src="http://placehold.it/200x150?text=Image+1"
                            style={{padding: 5}}
                        />
                    </a>
                </MetricsElement>
                {/* Ex 3: event bubbling */}
                <MetricsElement
                    data-tracking-event-name="SomeEvent"
                    data-tracking-value="SomeValue"
                    element="a"
                >
                    <img
                        alt=""
                        src="http://placehold.it/200x150?text=Image+2"
                        style={{padding: 5}}
                    />
                </MetricsElement>
                {/* Ex 4: multiple tracking items */}
                <MetricsElement
                    element="ul"
                    style={{listStyle: "none", width: 200, padding: 0}}
                >
                    {listItem}
                </MetricsElement>
                {/* Ex 5: aggregate metrics data */}
                <MetricsElement data-tracking-key1="val1" element="div">
                    <div
                        data-tracking-key2="val2"
                        data-tracking-merge-pagedefaults="true"
                    >
                        <a
                            data-tracking-event-name="AnotherEvent"
                            data-tracking-value="AnotherValue"
                        >
                            <img
                                alt=""
                                src="http://placehold.it/200x150?text=Image+1"
                                style={{padding: 5}}
                            />
                        </a>
                    </div>

                    <div data-tracking-key1="val1-1" data-tracking-key3="val3">
                        <ul style={{listStyle: "none", width: 200, padding: 0}}>
                            {listItem}
                        </ul>
                    </div>
                </MetricsElement>
            </div>
        );
    }
}

export default Page;
