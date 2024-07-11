let iterationCount: number;
let generationCount: number;

let imgWidth: number;
let imgHeight: number;

let source: Uint8ClampedArray;
let target: Uint8ClampedArray;
let imageData: Uint8ClampedArray;

let stopped = false;

onmessage = e => {
    target = e.data.target;
    imgWidth = e.data.imgWidth;
    imgHeight = e.data.imgHeight;
    iterationCount = e.data.iterationCount;
    generationCount = e.data.generationCount;

    imageData = new Uint8ClampedArray(target.length);
    source = new Uint8ClampedArray(target.length);
    for(let i = 0; i < source.length; ++i) {
        source[i] = 0;
    }

    const simpleMode = generationCount === 1;

    let it = 0;
    while(!stopped && it < iterationCount) {
        // const startTime = performance.now();
        if(simpleMode) iterateSimple(it);
        else iterate(it);
        // const stopTime = performance.now();
        // console.log((stopTime - startTime) + " ms");
        ++it;
    }
}

function random(max: number) {
    return Math.random() * max;
}

function randomRange(min: number, max: number) {
    return min + Math.random() * (max - min);
}
  
function map(current: number, in_min: number, in_max: number, out_min: number, out_max: number) {
    return ((current - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
}

function easeOutQuint(x: number): number {
    return 1 - Math.pow(1 - x, 8);
}

function drawRect(arr: Uint8ClampedArray, x: number, y: number, w: number, h: number, c: [number, number, number]) {
    for(let px = x - w/2; px < x + w/2; ++px) {
        for(let py = y - h/2; py < y + h/2; ++py) {
            if(px >= 0 && py >= 0 && px < imgWidth && py < imgHeight) {
                const index = (px + py * imgWidth) * 4;
                arr[index] = c[0];
                arr[index + 1] = c[1];
                arr[index + 2] = c[2];
            }
        }
    }
}

function calculateScore(source: Uint8ClampedArray, target: Uint8ClampedArray) {
    let score = 0;
    for(let i = 0; i < source.length; ++i) {
        score += Math.abs(source[i] - target[i]);
    }
    return score;
}

function getAverage(x: number, y: number, w: number, h: number): [number, number, number] {
    let r = 0;
    let g = 0;
    let b = 0;
    for(let px = x - w/2; px < x + w/2; ++px) {
        for(let py = y - h/2; py < y + h/2; ++py) {
            if(px >= 0 && py >= 0 && px < imgWidth && py < imgHeight) {
                let index = (px + py * imgWidth) * 4;
                r += target[index];
                g += target[index + 1];
                b += target[index + 2];
            }
        }
    }
    return [r / (w*h), g / (w*h), b / (w*h)];
}

function iterate(index: number) {
    const progress = index / iterationCount;
    let bestGen = source;
    let bestGenScore = -1;
    let bestGenRect = {
        x: 0,
        y: 0,
        size: 0,
        color: [0, 0, 0]
    }

    for(let i = 0; i < generationCount; ++i) {
        source.set(source);

        const size = Math.round(randomRange(2, map(easeOutQuint(progress), 0, 1, 600, 10)));
        const x = Math.round(random(imgWidth));
        const y = Math.round(random(imgHeight));

        const color = getAverage(x, y, size, size);
        drawRect(imageData, x, y, size, size, color);

        const score = calculateScore(target, imageData);
        if(bestGenScore == -1 || score < bestGenScore) {
            bestGen = imageData;
            bestGenScore = score;
            bestGenRect.x = x;
            bestGenRect.y = y;
            bestGenRect.size = size;
            bestGenRect.color = color;
        }
    }
    
    source = bestGen;
    postMessage({
        rects: [bestGenRect],
        progress,
    });
}

let lastPostTime = 0;
let postRects: any[] = [];
const postDebounce = 1000 / 144;

function iterateSimple(index: number) {
    const progress = index / (iterationCount - 1);
    const size = Math.floor(randomRange(2, map(easeOutQuint(progress), 0, 1, 600, 10)));
    const x = Math.floor(random(imgWidth)) - size / 2;
    const y = Math.floor(random(imgHeight)) - size / 2;
    const color = getAverage(x, y, size, size);
    
    const now = performance.now();
    if(now > lastPostTime + postDebounce || index === iterationCount - 1) {
        lastPostTime = now;
        postMessage({
            rects: postRects,
            progress,
        });
        postRects = [];
    } else {
        postRects.push({ x, y, size, color });
    }
}