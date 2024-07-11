import { antialiazedRenderPixel } from "./rendering";
import { Vector } from "./vector";

onmessage = e => {
    let { index, count, obstacles, width, height, OPTS } = e.data;

    for(let obstacle of obstacles) {
        for(let attr in obstacle) {
            if(typeof obstacle[attr].x === 'number') {
                obstacle[attr] = new Vector(obstacle[attr].x, obstacle[attr].y, obstacle[attr].z);
            }
        }
    }
    
    for(let attr in OPTS) {
        if(typeof OPTS[attr].x === 'number') {
            OPTS[attr] = new Vector(OPTS[attr].x, OPTS[attr].y, OPTS[attr].z);
        }
    }

    const OPTIONS = OPTS;

    let arrayLength = height * 6 * Math.floor(width / count);
    let data = new Uint16Array(arrayLength);

    let id = 0;
    for(let i = index; i < width; i += count) {
        for(let j = 0; j < height; ++j) {
            let col = antialiazedRenderPixel(i, j, width, height, OPTIONS.ANTIALIASING, OPTIONS, obstacles);
            data[id] = i;
            data[id + 1] = j;
            data[id + 2] = col[0];
            data[id + 3] = col[1];
            data[id + 4] = col[2];
            data[id + 5] = col[3];
            id += 6;
        }
        postMessage(i / width)
    }
    postMessage(data);
}