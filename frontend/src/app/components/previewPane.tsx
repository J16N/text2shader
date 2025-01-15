'use client';

import styles from './previewPane.module.css';
import Image from 'next/image';
import errorIcon from '../../../public/error.svg';
import { useState } from 'react';

/*const testHtml = `
<html>

<head>
    <style>
        canvas {
            width: 100%;
            height: 100vh;
            display: block;
        }

        body {
            margin: 0;
        }
    </style>
</head>

<body>
    <canvas id="glCanvas"></canvas>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/gl-matrix/3.4.2/gl-matrix-min.js"></script>
    <script type="text/javascript">
        for (const [key, value] of Object.entries(glMatrix)) {
            window[key] = value;
        }
        // const { mat2, mat2d, mat4, mat3, quat, quat2, vec2, vec3, vec4 } = glMatrix;
        function initWebGL() {
            const canvas = document.getElementById("glCanvas");
            const gl = canvas.getContext("webgl");
            if (!gl) {
                console.error("WebGL not supported!");
                return;
            }

            // Vertex data
            const vertices = [
                -1,
                -1,
                -1,
                1,
                0,
                0,
                1,
                -1,
                -1,
                0,
                1,
                0,
                1,
                1,
                -1,
                0,
                0,
                1,
                -1,
                1,
                -1,
                1,
                1,
                0,
                -1,
                -1,
                1,
                0,
                1,
                1,
                1,
                -1,
                1,
                1,
                0,
                1,
                1,
                1,
                1,
                1,
                1,
                1,
                -1,
                1,
                1,
                0,
                0,
                0
            ];

            const indices = [
                0,
                1,
                2,
                0,
                2,
                3,
                4,
                5,
                6,
                4,
                6,
                7,
                0,
                4,
                7,
                0,
                7,
                3,
                1,
                5,
                6,
                1,
                6,
                2,
                0,
                1,
                5,
                0,
                5,
                4,
                2,
                3,
                7,
                2,
                7,
                6
            ];

            // Create buffers
            const vertexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

            const indexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
            gl.bufferData(
                gl.ELEMENT_ARRAY_BUFFER,
                new Uint16Array(indices),
                gl.STATIC_DRAW
            );

            // Shaders
            const vertexShader = gl.createShader(gl.VERTEX_SHADER);
            gl.shaderSource(vertexShader, vertexShaderSource);
            gl.compileShader(vertexShader);
            if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
                console.error(
                    "Vertex shader compilation failed:",
                    gl.getShaderInfoLog(vertexShader)
                );
                gl.deleteShader(vertexShader);
                return;
            }

            const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
            gl.shaderSource(fragmentShader, fragmentShaderSource);
            gl.compileShader(fragmentShader);
            if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
                console.error(
                    "Fragment shader compilation failed:",
                    gl.getShaderInfoLog(fragmentShader)
                );
                gl.deleteShader(fragmentShader);
                return;
            }

            // Program
            const program = gl.createProgram();
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            gl.linkProgram(program);
            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                console.error("Program linking failed:", gl.getProgramInfoLog(program));
                gl.deleteProgram(program);
                return;
            }
            gl.useProgram(program);

            // Attributes
            const aVertexPosition = gl.getAttribLocation(program, "aVertexPosition");
            const aVertexColor = gl.getAttribLocation(program, "aVertexColor");
            gl.enableVertexAttribArray(aVertexPosition);
            gl.vertexAttribPointer(
                aVertexPosition,
                3,
                gl.FLOAT,
                false,
                6 * Float32Array.BYTES_PER_ELEMENT,
                0
            );
            gl.enableVertexAttribArray(aVertexColor);
            gl.vertexAttribPointer(
                aVertexColor,
                3,
                gl.FLOAT,
                false,
                6 * Float32Array.BYTES_PER_ELEMENT,
                3 * Float32Array.BYTES_PER_ELEMENT
            );

            // Uniforms
            const uModelViewMatrix = gl.getUniformLocation(program, "uModelViewMatrix");
            const uProjectionMatrix = gl.getUniformLocation(program, "uProjectionMatrix");

            const modelViewMatrix = mat4.create();
            const projectionMatrix = mat4.create();
            mat4.perspective(
                projectionMatrix,
                (45 * Math.PI) / 180,
                canvas.width / canvas.height,
                0.1,
                100
            );

            function render(time) {
                time *= 0.001;
                mat4.identity(modelViewMatrix);
                mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, -6]);
                mat4.rotateY(modelViewMatrix, modelViewMatrix, time);
                mat4.rotateX(modelViewMatrix, modelViewMatrix, time * 0.7);
                gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix);
                gl.uniformMatrix4fv(uProjectionMatrix, false, projectionMatrix);
                gl.clearColor(0.2, 0.3, 0.8, 1.0);
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                gl.enable(gl.DEPTH_TEST);
                gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
                requestAnimationFrame(render);
            }

            requestAnimationFrame(render);
        }

        const vertexShaderSource = \`
// Vertex shader
precision mediump float;

attribute vec3 aVertexPosition;
attribute vec3 aVertexColor;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

varying vec3 vColor;

void main(void) {
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);
  vColor = aVertexColor;
}
\`;

        const fragmentShaderSource = \`
// Fragment shader
precision mediump float;

varying vec3 vColor;

void main(void) {
  gl_FragColor = vec4(vColor, 1.0);
}
\`;

        initWebGL();

    </script>
</body>

</html>
`;*/

interface PreviewPaneProps {
    errors: string[];
    html: string;
    ref: React.RefObject<HTMLIFrameElement | null>;
}

export default function PreviewPane({ props }: { props: PreviewPaneProps }) {
    const { html, ref, errors } = props;
    const [open, setOpen] = useState<boolean>(false);

    return (
        <div className={styles.previewPane}>
            <iframe
                className={styles.iframe}
                srcDoc={html.trim()}
                title="Shader"
                sandbox="allow-scripts"
                ref={ref}
            />
            <div className={`${styles.console} ${open ? styles.consoleOpen : ''}`}>
                <div className={styles.consoleHeader}>
                    <button onClick={() => setOpen(!open)}></button>
                    {errors.length > 0 && <div>
                        <span className={styles.error}>
                            <Image
                                priority
                                src={errorIcon}
                                alt="Error"
                            />
                        </span>
                        <span>{errors.length}</span>
                    </div>}
                </div>
                <div className={styles.consoleBody}>
                    {errors.map((error, index) => (
                        <div key={index} className={styles.errorMessage}>{error}</div>
                    ))}
                </div>
            </div>
        </div>
    );
}