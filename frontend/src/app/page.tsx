'use client';

import styles from "./page.module.css";
import { useState } from "react";
import BotMessage from "./components/botMessage";

// const response = "```glsl\n// vertex shader\n#version 300 es\nlayout (location = 0) in vec3 aPos;\n\nuniform mat4 model;\nuniform mat4 view;\nuniform mat4 projection;\n\nvoid main() {\n  gl_Position = projection * view * model * vec4(aPos, 1.0);\n}\n\n// fragment shader\n#version 300 es\nprecision mediump float;\nout vec4 FragColor;\n\nuniform vec2 resolution;\nuniform float time;\n\nvoid main() {\n  vec2 uv = gl_FragCoord.xy / resolution;\n  vec3 col = vec3(uv.x, uv.y, 0.5 + 0.5*sin(time));\n  FragColor = vec4(col, 1.0);\n}\n```\n\n```javascript\nconst canvas = document.getElementById('glCanvas');\nconst gl = canvas.getContext('webgl2');\n\nif (!gl) {\n  alert('WebGL 2 not supported!');\n  throw new Error('WebGL 2 not supported!');\n}\n\nconst vsSource = `#version 300 es\nlayout (location = 0) in vec3 aPos;\n\nuniform mat4 model;\nuniform mat4 view;\nuniform mat4 projection;\n\nvoid main() {\n  gl_Position = projection * view * model * vec4(aPos, 1.0);\n}\n`;\n\nconst fsSource = `#version 300 es\nprecision mediump float;\nout vec4 FragColor;\n\nuniform vec2 resolution;\nuniform float time;\n\nvoid main() {\n  vec2 uv = gl_FragCoord.xy / resolution;\n  vec3 col = vec3(uv.x, uv.y, 0.5 + 0.5*sin(time));\n  FragColor = vec4(col, 1.0);\n}\n`;\n\n\nfunction initShaderProgram(gl, vsSource, fsSource) {\n  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);\n  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);\n\n  const shaderProgram = gl.createProgram();\n  gl.attachShader(shaderProgram, vertexShader);\n  gl.attachShader(shaderProgram, fragmentShader);\n  gl.linkProgram(shaderProgram);\n\n  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {\n    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));\n    return null;\n  }\n\n  return shaderProgram;\n}\n\n\nfunction loadShader(gl, type, source) {\n  const shader = gl.createShader(type);\n  gl.shaderSource(shader, source);\n  gl.compileShader(shader);\n\n  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {\n    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));\n    gl.deleteShader(shader);\n    return null;\n  }\n\n  return shader;\n}\n\nconst shaderProgram = initShaderProgram(gl, vsSource, fsSource);\n\nconst programInfo = {\n  program: shaderProgram,\n  attribLocations: {\n    vertexPosition: gl.getAttribLocation(shaderProgram, 'aPos'),\n  },\n  uniformLocations: {\n    projectionMatrix: gl.getUniformLocation(shaderProgram, 'projection'),\n    modelViewMatrix: gl.getUniformLocation(shaderProgram, 'view'),\n    modelMatrix: gl.getUniformLocation(shaderProgram, 'model'),\n    resolution: gl.getUniformLocation(shaderProgram, 'resolution'),\n    time: gl.getUniformLocation(shaderProgram, 'time'),\n  },\n};\n\n\nconst positions = [\n  -1.0, 1.0, 1.0,\n  -1.0, -1.0, 1.0,\n  1.0, 1.0, 1.0,\n  1.0, -1.0, 1.0,\n  -1.0, 1.0, -1.0,\n  -1.0, -1.0, -1.0,\n  1.0, 1.0, -1.0,\n  1.0, -1.0, -1.0,\n];\n\nconst indices = [\n  0, 1, 2,\n  2, 1, 3,\n  4, 5, 6,\n  6, 5, 7,\n  0, 4, 1,\n  1, 4, 5,\n  2, 6, 3,\n  3, 6, 7,\n  0, 2, 4,\n  4, 2, 6,\n  1, 3, 5,\n  5, 3, 7,\n];\n\n\nconst positionBuffer = gl.createBuffer();\ngl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);\ngl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);\n\nconst indexBuffer = gl.createBuffer();\ngl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);\ngl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);\n\n\nfunction drawScene(time) {\n  gl.clearColor(0.0, 0.0, 0.0, 1.0);\n  gl.clearDepth(1.0);\n  gl.enable(gl.DEPTH_TEST);\n  gl.depthFunc(gl.LEQUAL);\n  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);\n\n  const fieldOfView = 45 * Math.PI / 180;\n  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;\n  const zNear = 0.1;\n  const zFar = 100.0;\n  const projectionMatrix = mat4.create();\n  mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);\n\n  const modelViewMatrix = mat4.create();\n  mat4.translate(modelViewMatrix, modelViewMatrix, [-0.0, 0.0, -6.0]);\n  mat4.rotate(modelViewMatrix, modelViewMatrix, time, [0, 1, 0]);\n\n  gl.useProgram(programInfo.program);\n  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);\n  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);\n  gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);\n  gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);\n\n  gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);\n  gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);\n  gl.uniform2f(programInfo.uniformLocations.resolution, gl.canvas.width, gl.canvas.height);\n  gl.uniform1f(programInfo.uniformLocations.time, time);\n\n  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);\n}\n\nfunction render(now) {\n  now *= 0.001;\n  drawScene(now);\n  requestAnimationFrame(render);\n}\n\nrequestAnimationFrame(render);\n```\n\n```json\n{\n  \"glMatrix\": \"<script src=\\\"https://cdnjs.cloudflare.com/ajax/libs/gl-matrix/3.4.3/gl-matrix-min.js\\\"></script>\"\n}\n```\n"

const SHADER_URL = `${process.env.BACKEND_HOST}/api/shader`;

export default function Home() {
  const [value, setValue] = useState<string>("");
  const [messages, setMessages] = useState<string[]>([]);

  const handleInput = async () => {
    setMessages([...messages, `U:>${value}`, `T:>Thinking`]);
    const msgs = [...messages, `U:>${value}`];
    console.log(msgs);

    try {
      const response = await fetch(`${SHADER_URL}?text=${value}`);

      if (!response.ok) {
        setMessages([...msgs, `E:>Something went wrong!`]);
        return;
      }

      const json = await response.json();
      if (json.status !== "Success") {
        setMessages([...msgs, `E:>${json.message}`]);
        return;
      }

      setMessages([...msgs, `B:>${json.message}`]);

    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error(error);
      }
      setMessages([...msgs, `E:>Something went wrong!`]);
    }
  };

  return (
    <>
      <div className={styles.chatContainer}>
        <ul>
          {messages.map((message, index) => (
            <li
              key={index}
              data-type={
                message.startsWith("U:>") ? "user" :
                  message.startsWith("T:>") ? "bot-think" :
                    message.startsWith("E:>") ? "bot-think" : "bot"
              }
            >
              {message.startsWith("B:>") ? <BotMessage>{message.slice(3)}</BotMessage> : message.slice(3)}
              {message.startsWith("T:>") && <span className={styles.thinkAnimate}>...</span>}
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.inputContainer}>
        <div className={styles.input}>
          <textarea
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoFocus
            rows={3}
            wrap="hard"
            placeholder="Request shader code..."
            onChange={e => {
              const newlines = (e.target.value.match(/\n/g) || []).length + 1;
              if (newlines > 2) {
                e.target.rows = newlines;
              }

              if (e.target.scrollWidth > e.target.clientWidth) {
                e.target.rows += 1;
              }

              setValue(e.target.value);
            }}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (value.trim() === "" || (messages[messages.length - 1] ?? "").startsWith("T:>")) return;
                handleInput();
                setValue("");
                (e.target as HTMLTextAreaElement).value = "";
              }
            }}
          />
          <button
            className={styles.submitButton}
            onClick={e => {
              e.preventDefault();
              if (value.trim() === "" || (messages[messages.length - 1] ?? "").startsWith("T:>")) return;
              handleInput();
              setValue("");
              ((e.target as HTMLButtonElement).previousElementSibling as HTMLTextAreaElement).value = "";
            }}></button>
        </div>
      </div>
    </>
  );
}
