Array.prototype.random = function () {
    return this[Math.floor((Math.random() * this.length))];
}
let log = console.log;
import { createColormap,getMapNames } from "./colormaps.js";

function getMouseRowCol(event) {

    // Get the mouse coordinates relative to the canvas
    // in cavans pixels, not css pixels
    var x = Math.floor(canvas.width/canvas.getBoundingClientRect().width*(event.clientX - canvas.getBoundingClientRect().left));
    var y = Math.floor(canvas.width/canvas.getBoundingClientRect().width*(event.clientY - canvas.getBoundingClientRect().top));
    return {'column':x,'row':y }
    // Output the coordinates
    // console.log('Mouse Click Coordinates: X=' + x + ', Y=' + y);

}
function setSourceColumn(event){
    let rowCol=getMouseRowCol(event);
    // log(rowCol)
    sourceColumn=rowCol.column
    
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
    }
    dhdx = diff(height);
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
            // log("highPix",x,height[x])
            movePixel(x, Y - height[x], x + 1, Y - height[x + 1] - 1)
            height[x]--;
            height[x + 1]++;
            // pix.data=ctx.getImageData(x,height[x]+4,1,1).data

        }
        else {
            movePixel(x + 1, Y - height[x + 1], x, Y - height[x] - 1)
            height[x + 1]--;
            height[x]++;

        }
        dhdx = diff(height);
        return true;
    }
    else {
        return false;
    }

}


let canvas = document.getElementById("cw");
let ctx = canvas.getContext("2d",
    {
        alpha: false,
        willReadFrequently: true,
        imageSmoothingEnabled: false
    });
// Add a click event listener to the canvas
canvas.addEventListener('click', setSourceColumn);

let nCols = 200
let colourMapNames=getMapNames()
let colourMapName=getRandomElement(colourMapNames)
log(colourMapName)
let colours = createColormap({colormap:colourMapName, format: 'rgba', nshades: nCols, })
// log(colors)

let X = 50;
let windowAR=window.innerWidth/window.innerHeight;
let Y=Math.round(X/windowAR)
// log('AR',windowAR,'Y',Y)
canvas.height = Y;
canvas.width = X;
canvas.style.width = window.innerWidth + "px";

let sourceColumn=X/2;
// canvas.style.height = 400+"px";


let pix = ctx.getImageData(0, 0, 1, 1);
let pixEmpty = ctx.getImageData(0, 0, 1, 1);
pixEmpty.data[0] = 0
pixEmpty.data[1] = 0
pixEmpty.data[2] = 0
pixEmpty.data[3] = 255

let height = new Int16Array(X);
let dhdx = diff(height);

let n = 0
let nMax = 2000

function anim() {
  
    // if (n <= nMax) {

    // }

    // while (random_tumble()) { };
    if (random_tumble()){
        requestAnimationFrame(anim);
    }
    else if(( n < nMax)){
        n++;
        add_grain(sourceColumn, n % nCols);
        requestAnimationFrame(anim);
    }

}

anim()
