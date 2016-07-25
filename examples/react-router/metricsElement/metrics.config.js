import pkg from "../../../package.json";
const config = {
    vendors: [
        {
            api: {
                name: "Test",
                pageView(eventName, params) {
                    return new Promise(resolve => {
                        setTimeout(() => {
                            resolve({
                                eventName,
                                params
                            });
                        }, 0 * 1000);
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
                    return new Promise(resolve => {
                        resolve({
                            user
                        });
                    });
                }
            }
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
