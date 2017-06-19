// borrowed from https://github.com/rackt/react-router/blob/master/modules/__tests__/execSteps.js
function execSteps(steps, done) {
    let index = 0;

    return function(...args) {
        if (steps.length === 0) {
            done();
        } else {
            try {
                steps[index++].apply(this, args);

                if (index === steps.length) {
                    done();
                }
            } catch (error) {
                done(error);
            }
        }
    };
}

export default execSteps;
