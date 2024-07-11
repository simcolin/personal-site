export function mergeColors(...colors: number[][]) {
    let finalColor = [0, 0, 0, 0];
    for(let i = 0; i < colors.length; ++i) {
        for(let j = 0; j < 4; ++j) {
            finalColor[j] += colors[i][j];
        }
    }
    for(let j = 0; j < 4; ++j) {
        finalColor[j] /= colors.length;
    }
    return finalColor;
}

export function colorLerp(a: number[], b: number[], t: number): number[] {
    return [
        a[0] + (b[0] - a[0]) * t,
        a[1] + (b[1] - a[1]) * t,
        a[2] + (b[2] - a[2]) * t,
        a[3] + (b[3] - a[3]) * t,
    ];
}

export function map(val: number, from: number, to: number, min: number, max: number) {
    return (val - from) * (max - min) / (to - from) + min;
}

export function colorToHex(color: number[]) {
    return '#' + color[0].toString(16).padStart(2, '0')
        + color[1].toString(16).padStart(2, '0')
        + color[2].toString(16).padStart(2, '0');
}

export function hexToColor(hex: string) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
        255,
    ] : [0, 0, 0, 0];
}