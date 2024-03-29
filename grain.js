Array.prototype.random = function () {
    return this[Math.floor((Math.random() * this.length))];
}
let log = console.log;
import { createColormap, getMapNames } from "./colormaps.js";
function getMouseRowCol(event) {
    // log(event)
    // Get the mouse coordinates relative to the canvas
    // in cavans pixels, not css pixels
    var x = Math.floor(canvasBot.width / canvasBot.getBoundingClientRect().width * (event.clientX - canvasBot.getBoundingClientRect().left));
    var y = Math.floor(canvasBot.width / canvasBot.getBoundingClientRect().width * (event.clientY - canvasBot.getBoundingClientRect().top));
    return { 'column': x, 'row': y }

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
    if (pane.height[x] < pane.Y) {// column not full
        // log(pix.data[0], colour)
        pix.data[0] = colour[0];
        pix.data[1] = colour[1];
        pix.data[2] = colour[2];
        pix.data[3] = 255
        pane.ctx.putImageData(pix, x, pane.Y - pane.height[x] - 1);
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
function drawFalling(pane, x, colour) {
    pix.data[0] = colour[0];
    pix.data[1] = colour[1];
    pix.data[2] = colour[2];
    pix.data[3] = 255
    for (let y = 0; y < (pane.Y - pane.height[x]); y++) {
        if (Math.random() > 0.95) {
            pane.ctx.putImageData(pix, x, y)
        }
    }


}
function removeFalling(pane, x) {
    for (let y = 0; y < (pane.Y - pane.height[x]); y++) {
        pane.ctx.putImageData(pane.pix0, x, y)
    }
}
function removeGrain(pane, x, pix) {
    // log(pane.height)
    if (pane.height[x] - pane.base[x] > 0) {

        let pixOut = pane.ctx.getImageData(x, pane.Y - 1, 1, 1).data
        pix.data[0] = pixOut[0]
        pix.data[1] = pixOut[1]
        pix.data[2] = pixOut[2]
        pix.data[3] = 255
        pane.ctx.putImageData(pane.pix0, x, pane.Y - 1)
        if (pane.height[x] > 1) {
            pane.base[x]++; // increment base height, if grains above
            pane.holes.push([x, pane.Y - 1])
        }
        else {
            pane.height[x] = 0;
            pane.dhdx = diff(pane.height)
        }
        while (random_hole_diff(paneT)) { }
        while (random_tumble(paneT)) { }

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
            movePixel(pane, x, pane.Y - pane.height[x], x + 1, pane.Y - pane.height[x + 1] - 1)
            pane.height[x]--;
            pane.height[x + 1]++;
            pane.dhdx[x - 1]--;
            pane.dhdx[x] += 2;
            pane.dhdx[x + 1]--;

        }
        else {
            movePixel(pane, x + 1, pane.Y - pane.height[x + 1], x, pane.Y - pane.height[x] - 1)
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
function random_hole_diff(pane) {
    // assume max 1 hole, so function should always be called after grain removal and 
    // called until it returns false, i.e. no hole remaining.

    // diffuse holes upwards and sidewards until they get to the top and dissappear.  
    // requires array containing hole coors, could be empty
    // log('n', pane.holes.length, pane.holes[0])
    if (pane.holes.length > 0) {
        let x = pane.holes[0][0]
        let y = pane.holes[0][1]
        // log(x, y)
        let left_thresh, right_thresh
        if (x == 0) {
            //left edge
            // log('left edge')
            left_thresh = 0
            right_thresh = 0.5

        }
        else if (x == (pane.X - 1)) {
            //right edge
            // log('right edge')
            left_thresh = 0.5
            right_thresh = 1.0
        }
        else {
            // log('no edge')
            left_thresh = 0.333
            right_thresh = 0.666
            //not edge case, equal chance of up or side propagation
        }

        const randomNumber = Math.random();
        if (randomNumber < left_thresh) {
            // console.log("Left");
            movePixel(pane, x - 1, y, x, y)
            if (pane.Y - (y) < pane.height[x - 1]) {
                pane.holes[0] = [x - 1, y]
            }
            else {
                pane.holes = []
                pane.height[x - 1]--
                pane.dhdx[x - 2]--
                pane.dhdx[x - 1]++
            }
            if (y == (pane.Y - 1)) {
                //affects base height
                pane.base[x - 1] = 1
                pane.base[x] = 0
            }
        }
        else if (randomNumber < right_thresh) {
            // console.log("Up");
            movePixel(pane, x, y - 1, x, y)
            if (pane.Y - (y - 1) < pane.height[x]) {
                pane.holes[0] = [x, y - 1]
            }
            else {
                pane.holes = []
                pane.height[x]--
                pane.dhdx[x - 1]--
                pane.dhdx[x]++
            }
            if (y == (pane.Y - 1)) {
                //affects base height
                pane.base[x] = 0
            }
        }
        else {
            // console.log("Right");
            movePixel(pane, x + 1, y, x, y)
            if (pane.Y - (y) < pane.height[x + 1]) {
                pane.holes[0] = [x + 1, y]
            }
            else {
                pane.holes = []
                pane.height[x + 1]--
                pane.dhdx[x]--
                pane.dhdx[x + 1]++
            }
            if (y == (pane.Y - 1)) {
                //affects base height
                pane.base[x + 1] = 1
                pane.base[x] = 0
            }
        }
        // log('new pos', pane.holes[0])
        return true;
    }
    else {
        //no holes
        return false
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

        if (split) {
            ctxScr.drawImage(canvasTop, 0, 0, window.innerWidth, window.innerHeight * topFrac)
            ctxScr.drawImage(canvasBot, 0, window.innerHeight * topFrac, window.innerWidth, window.innerHeight * (1 - topFrac))
        }
        else {
            ctxScr.drawImage(canvasBot, 0, 0, window.innerWidth, window.innerHeight)
        }

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

    const clearButton = document.getElementById('clearBtn');
    clearButton.addEventListener('click', () => {
        clearScreen()
    })

    const shuffleButton = document.getElementById('shuffleBtn');
    shuffleButton.addEventListener('click', () => {
        shuffle()
        if (split) {
            paneBinUse = false;
            splitMode()
        }
        else {
            paneBinUse = false;
            singleMode()
        }

    })

    const flipButton = document.getElementById('flipBtn');
    flipButton.addEventListener('click', () => {
        animInvert();
    })

    const splitButton = document.getElementById('splitBtn');
    splitButton.addEventListener('click', () => {
      switchMode(splitButton,flipButton,clearButton)
    })

}
function switchMode(splitButton,flipButton,clearButton){
    splitButton.classList.toggle('split');
    const icon = splitButton.querySelector('i');
    if (splitButton.classList.contains('split')) {
        icon.textContent = 'crop_portrait'
        split = true
        flipButton.style.display = 'block';
        clearButton.style.display = 'none';
        splitMode();
    }
    else {
        icon.textContent = 'splitscreen'
        split = false
        flipButton.style.display = 'none';
        clearButton.style.display = 'block';
        singleMode();
    }
}
function clearScreen() {
    clearPane(paneB);
    // clearPane(paneT);
}
function clearPane(pane) {
    pane.ctx.reset();
    pane.height = new Int16Array(X);
    pane.dhdx = diff(pane.height);
    pane.base = new Int16Array(X);
    n = 0;
}
function shuffle() {
    let Xs = [100, 150, 200, 400];
    X = getRandomElement(Xs)
    // X = 50
    sourceColumn = Math.floor((Math.random() * X))
    let colourSpeeds = [4, 8, 16, 32, 64]
    colourSpeed = getRandomElement(colourSpeeds)
    colourMapName = getRandomElement(getMapNames())
    colDir = getRandomElement([-1, 1]);
    speed = X / 50;

    log('X', X, ', sourceColumn', sourceColumn, ', palette', colourMapName, ', speed', speed, ', colourSpeed', colourSpeed, ', colDir', colDir)

}
function invertY(pane) {
    let column;
    for (let x = 0; x < pane.X; x++) {
        column = pane.ctx.getImageData(x, 0, 1, pane.Y)

        for (let h = 0; h < pane.height[x]; h++) {

            pix.data[0] = column.data[4 * (pane.Y - 1 - h)]
            pix.data[1] = column.data[4 * (pane.Y - 1 - h) + 1]
            pix.data[2] = column.data[4 * (pane.Y - 1 - h) + 2]

            pane.ctx.putImageData(pix, x, pane.Y - pane.height[x] + h)
        }
    }

}
function flip() {
    removeFalling(paneB, lastSourceColumn)
    invertY(paneT)
    invertY(paneB)

    let topPaneData = paneT.ctx.getImageData(0, 0, paneT.X, paneT.Y)
    let topPaneHeight = paneT.height
    let topPaneBase = paneT.base
    let topPaneDhdx = paneT.dhdx
    let topPaneHoles = paneT.holes

    paneT.ctx.putImageData(paneB.ctx.getImageData(0, 0, paneB.X, paneB.Y), 0, 0)
    paneB.ctx.putImageData(topPaneData, 0, 0)

    paneT.height = paneB.height;
    paneT.dhdx = paneB.dhdx;
    paneT.base = paneB.base;
    paneT.holes = paneB.holes;


    paneB.height = topPaneHeight;
    paneB.dhdx = topPaneDhdx;
    paneB.base = topPaneBase;
    paneB.holes = topPaneHoles;
}
function initPane(canvas, X, yFrac, col) {
    let windowAR = window.innerWidth / window.innerHeight;
    let Y = Math.round(yFrac * X / windowAR)
    canvas.height = Y;
    canvas.width = X;
    canvas.style.width = window.innerWidth + "px";
    let height = new Int16Array(X); // top of column
    let base = new Int16Array(X); // start of column
    let dhdx = diff(height);
    // log('canvas width', canvas.width)

    //background// 
    let ctx = canvas.getContext('2d', { willReadFrequently: true })
    ctx.fillStyle = col;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    let pix0 = ctx.getImageData(0, 0, 1, 1);

    let pane = {}
    pane.holes = [];
    pane.height = height;
    pane.dhdx = dhdx;
    pane.base = base;
    pane.pix0 = pix0;
    pane.ctx = ctx;
    pane.X = X;
    pane.Y = Y;
    return pane
}
function fillPane(pane, nRows, nColsFill) {
    colours = createColormap({ colormap: colourMapName, format: 'rgba', nshades: nColsFill, })
    // log('nCols',colours.length,nColsFill)
    let colxFill = 0;
    // log('colDir',colDir)
    for (let y = 0; y < nRows; y++) {
        for (let x = 0; x < pane.X; x++) {
            colxFill += colDir
            let colour = colours[((colxFill % nColsFill) + nColsFill) % nColsFill]
            // log(colour)
            add_grain(pane, x, colour)

        }
    }

}
function cropPane(pane, canvas, X, yFrac, col) {
    //crop pane to fit in new canvas Y size

    let windowAR = window.innerWidth / window.innerHeight;
    let Y = Math.round(yFrac * X / windowAR)
    //get existing bottom pane data, copy to new canvas after init
    let oldData = pane.ctx.getImageData(0, pane.Y - Y, X, Y)
    // log(oldData, pane.Y, Y)

    canvas.height = Y;
    canvas.width = X;
    canvas.style.width = window.innerWidth + "px";
    let height = pane.height
    //cap new height values at pane height
    for (let i = 0; i < height.length; i++) {
        height[i] = Math.min(height[i], Y);
    }
    let base = pane.base
    let dhdx = diff(height);
    // log('canvas width', canvas.width)

    //background// 
    let ctx = canvas.getContext('2d')
    ctx.fillStyle = col;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    let pix0 = ctx.getImageData(0, 0, 1, 1);

    ctx.putImageData(oldData, 0, 0)

    pane = {}
    pane.holes = [];
    pane.height = height;
    pane.dhdx = dhdx;
    pane.base = base;
    pane.pix0 = pix0;
    pane.ctx = ctx;
    pane.X = X;
    pane.Y = Y;
    return pane
}
function copyPane(pane, canvas, X, yFrac, col) {
    //copy pane into new (taller) canvas
    // log('copying pane')
    let windowAR = window.innerWidth / window.innerHeight;
    let Y = Math.round(yFrac * X / windowAR)
    //get existing bottom pane data, copy to new canvas after init
    let oldData = pane.ctx.getImageData(0, 0, pane.X, pane.Y)
    // log(oldData, pane.X, pane.Y,X,Y)

    canvas.height = Y;
    canvas.width = X;
    canvas.style.width = window.innerWidth + "px";

    let height = pane.height
    let base = pane.base
    let dhdx = diff(height);
    // log('canvas width', canvas.width)

    //background// 
    let ctx = canvas.getContext('2d')
    ctx.fillStyle = col;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    let pix0 = ctx.getImageData(0, 0, 1, 1);

    ctx.putImageData(oldData, 0, Y - pane.Y)

    pane = {}
    pane.holes = [];
    pane.height = height;
    pane.dhdx = dhdx;
    pane.base = base;
    pane.pix0 = pix0;
    pane.ctx = ctx;
    pane.X = X;
    pane.Y = Y;
    return pane
}
function splitMode() {

    topFrac = 0.5 // flipping requires 50/50 atm
    paneT = initPane(canvasTop, X, topFrac, 'black')
    if (paneBinUse) {
        //create new bottom pane from old bottom pane
        paneB = cropPane(paneB, canvasBot, X, 1 - topFrac, 'black');
    }
    else {
        paneB = initPane(canvasBot, X, 1 - topFrac, 'black')
    }
    // paneB = initPane(canvasBot, X, 1 - topFrac, 'black')
    canvasTop.style.setProperty('height', 'calc(' + topFrac + ' * (100% - 64px))');
    canvasBot.style.setProperty('height', 'calc(' + (1.0 - topFrac) + ' * (100% - 64px))');
    canvasBot.style.setProperty('top', 'calc(' + topFrac + ' * (100% - 64px))');

    if (!paneBinUse) {
        let fillFrac = 0.8
        let fillRows = Math.round(paneT.Y * fillFrac)

        let colFrac = getRandomElement([1, 1, 1, 1, 1, 0.5, 0.75])
        let nColsFill = Math.round(X * (fillRows) * colFrac + 1)
        fillPane(paneT, fillRows, nColsFill);
        sourceColumn = Math.round((Math.random() * X))
        nMax = X * fillRows;
    }
    else (
        animInvert()
    )
    n = 0
}
function anim() {
    let colour
    if (split) {
        removeFalling(paneB, lastSourceColumn)
        for (let i = 0; i < speed; i++) {
            if (removeGrain(paneT, sourceColumn, pix)) {
                add_grain(paneB, sourceColumn, pix.data);
            }
            drawFalling(paneB, sourceColumn, pix.data)
            lastSourceColumn = sourceColumn;
            paneBinUse = true;
        }
        if (play) {
            requestAnimationFrame(anim);
        }
        else{
            removeFalling(paneB, lastSourceColumn)
        }
    }
    else {
        removeFalling(paneB, lastSourceColumn)
        for (let i = 0; i < speed; i++) {
            colour = colours[((colx % nCols) + nCols) % nCols]
            add_grain(paneB, sourceColumn, colour)
            colx += colDir;
        }
        paneBinUse = true;
        lastSourceColumn = sourceColumn;
        drawFalling(paneB, sourceColumn, colour)

        if (play) {
            requestAnimationFrame(anim);
        }
        else{
            removeFalling(paneB, lastSourceColumn)
        }
    }
}
function singleMode() {
    // log('init single X', X)
    if (paneBinUse) {
        paneB = copyPane(paneB, canvasBot, X, 1, 'black')
    }
    else {
        paneB = initPane(canvasBot, X, 1, 'black')
    }

    canvasBot.style.setProperty('height', 'calc((100% - 64px))');
    canvasBot.style.setProperty('top', 0);
    canvasTop.style.setProperty('height', 0);
    canvasTop.style.setProperty('top', 0);

    nCols = X * colourSpeed;
    colours = createColormap({ colormap: colourMapName, format: 'rgba', nshades: nCols, })
    // log('nCols',nCols,colours.length)
}
function animInvert() {
    let nFrames = 15
    let n = 0
    let t;
    let topFrac = 0.5
    animUp()
    // flip()
    // animDown()

    function animDown() {
        // log('animDown',n)
        n -= 1 / nFrames
        t = 1 - n * 1
        // log(t)
        canvasTop.style.setProperty('height', 'calc(' + t * (1.0 - topFrac) + ' * (100% - 64px))');
        canvasTop.style.setProperty('top', 'calc(' + n * 1 * topFrac + ' * (100% - 64px))');
        canvasBot.style.setProperty('height', 'calc(' + t * (1.0 - topFrac) + ' * (100% - 64px))');
        if (n > 0.0) {
            requestAnimationFrame(animDown)
        }
        else {
            canvasTop.style.setProperty('height', 'calc(' + topFrac + ' * (100% - 64px))');
            canvasTop.style.setProperty('top', 0);
            canvasBot.style.setProperty('height', 'calc(' + (1.0 - topFrac) + ' * (100% - 64px))');
            canvasBot.style.setProperty('top', 'calc(' + topFrac + ' * (100% - 64px))');
        }

    }
    function animUp() {
        // log('animUp')
        n += 1 / nFrames
        t = 1 - n * 1
        canvasTop.style.setProperty('height', 'calc(' + t * (1.0 - topFrac) + ' * (100% - 64px))');
        canvasTop.style.setProperty('top', 'calc(' + n * 1 * topFrac + ' * (100% - 64px))');
        canvasBot.style.setProperty('height', 'calc(' + t * (1.0 - topFrac) + ' * (100% - 64px))');
        if (n < 1.0) {
            requestAnimationFrame(animUp)
        }
        else {
            flip()
            animDown()
        }
    }
}

let sourceColumn, speed, paneT, paneB, topFrac, X, paneBinUse
let colDir, colx, nCols, colours, colourSpeed, colourMapName, n,nMax
let lastSourceColumn = 0
let split = false;

// get canvas, contexts, and pixel, objs
let canvasTop = document.getElementById("canvasTop");
let canvasBot = document.getElementById("canvasBot");
let pix = canvasBot.getContext("2d",
    {
        alpha: false,
        willReadFrequently: true,
    }).getImageData(0, 0, 1, 1);
// log(pix)

canvasBot.addEventListener('click', setSourceColumn);
canvasTop.addEventListener('click', setSourceColumn);

let play = true
// n = 0;
colx = 0;
shuffle();
if (colDir == -1) { colx = -1 }
trackPointerMovement();
setButtonActions();

// enable single mode at start
// singleMode();


// enable double mode at start
const clearButton = document.getElementById('clearBtn');
const splitButton = document.getElementById('splitBtn');
const flipButton = document.getElementById('flipBtn');
switchMode(splitButton,flipButton,clearButton)


anim()