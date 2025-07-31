// Sample JavaScript file for ARiS testing
function helloWorld() {
    console.log("Hello from ARiS!");
    return "Hello World";
}

// Test function with some issues
function badFunction() {
    var x = 10; // Using var instead of let/const
    if(x == 10) { // Using == instead of ===
        console.log("x is 10");
    }
}

module.exports = {
    helloWorld,
    badFunction
};
