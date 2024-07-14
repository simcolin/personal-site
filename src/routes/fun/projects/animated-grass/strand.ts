import { u, type Color } from "../utils";

const STRAND_COLOR = u.color(0, 255, 0, 255);
const BLACK = u.color(0, 0, 0, 255);

export class PixelatedStrand {
    constructor(
        public x: number,
        public y: number,
        public colors: Color[],
        public positions: number[],
    ) { }

    update(tilt: number, wind: number) {
        let topStrandColor = BLACK.toLerped(STRAND_COLOR, wind);
        for (let i = 0; i < this.colors.length; i++) {
            let offset = Math.round(tilt * wind * 0.5 * Math.pow(i, 1.5));
            this.positions[i*2] = this.x + offset;
            this.positions[i*2+1] = this.y - i;
            this.colors[i] = BLACK.toLerped(topStrandColor, 1.0 * i / this.colors.length);
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        for (let i = 0; i < this.colors.length; ++i) {
            ctx.fillStyle = this.colors[i].toRGBA();
            ctx.fillRect(this.positions[i*2], this.positions[i*2+1], 1, 1);
        }
    }
}

export class Strand {
    constructor(
        public x: number,
        public y: number,
        public colors: Color[],
        public positions: number[],
    ) { }

    update(tilt: number, wind: number) {
        let topStrandColor = BLACK.toLerped(STRAND_COLOR, wind);
        for (let i = 0; i < this.colors.length; i++) {
            let offset = tilt * wind * 0.5 * Math.pow(i, 1.5);
            this.positions[i*2] = this.x + offset * 10;
            this.positions[i*2+1] = this.y - i * 10;
            this.colors[i] = BLACK.toLerped(topStrandColor, 1.0 * i / this.colors.length);
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        let gradient = ctx.createLinearGradient(this.positions[0], this.positions[1], this.positions[this.positions.length - 2], this.positions[this.positions.length - 1]);
        gradient.addColorStop(0, this.colors[0].toRGBA());
        gradient.addColorStop(1, this.colors[this.colors.length - 1].toRGBA());
        ctx.beginPath();
        ctx.fillStyle = gradient;

        // could refactor this to use ctx.arcTo to make smoother curves
        // and keep lenth consistant when tilted
        
        ctx.moveTo(this.positions[0], this.positions[1]);
        for (let i = 1; i < this.colors.length; ++i) {
            let offset = this.colors.length - i;
            ctx.lineTo(this.positions[i*2] - offset, this.positions[i*2+1]);
        }
        for (let i = this.colors.length - 2; i >= 0; --i) {
            let offset = this.colors.length - i;
            ctx.lineTo(this.positions[i*2] + offset, this.positions[i*2+1]);
        }
        ctx.closePath();
        ctx.fill();
    }
}