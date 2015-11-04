var execSync = require("child_process").execSync;
var fsStat = require("fs").stat;

function exec(command) {
    execSync(command, {stdio: [0, 1, 2]});
}

fsStat("lib", function (error, stat) {
    if (error || !stat.isDirectory()) {
        exec("npm run build");
    }
});
