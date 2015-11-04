import ActionTypes from "./ActionTypes";

export default function counter(state, action) {
    const {id} = action;
    let nextState;
    switch (action.type) {
        case ActionTypes.INCLEMENT:
            nextState = Object.assign({}, state, {
                [`counter${id}`]: state[`counter${id}`] + 1
            });
            return nextState;
        case ActionTypes.DECLEMENT:
            nextState = Object.assign({}, state, {
                [`counter${id}`]: state[`counter${id}`] - 1
            });
            return nextState;
        default:
            return state;
    }
}
