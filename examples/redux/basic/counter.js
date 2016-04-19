import ActionTypes from "./ActionTypes";

export default function counter(state, action) {
    const {id} = action;
    let nextState;
    switch (action.type) {
        case ActionTypes.INCLEMENT:
            nextState = {
                ...state,
                [`counter${id}`]: state[`counter${id}`] + 1
            };
            return nextState;
        case ActionTypes.DECLEMENT:
            nextState = {
                ...state,
                [`counter${id}`]: state[`counter${id}`] - 1
            };
            return nextState;
        default:
            return state;
    }
}
