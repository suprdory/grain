Array.prototype.random = function () {
    return this[Math.floor((Math.random() * this.length))];
}
let log = console.log;
import { createColormap, getMapNames } from "./colormaps.js";
function getMouseRowCol(event) {

    // Get the mouse coordinates relative to the canvas
    // in cavans pixels, not css pixels
    var x = Math.floor(canvasBot.width / canvasBot.getBoundingClientRect().width * (event.clientX - canvasBot.getBoundingClientRect().left));
    var y = Math.floor(canvasBot.width / canvasBot.getBoundingClientRect().width * (event.clientY - canvasBot.getBoundingClientRect().top));
    return { 'column': x, 'row': y }
    // Output the coordinates
    // console.log('Mouse Click Coordinates: X=' + x + ', Y=' + y);

}
function setSourceColumn(event) {
    let rowCol = getMouseRowCol(event);
    // log(rowCol)
    sourceColumn = rowCol.column

}
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
        let columnx = Math.floor(canvasBot.width / canvasBot.getBoundingClientRect().width * pointerX);
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
function add_grain(pane, x, colour) {
    // log(x, height[x])
    if (pane.height[x] < Y) {// column not full
        pix.data[0] = colour[0];
        pix.data[1] = colour[1];
        pix.data[2] = colour[2];
        pane.ctx.putImageData(pix, x, Y - pane.height[x] - 1);
        pane.height[x]++;
        pane.dhdx[x]--;
        pane.dhdx[x - 1]++;
        while (random_tumble(pane)) { };
        return true;
    }
    else {
        return false;
    }
    // dhdx = diff(height);
}
// function add_grain_pix(pane, x, pix) {
//     if (pane.height[x] < Y) {// column not full
//         pane.ctx.putImageData(pix, x, Y - pane.height[x] - 1);
//         pane.height[x]++;
//         pane.dhdx[x]--;
//         pane.dhdx[x - 1]++;
//         while (random_tumble(pane)) { };
//         return true;
//     }
//     else {
//         return false;
//     }
//     // dhdx = diff(height);
// }
function removeGrain(pane, x, pix) {
    // log(pane.height)
    if (pane.height[x] - pane.base[x] > 0) {

        let pixOut = pane.ctx.getImageData(x, Y - 1, 1, 1).data
        pix.data[0] = pixOut[0]
        pix.data[1] = pixOut[1]
        pix.data[2] = pixOut[2]
        pane.ctx.putImageData(pane.pix0, x, Y - 1)
        if (pane.height[x] > 1) {
            pane.base[x]++; // increment base height, if grains above
        }
        else {
            pane.height[x] = 0;
        }
        while (random_settle(pane)) { };
        while (random_tumble(pane)) { };
        return true
    }
    else {
        // log('No Grain')
        pix.data[0] = 0
        pix.data[1] = 0
        pix.data[2] = 0
        return false
    }
}
function movePixel(pane, x1, y1, x2, y2) {
    let pix1 = pane.ctx.getImageData(x1, y1, 1, 1);
    pane.ctx.putImageData(pix1, x2, y2);
    pane.ctx.putImageData(pane.pix0, x1, y1);
}
function random_tumble(pane) {
    // find unstable grain on top and tumble one grain, one step
    let unstables = findIndices(pane.dhdx, (x) => x < -1 || x > 1)
    if (unstables.length > 0) {
        let x = getRandomElement(unstables)
        // x=0
        // log("x", x)
        if (pane.dhdx[x] < 0) {
            movePixel(pane, x, Y - pane.height[x], x + 1, Y - pane.height[x + 1] - 1)
            pane.height[x]--;
            pane.height[x + 1]++;
            pane.dhdx[x - 1]--;
            pane.dhdx[x] += 2;
            pane.dhdx[x + 1]--;

        }
        else {
            movePixel(pane, x + 1, Y - pane.height[x + 1], x, Y - pane.height[x] - 1)
            pane.height[x + 1]--;
            pane.height[x]++;

            pane.dhdx[x - 1]++;
            pane.dhdx[x] -= 2;
            pane.dhdx[x + 1]++;

        }
        // dhdx = diff(height);
        // log('h tum',pane.height);
        return true;
    }
    else {
        // log('h notum',pane.height);
        return false;
    }

}
function random_settle(pane) {
    // find holes at the bottom and fill

    let holes = findIndices(pane.base, (x) => x > 0);
    // log('holes',holes)
    if (holes.length > 0) {
        let x = getRandomElement(holes)
        // log('holex',x)
        // number of grains above hle

        let lcr = getRandomElement([-1, -1, -1, -1, -1, -1, -1, 0, 1, 1, 1, 1, 1, 1, 1])
        // let lcr = getRandomElement([0])
        if (lcr == 0 || x + lcr < 0 || x + lcr > X - 1) {

            let n = pane.height[x] - pane.base[x]
            // log('settle n',n)
            for (let i = 0; i < n; i++) {
                movePixel(pane, x, Y - i - 2, x, Y - i - 1);
            }
            pane.base[x]--;
            pane.height[x]--;
            pane.dhdx[x]++;
            pane.dhdx[x - 1]--;


        }
        else if (lcr == -1) {
            movePixel(pane, x - 1, Y - 1, x, Y - 1);
            pane.base[x]--;
            pane.base[x - 1]++;
        }
        else {
            movePixel(pane, x + 1, Y - 1, x, Y - 1);
            pane.base[x]--;
            pane.base[x + 1]++;
        }
        // log('h set',pane.height);
        return true;


    }
    else {
        // log('h noset',pane.height,'b noset',pane.base);
        return false;
    }
}
function setButtonActions() {

    const screenshotBtn = document.getElementById('screenshotBtn');
    screenshotBtn.addEventListener('click', () => {
        saveCanvasImage();
    });

    function saveCanvasImage() {
        //need to draw new canvas at screen resolution or resulting image can be too small to view on e.g. phones.
        let canvasScr = document.createElement('canvas')
        canvasScr.width = window.innerWidth;
        canvasScr.height = window.innerHeight;
        let ctxScr = canvasScr.getContext('2d');
        ctxScr.imageSmoothingEnabled = false;
        ctxScr.drawImage(canvas, 0, 0, window.innerWidth, window.innerHeight)

        var link = document.createElement('a');
        let datetimeStr = new Date().toJSON()
        var dataURL = canvasScr.toDataURL();
        link.href = dataURL;
        link.download = 'grain_ ' + datetimeStr + '.png';
        link.click();

    }


    //Full screen toggle button functions
    /* Get the documentElement (<html>) to display the page in fullscreen */
    var elem = document.documentElement;

    /* View in fullscreen */
    function openFullscreen() {
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) { /* Safari */
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { /* IE11 */
            elem.msRequestFullscreen();
        }
    }

    /* Close fullscreen */
    function closeFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) { /* Safari */
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE11 */
            document.msExitFullscreen();
        }
    }
    const fullScreenBtn = document.getElementById('fullScreenBtn');
    fullScreenBtn.addEventListener('click', () => {
        playPauseBtn.classList.toggle('fullScreen');
        const icon = fullScreenBtn.querySelector('i');
        icon.textContent = playPauseBtn.classList.contains('fullScreen') ? 'close_fullscreen' : 'fullscreen';
        playPauseBtn.classList.contains('fullScreen') ? openFullscreen() : closeFullscreen();
        // anim();
        // log(play)
    });


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
    clearPane(ctxBot, parmsBot);
    clearPane(ctxTop, parmsTop);
}
function clearPane(ctx, parms) {
    ctx.reset();
    parms.height = new Int16Array(X);
    parms.dhdx = diff(parms.height);
    n = 0;
}
function shuffle() {
    sourceColumn = Math.round((Math.random() * X))

    let colorSpeed = getRandomElement(colorSpeeds)
    nCols = X * colorSpeed;

    let colourMapName = getRandomElement(colourMapNames)
    colours = createColormap({ colormap: colourMapName, format: 'rgba', nshades: nCols, })

    let speedMult = getRandomElement(speedMults)
    speed = X * X * speedMult / 200; // number of grains added per iteration

    log('X', X, 'colSpd', colorSpeed, 'spdMult', speedMult, 'palette', colourMapName)
    return { X: X, colorSpeed: colorSpeed, speed: speed, colours: colours }
}
function initPane(canvas, X, col) {

    let windowAR = window.innerWidth / window.innerHeight;
    Y = Math.round(0.5 * X / windowAR)
    canvas.height = Y;
    canvas.width = X;
    canvas.style.width = window.innerWidth + "px";
    let height = new Int16Array(X); // top of column
    let base = new Int16Array(X); // start of column
    let dhdx = diff(height);

    //background// 
    let ctx = canvas.getContext('2d')
    ctx.fillStyle = col;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    let pix0 = ctx.getImageData(0, 0, 1, 1);
    // canvas.pix0=pix0;
    let pane = {}
    // pane.parms= { height: height, dhdx: dhdx, base: base, emptyPix:emptyPix }

    pane.height = height;
    pane.dhdx = dhdx;
    pane.base = base;
    pane.pix0 = pix0;
    pane.ctx = ctx
    return pane
}
function fillPane(pane, nRows) {
    for (let y = 0; y < nRows; y++) {
        for (let x = 0; x < X; x++) {
            add_grain(pane, x, colours[coln % nCols])
            coln++
        }
    }

}

// let Xs = [50, 75, 100, 150, 200, 400, 600];
// let speedMults = [0.05, 0.1, 0.2]
// let colorSpeeds = [4, 8, 16, 32, 64]
// let colourMapNames = getMapNames()

let Xs = [50];
let speedMults = [0.05]
let colorSpeeds = [128]
let colourMapNames = ['viridis']

let n, nMax, sourceColumn, X, Y, nCols, colours, pix, pixEmpty, speed

// get canvas, contexts, and pixel, emptyPixel objs
let canvasTop = document.getElementById("canvasTop");
let ctxTop = canvasTop.getContext("2d",
    {
        alpha: false,
        willReadFrequently: true,
        imageSmoothingEnabled: false
    });

let canvasBot = document.getElementById("canvasBot");
let ctxBot = canvasBot.getContext("2d",
    {
        alpha: false,
        willReadFrequently: true,
        imageSmoothingEnabled: false
    });
pix = ctxBot.getImageData(0, 0, 1, 1); // temp data used for moving pixels arround and beteen pane ctxs
// pixEmpty = ctxBot.getImageData(0, 0, 1, 1);
// //background// 
// ctxBot.fillStyle = "navy";
// ctxBot.fillRect(0, 0, canvasBot.width, canvasBot.height);


// Add a click event listener to the canvas
canvasBot.addEventListener('click', setSourceColumn);

let play = true
let coln = 0;
X = 100
let paneB = initPane(canvasBot, X, 'black')
let paneT = initPane(canvasTop, X, 'black')
// log(paneT)

shuffle();

fillPane(paneT, 50);

n = 0
nMax = X * Y;
// nMax = 200
speed = 5
// sourceColumn = 2


function anim() {
    if ((n < nMax)) {
        for (let i = 0; i < speed; i++) {
            // log('n',n)
            if (removeGrain(paneT, sourceColumn, pix)) {
                // log('pix',pix)
                add_grain(paneB, sourceColumn, pix.data)
                n++
            }

        }
    }
    if (play & (n < nMax)) {
        requestAnimationFrame(anim);
    }
}

anim()
trackPointerMovement();
setButtonActions();