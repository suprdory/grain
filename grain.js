Array.prototype.random = function () {
    return this[Math.floor((Math.random() * this.length))];
}
let log = console.log;
import { createColormap, getMapNames } from "./colormaps.js";

function getMouseRowCol(event) {

    // Get the mouse coordinates relative to the canvas
    // in cavans pixels, not css pixels
    var x = Math.floor(canvas.width / canvas.getBoundingClientRect().width * (event.clientX - canvas.getBoundingClientRect().left));
    var y = Math.floor(canvas.width / canvas.getBoundingClientRect().width * (event.clientY - canvas.getBoundingClientRect().top));
    return { 'column': x, 'row': y }
    // Output the coordinates
    // console.log('Mouse Click Coordinates: X=' + x + ', Y=' + y);

}
function setSourceColumn(event) {
    let rowCol = getMouseRowCol(event);
    // log(rowCol)
    sourceColumn = rowCol.column

}

// Function to track mouse and touchscreen pointer movement
function trackPointerMovement() {
    // Initialize variables to store coordinates
    let pointerX = 0;
    let pointerY = 0;

    // Flag to check if the mouse button is pressed
    let isMouseButtonPressed = false;

    // Add event listeners for mouse events
    document.addEventListener('mousedown', () => { isMouseButtonPressed = true; });
    document.addEventListener('mouseup', () => { isMouseButtonPressed = false; });
    document.addEventListener('mousemove', updateCoordinates);

    // Add an event listener for touch events
    document.addEventListener('touchmove', updateCoordinates);

    // Function to update coordinates based on events
    function updateCoordinates(event) {
        // Check if the event is a mouse event with the button pressed
        if (event.type === 'mousemove' && !isMouseButtonPressed) {
            return;
        }

        // Check if the event is a touch event
        if (event.touches && event.touches.length > 0) {
            // For touch events, use the first touch point
            pointerX = event.touches[0].clientX;
            pointerY = event.touches[0].clientY;
        } else {
            // For mouse events, use clientX and clientY directly
            pointerX = event.clientX;
            pointerY = event.clientY;
        }
        let columnx = Math.floor(canvas.width / canvas.getBoundingClientRect().width * pointerX);
        //   log(columnx)
        sourceColumn = columnx;
    }
}

function diff(arr) {
    return arr.slice(1).map((value, index) => value - arr[index])
}
function findIndices(arr, condition) {
    const indices = [];
    for (let i = 0; i < arr.length; i++) {
        if (condition(arr[i])) {
            indices.push(i);
        }
    }

    return indices;
}
function getRandomElement(arr) {
    // Check if the array is empty
    if (arr.length === 0) {
        return undefined;
    }
    // Generate a random index within the array length
    const randomIndex = Math.floor(Math.random() * arr.length);

    // Return the random element
    return arr[randomIndex];
}
function add_grain(x, colourx) {
    // log(x, height[x])
    let colour = colours[colourx]
    if (height[x] < Y) {// column not full
        pix.data[0] = colour[0];
        pix.data[1] = colour[1];
        pix.data[2] = colour[2];
        ctx.putImageData(pix, x, Y - height[x] - 1);
        height[x]++;
        dhdx[x]--;
        dhdx[x - 1]++;
        return true;
    }
    else {
        return false;
    }
    // dhdx = diff(height);
}
function movePixel(x1, y1, x2, y2) {
    let pix1 = ctx.getImageData(x1, y1, 1, 1);
    ctx.putImageData(pix1, x2, y2);
    ctx.putImageData(pixEmpty, x1, y1);
}
function random_tumble() {
    let unstables = findIndices(dhdx, (x) => x < -1 || x > 1)
    if (unstables.length > 0) {
        let x = getRandomElement(unstables)
        // x=0
        // log("x", x)
        if (dhdx[x] < 0) {
            movePixel(x, Y - height[x], x + 1, Y - height[x + 1] - 1)
            height[x]--;
            height[x + 1]++;
            dhdx[x - 1]--;
            dhdx[x] += 2;
            dhdx[x + 1]--;

        }
        else {
            movePixel(x + 1, Y - height[x + 1], x, Y - height[x] - 1)
            height[x + 1]--;
            height[x]++;

            dhdx[x - 1]++;
            dhdx[x] -= 2;
            dhdx[x + 1]++;

        }
        // dhdx = diff(height);
        return true;
    }
    else {
        return false;
    }

}
function setButtonActions() {
    // const hideButton = document.getElementById('hideButton');
    // hideButton.addEventListener('click', () => {
    //     var panel = document.getElementById("panel");
    //     panel.classList.toggle("collapsed");

    //     const hideButton = document.getElementById('hideButton');
    //     hideButton.classList.toggle('hide');
    //     const icon = hideButton.querySelector('i');
    //     icon.textContent = hideButton.classList.contains('hide') ? 'expand_more' : 'expand_less';
    // })
    // function togglePanel() {
    // }

    const playPauseBtn = document.getElementById('playPauseBtn');
    playPauseBtn.addEventListener('click', () => {
        playPauseBtn.classList.toggle('paused');
        const icon = playPauseBtn.querySelector('i');
        icon.textContent = playPauseBtn.classList.contains('paused') ? 'pause' : 'play_arrow';
        playPauseBtn.classList.contains('paused') ? play = false : play = true;
        anim();
        // log(play)
    });

    // JavaScript for handling screenshot button (adjust as needed)
    // const screenshotBtn = document.getElementById('screenshotBtn');
    // screenshotBtn.addEventListener('click', () => {
    //   // Add logic for taking a screenshot here
    //   // alert('Screenshot taken!');
    // });
    const clearButton = document.getElementById('clearBtn');
    clearButton.addEventListener('click', () => {
        clearScreen()
    })

    const shuffleButton = document.getElementById('shuffleBtn');
    shuffleButton.addEventListener('click', () => {
        shuffle()
    })

}
function clearScreen() {
    ctx.reset();
    height = new Int16Array(X);
    dhdx = diff(height);
    n = 0;
}

function shuffle() {
    X = getRandomElement(Xs)
    let windowAR = window.innerWidth / window.innerHeight;
    Y = Math.round(X / windowAR)
    canvas.height = Y;
    canvas.width = X;
    canvas.style.width = window.innerWidth + "px";
    height = new Int16Array(X);
    dhdx = diff(height);

    //background
    // ctx.fillStyle = "navy";
    // ctx.fillRect(0, 0, canvas.width, canvas.height);

    sourceColumn = Math.round((Math.random() * X))


    let colorSpeed = getRandomElement(colorSpeeds)
    nCols = X * colorSpeed;

    let colourMapName = getRandomElement(colourMapNames)
    colours = createColormap({ colormap: colourMapName, format: 'rgba', nshades: nCols, })

    pix = ctx.getImageData(0, 0, 1, 1);
    pixEmpty = ctx.getImageData(0, 0, 1, 1);

    height = new Int16Array(X);
    dhdx = diff(height);

    let speedMult = getRandomElement(speedMults)
    speed = X * X * speedMult / 200; // number of grains added per iteration
    n = 0
    nMax = X * Y;

    log('X', X, 'colSpd', colorSpeed, 'spdMult', speedMult, 'palette', colourMapName)
}

let Xs = [50, 75, 100, 150, 200, 400, 600];
let speedMults = [0.05, 0.1, 0.2]
let colorSpeeds = [4, 8, 16, 32, 64]


let n, nMax, sourceColumn, X, Y, nCols, colours, height, dhdx, pix, pixEmpty, speed

let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d",
    {
        alpha: false,
        willReadFrequently: true,
        imageSmoothingEnabled: false
    });
// Add a click event listener to the canvas
canvas.addEventListener('click', setSourceColumn);

let colourMapNames = getMapNames()
let play = true
let coln=0;

shuffle();

// let h0=[0,0,0,1,0,0]
// let dh0=diff(h0)
// log(h0,dh0)

// let h=[0,0,0,2,0,0]
// let dh=diff(h)
// log(h,dh)
// let h1=[0,0,1,1,0,0]
// let dh1=diff(h1)
// log(h1,dh1)

function anim() {
    if ((n < nMax)) {
        for (let i = 0; i < speed; i++) {
            if (add_grain(sourceColumn, coln % nCols)) {
                while (random_tumble()) { };
                n++;
                coln++;
            };
        }
    }

    if (play & (n < nMax)) {
        requestAnimationFrame(anim);
    }

}

anim()
trackPointerMovement();
setButtonActions();


