import React from 'react';

declare global {
    /** Current version in package.json injected via webpack config */
    var __VERSION__: string;
}

export default function AboutPage() {
    return (
        <div>
            <div className="content">
                <h3 className="title is-3">Version {__VERSION__}</h3>
                <ul>
                    <li>
                        Created by{' '}
                        <a href="https://arosiclair.com" target="_blank" rel="noopener noreferrer">
                            Andrew Rosiclair
                        </a>
                    </li>
                    <li>
                        Source code on{' '}
                        <a
                            href="https://github.com/arosiclair/page-limiter"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            GitHub
                        </a>
                    </li>
                    <li>
                        Have an issue? Report it on{' '}
                        <a
                            href="https://github.com/arosiclair/page-limiter/issues"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            GitHub
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    );
}
