import React from 'react';

declare global {
    /** Current version in package.json injected via webpack config */
    var __VERSION__: string;
}

export default function AboutPage() {
    return <h3 className="title is-3">Version {__VERSION__}</h3>;
}
