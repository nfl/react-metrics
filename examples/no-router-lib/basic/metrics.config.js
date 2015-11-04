import pkg from "../../../package.json";
import GoogleMetrics from "../../vendors/GoogleAnalytics";

const config = {
    vendors: [
        {
            name: "Test Override",
            api: {
                name: "Test",
                pageView(eventName, params) {
                    return new Promise(resolve => {
                        resolve({
                            eventName,
                            params
                        });
                    });
                },
                track(eventName, params) {
                    return new Promise(resolve => {
                        resolve({
                            eventName,
                            params
                        });
                    });
                },
                user(user) {
                    return new Promise((resolve) => {
                        // reject(new Error("dummy error Test"));
                        resolve({
                            user
                        });
                    });
                }
            }
        },
        {
            api: new GoogleMetrics({
                trackingId: "UA-68539421-1"
            })
        }
    ],
    pageDefaults: (routeState) => {
        const paths = routeState.pathname.substr(1).split("/");
        const timestamp = new Date();
        return {
            timestamp,
            build: pkg.version,
            siteName: "React Metrics Example",
            category: !paths[0] ? "landing" : paths[0]
        };
    },
    pageViewEvent: "pageLoad",
    debug: true
};

export default config;
