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
