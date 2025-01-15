'use client';

import { useState, useRef, useEffect } from "react";
import Markdown from "react-markdown";
import styles from "./botMessage.module.css";
import PreviewPane from "./previewPane";

export default function BotMessage({ children }: { children: string }) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [preview, setPreview] = useState<boolean>(false);
    const [errors, setErrors] = useState<string[]>([]);
    const responses = children.split(/\n(?=```javascript|```json)/g);

    const json = responses[2].trim();
    const libs = JSON.parse(json.slice(8, json.length - 3).replaceAll('\n', ''));
    const scripts = [];
    for (const [key, value] of Object.entries(libs)) {
        scripts.push(value);
        scripts.push(`
<script type='text/javascript'>
    try {
        for (const [key, value] of Object.entries(${key})) {
            window[key] = value;
        }
    } catch (error) {
        window.top.postMessage(error, '*');
    }
</script>
        `);
    }
    const scriptString = scripts.join('\n');

    const js = responses[1].trim();
    const jsCode = `
<script type='text/javascript'>
    function run() {
        ${js.slice(14, js.length - 3)}
    }

    try {
        run();
    } catch (error) {
        window.top.postMessage(error, '*'); 
    }
</script>`;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Shader</title>
    <style>
        *, *::before, *::after {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: #000;
        }
        canvas {
            width: 100%;
            height: 100%;
            display: block;
        }
    </style>
</head>
<body>
    <canvas id='glCanvas'></canvas>
    ${scriptString}
    ${jsCode}
</body>
</html>
`;

    const reloadIframe = () => {
        if (iframeRef.current) {
            iframeRef.current.srcdoc += "";
        }
    }

    function onReceivedMessage(event: MessageEvent) {
        if (event.data instanceof Error) {
            setErrors([...errors, event.data.message]);
        }
    }

    useEffect(() => {
        window.addEventListener("message", onReceivedMessage);

        return function () {
            window.removeEventListener("message", onReceivedMessage);
        }
    });

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                {preview && <button className={styles.refresh} onClick={reloadIframe}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M224,48V96a8,8,0,0,1-8,8H168a8,8,0,0,1,0-16h28.69L182.06,73.37a79.56,79.56,0,0,0-56.13-23.43h-.45A79.52,79.52,0,0,0,69.59,72.71,8,8,0,0,1,58.41,61.27a96,96,0,0,1,135,.79L208,76.69V48a8,8,0,0,1,16,0ZM186.41,183.29a80,80,0,0,1-112.47-.66L59.31,168H88a8,8,0,0,0,0-16H40a8,8,0,0,0-8,8v48a8,8,0,0,0,16,0V179.31l14.63,14.63A95.43,95.43,0,0,0,130,222.06h.53a95.36,95.36,0,0,0,67.07-27.33,8,8,0,0,0-11.18-11.44Z"></path></svg>
                </button>}
                <div role="group" dir="ltr">
                    <button
                        type="button"
                        data-state={preview ? "on" : "off"}
                        role="radio"
                        aria-checked={preview}
                        onClick={() => setPreview(true)}
                        className={styles.slider}
                    >
                        Preview
                    </button>
                    <button
                        type="button"
                        data-state={!preview ? "on" : "off"}
                        role="radio"
                        aria-checked={!preview}
                        onClick={() => setPreview(false)}
                    >
                        Code
                    </button>
                </div>
            </div>
            <div className={`${styles.content} ${(preview ? styles.nonoverflow : "")}`}>
                {!preview && <Markdown>{responses[0]}</Markdown>}
                {preview && <PreviewPane props={{ html, ref: iframeRef, errors }}
                />}
            </div>
        </div >
    )
}