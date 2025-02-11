<script lang="ts">
    import type P5 from "p5";
    import { onDestroy, onMount } from "svelte";
    import vertex from "./vertex.glsl?raw";
    import fragment from "./fragment.glsl?raw";

    let canvasContainer: HTMLDivElement;
    let p5: P5;
    let currentFPS: number = 0;

    let sketch = (sk: P5) => {
        let rm_shader: P5.Shader;

        let sensivity = 1;
        let cameraSpeed = 5;
        let cameraPos: P5.Vector;
        let cameraRot: P5.Vector;
        let lightPos: P5.Vector;
        let shader_data: P5.Image;

        function rotateAround(vect: P5.Vector, axis: P5.Vector, angle: number) {
            axis.normalize();
            return vect.copy().mult(sk.cos(angle))
                .add(vect.cross(axis).mult(sk.sin(angle)))
                .add(axis.copy().mult(axis.dot(vect)).mult(1 - sk.cos(angle)));
        }

        sk.setup = () => {
            const nav = document.getElementById("nav")!;
            const canvas = sk.createCanvas(window.innerWidth - nav.clientWidth, window.innerHeight, sk.WEBGL);
            canvas.parent(canvasContainer);

            sk.frameRate(165);
            sk.noStroke();

            shader_data = sk.createImage(100, 100);
            rm_shader = sk.createShader(vertex, fragment);
            sk.shader(rm_shader);

            cameraPos = sk.createVector(0, 1, 0);
            cameraRot = sk.createVector(0, 0, 0);
            lightPos = sk.createVector(0, 5, 0);

            rm_shader.setUniform("scene", shader_data);
            rm_shader.setUniform("light_pos", [lightPos.x, lightPos.y, lightPos.z]);
            rm_shader.setUniform("time", sk.millis() / 1000);
            rm_shader.setUniform("camera_pos", [cameraPos.x, cameraPos.y, cameraPos.z]);
            rm_shader.setUniform("camera_rot", [cameraRot.x, cameraRot.y, cameraRot.z]);
            rm_shader.setUniform("fov_scale", 1);
            rm_shader.setUniform("resolution", [sk.width, sk.height]);
            rm_shader.setUniform("max_steps", 100);
            rm_shader.setUniform("max_travel_distance", 100);
        }

        function isInScreen(x: number, y: number) {
            return x >= 0 && y >= 0 && x < sk.width && x < sk.height;
        }

        sk.mousePressed = () => {
            if(isInScreen(sk.mouseX, sk.mouseY)) {
                sk.requestPointerLock();
            }
        }

        sk.mouseReleased = () => {
            if(isInScreen(sk.mouseX, sk.mouseY)) {
                sk.exitPointerLock();
            }
        }

        sk.mouseDragged = () => {
            cameraRot.y += sk.movedX * sensivity / 1000;
            cameraRot.x += sk.movedY * sensivity / 1000;
        }

        sk.draw = () => {
            const delta = sk.deltaTime / 1000;
            if(sk.frameCount % 10 === 0) {
                currentFPS = Math.floor(sk.frameRate());
            }

            let cameraDir = sk.createVector(0, 0, 1);
            cameraDir = rotateAround(cameraDir, sk.createVector(1, 0, 0), -cameraRot.x);
            cameraDir = rotateAround(cameraDir, sk.createVector(0, 1, 0), -cameraRot.y);
            cameraDir = rotateAround(cameraDir, sk.createVector(0, 0, 1), -cameraRot.z);
            const up = sk.createVector(0, 1, 0);
            const cameraRight = cameraDir.cross(up);

            if(sk.keyIsDown(90)) { // Z
                cameraPos.add(cameraDir.copy().mult(delta * cameraSpeed));
            }
            if(sk.keyIsDown(81)) { // Q
                cameraPos.add(cameraRight.copy().mult(delta * cameraSpeed));
            }
            if(sk.keyIsDown(83)) { // S
                cameraPos.add(cameraDir.copy().mult(-1 * delta * cameraSpeed));
            }
            if(sk.keyIsDown(68)) { // D
                cameraPos.add(cameraRight.copy().mult(-1 * delta * cameraSpeed));
            }
            if(sk.keyIsDown(32)) { // SPACE
                cameraPos.add(up.copy().mult(delta * cameraSpeed));
            }
            if(sk.keyIsDown(17)) { // CTRL
                cameraPos.add(up.copy().mult(-1 * delta * cameraSpeed));
            }
            rm_shader.setUniform("time", sk.millis() / 1000);
            rm_shader.setUniform("camera_pos", [cameraPos.x, cameraPos.y, cameraPos.z]);
            rm_shader.setUniform("camera_rot", [cameraRot.x, cameraRot.y, cameraRot.z]);
            sk.quad(-1, -1, 1, -1, 1, 1, -1, 1);
        }
    }

    onMount(async () => {
        const P5 = await import("p5");
        p5 = new P5.default(sketch);
    });

    onDestroy(() => {
        p5?.remove();
    });
</script>

<div bind:this={canvasContainer} class="w-full h-full relative">
    <div class="absolute top-2 left-2 text-border">{currentFPS} FPS</div>
</div>

<style>
    .text-border {
        text-shadow: 1px 1px #000;
    }
</style>