import TestService from "./TestService";

export default {
    vendors: [
        {
            name: "Test Service",
            api: TestService
        },
        {
            name: "Another Service",
            api: {
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
                identify(user) {
                    return new Promise(resolve => {
                        resolve({
                            user
                        });
                    });
                },
                someMethod(a, b, c) {
                    console.log(`someMethod ${a} ${b} ${c}`);
                    return new Promise(resolve => {
                        resolve();
                    });
                }
            }
        }
    ],
    pageDefaults: () => {
        return {
            country: "A",
            profileId: "B",
            socialAccountsActive: "C",
            siteSection: "D",
            siteSubsection: "E",
            siteExperience: "F",
            buildNumber: "G",
            dateTime: "H"
        };
    },
    pageViewEvent: "pageLoad"
};
