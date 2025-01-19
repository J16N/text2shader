'use client';

import styles from './previewPane.module.css';
import Image from 'next/image';
import errorIcon from '../../../public/error.svg';
import { useState } from 'react';

interface PreviewPaneProps {
    errors: string[];
    html: string;
    ref: React.RefObject<HTMLIFrameElement | null>;
}

export default function PreviewPane({ errors, html, ref }: PreviewPaneProps) {
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