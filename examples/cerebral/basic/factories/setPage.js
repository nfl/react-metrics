export default function (page) {
    function setPage(input, state) {
        state.set("route", input.route);
        state.set("page", page);
    }
    return setPage;
}
