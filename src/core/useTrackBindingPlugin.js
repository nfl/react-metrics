import EventListener from "fbjs/lib/EventListener";
import attr2obj from "./utils/attr2obj";

function isLeftClickEvent(event) {
    return event.button === 0;
}

function isModifiedEvent(event) {
    return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

export class TrackBindingPlugin {
    constructor(attributePrefix = "data-metrics") {
        this.attributePrefix = attributePrefix;
    }

    listen(callback, rootElement = document.body) {
        if (typeof callback !== "function") {
            throw new Error("callback needs to be a function.");
        }

        if (rootElement && rootElement.nodeType !== 1) {
            throw new Error("rootElement needs to be a valid node element.");
        }

        if (!this._clickHandler) {
            this.remove();
        }

        this._clickHandler = EventListener.listen(rootElement, "click", this._handleClick.bind(this, callback));

        return {
            remove: this.remove.bind(this)
        };
    }

    remove() {
        if (this._clickHandler) {
            this._clickHandler.remove();
            this._clickHandler = null;
        }
    }

    /**
     * A click handler to perform custom link tracking, any element with 'metrics-*' attribute will be tracked.
     *
     * @method _handleClick
     * @param {Object} event
     * @private
     */
    _handleClick(callback, event) {
        if (isModifiedEvent(event) || !isLeftClickEvent(event)) {
            return;
        }

        const elem = event.target;
        const dataset = attr2obj(elem, this.attributePrefix);
        const eventName = dataset && dataset.eventName;

        if (!Object.keys(dataset).length) {
            return;
        }

        if (eventName) {
            delete dataset.eventName;
            callback(eventName, dataset);
        } else {
            callback(dataset);
        }
    }
}

export default function useTrackBindingPlugin({callback, rootElement, attributePrefix}) {
    const trackBindingPlugin = new TrackBindingPlugin(attributePrefix);
    return trackBindingPlugin.listen(callback, rootElement);
}
