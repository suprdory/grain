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
        dhdx[x]--;
        dhdx[x-1]++;
        return true;
    }
    else{
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
            dhdx[x-1]--;
            dhdx[x]+=2;
            dhdx[x+1]--;

        }
        else {
            movePixel(x + 1, Y - height[x + 1], x, Y - height[x] - 1)
            height[x + 1]--;
            height[x]++;
            
            dhdx[x-1]++;
            dhdx[x]-=2;
            dhdx[x+1]++;

        }
        // dhdx = diff(height);
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
let nMax = X*Y;

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
    if(( n < nMax)){
        if (add_grain(sourceColumn, n % nCols)){
            n++
        };
        while (random_tumble()) { };
        requestAnimationFrame(anim);
    }
}

anim()
