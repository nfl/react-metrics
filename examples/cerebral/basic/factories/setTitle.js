export default function (title) {
    function setTitle(input, state) {
        state.set("title", title);
    }
    return setTitle;
}
