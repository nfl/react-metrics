import Controller from "cerebral";
import Model from "cerebral-baobab";

const model = Model({
    appName: "My Application",
    url: "/",
    title: "Home",
    page: "home"
});

const services = {};

export default Controller(model, services);
