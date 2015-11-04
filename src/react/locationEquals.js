import deepEqual from "deep-equal";
export default function locationEquals(a, b) {
    if (!a && !b) {
        return true;
    }
    if ((a && !b) || (!a && b)) {
        return false;
    }

    return (
        a.pathname === b.pathname &&
        a.search === b.search &&
        deepEqual(a.state, b.state)
    );
}
