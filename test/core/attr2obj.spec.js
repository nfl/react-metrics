/* eslint-disable react/no-multi-comp,jsx-a11y/href-no-hash */
import React from "react";
import ReactDOM from "react-dom";
import ReactTestUtils from "react-dom/test-utils";
import attr2obj from "../../src/core/utils/attr2obj";

describe("attr2obj", () => {
    it("returns empty object if an element is not nodeType 1", () => {
        const node = document.createDocumentFragment();
        const obj = attr2obj(node);
        expect(obj).to.be.an("object");
        expect(Object.keys(obj).length).to.equal(0);
    });

    it("extracts prefixed attributes as empty object when no attribute is found", () => {
        const node = document.createElement("a");
        const obj = attr2obj(node, "prefix");
        expect(obj).to.be.an("object");
        expect(Object.keys(obj).length).to.equal(0);
    });

    it("uses 'data' as default prefix", () => {
        const node = document.createElement("a");
        node.setAttribute("data-event", "My Event Name");
        const obj = attr2obj(node);
        expect(obj).to.be.an("object");
        expect(obj).to.have.property("event").and.to.equal("My Event Name");
    });

    it("extracts prefixed attributes as object", () => {
        let node = document.createElement("a");
        let obj;
        node.setAttribute("data-analytics-event", "My Event Name");
        node.setAttribute("data-analytics-prop", "value");
        node.setAttribute("data-analytics-camel-case", "value 2");
        node.setAttribute("data-analytics-another-camel-case", "value 3");
        obj = attr2obj(node, "data-analytics");

        expect(obj).to.be.an("object");
        expect(obj).to.have.property("event").and.to.equal("My Event Name");
        expect(obj).to.have.property("prop").and.to.equal("value");
        expect(obj).to.have.property("camelCase").and.to.equal("value 2");
        expect(obj).to.have
            .property("anotherCamelCase")
            .and.to.equal("value 3");

        class Wrapper extends React.Component {
            render() {
                return (
                    <a
                        data-analytics-another-camel-case="value 3"
                        data-analytics-camel-case="value 2"
                        data-analytics-event="My Event Name"
                        data-analytics-prop="value"
                        href="#"
                    />
                );
            }
        }

        const element = ReactTestUtils.renderIntoDocument(<Wrapper />);
        node = ReactDOM.findDOMNode(
            ReactTestUtils.findRenderedDOMComponentWithTag(element, "a")
        );
        obj = attr2obj(node, "data-analytics");

        expect(obj).to.be.an("object");
        expect(obj).to.have.property("event").and.to.equal("My Event Name");
        expect(obj).to.have.property("prop").and.to.equal("value");
        expect(obj).to.have.property("camelCase").and.to.equal("value 2");
        expect(obj).to.have
            .property("anotherCamelCase")
            .and.to.equal("value 3");
    });

    it("extracts custom prefixed attributes as object", () => {
        let node = document.createElement("a");
        let obj;
        node.setAttribute("custom-event", "My Event Name");
        node.setAttribute("custom-prop", "value");
        node.setAttribute("custom-camel-case", "value 2");
        node.setAttribute("custom-another-camel-case", "value 3");
        obj = attr2obj(node, "custom");

        expect(obj).to.be.an("object");
        expect(obj).to.have.property("event").and.to.equal("My Event Name");
        expect(obj).to.have.property("prop").and.to.equal("value");
        expect(obj).to.have.property("camelCase").and.to.equal("value 2");
        expect(obj).to.have
            .property("anotherCamelCase")
            .and.to.equal("value 3");

        class Wrapper extends React.Component {
            render() {
                return (
                    <a
                        custom-another-camel-case="value 3"
                        custom-camel-case="value 2"
                        custom-event="My Event Name"
                        custom-prop="value"
                        href="#"
                    />
                );
            }
        }

        const element = ReactTestUtils.renderIntoDocument(<Wrapper />);

        node = ReactDOM.findDOMNode(
            ReactTestUtils.findRenderedDOMComponentWithTag(element, "a")
        );
        obj = attr2obj(node, "data-analytics");

        // React will remove non-HTML spec attributes
        expect(obj).to.be.an("object");
        expect(Object.keys(obj).length).to.equal(0);
    });
});
