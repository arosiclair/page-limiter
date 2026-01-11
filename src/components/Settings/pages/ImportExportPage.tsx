import React from 'react';
import { getSettings, saveSettings, Settings, settingsToExport } from '../../../settings';
import { project } from '../../../utils';

export default function ImportExportPage() {
    const importData = async () => {
        try {
            const data = await new Promise<Partial<Settings>>((resolve, reject) => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'application/json,.json';

                input.onchange = async (event) => {
                    const target = event.target as HTMLInputElement;
                    const file = target.files?.[0];
                    if (!file) {
                        reject(new Error('No file selected'));
                        return;
                    }

                    try {
                        const text = await file.text();
                        const data = JSON.parse(text);
                        resolve(data);
                    } catch (error) {
                        reject(error);
                    }
                };

                input.click();
            });

            const cleanData = project(data, settingsToExport);
            saveSettings(cleanData);
        } catch (error) {
            console.error('Import failed', error);
            alert(`Import failed`);
        }
    };

    const exportData = async () => {
        const settings = await getSettings();
        const timestamp = new Date().toISOString();
        const filename = `page-limiter-export-${timestamp}.json`;

        // Remove extra settings data
        const data = project(settings, settingsToExport);

        // Create a Blob from the JSON string
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });

        // Create a temporary URL for the Blob
        const url = URL.createObjectURL(blob);

        // Create a temporary anchor element and trigger download
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();

        // Clean up the URL object
        URL.revokeObjectURL(url);
    };

    return (
        <div>
            <div className="mb-2">
                <button className="button is-dark mr-2" onClick={importData}>
                    Import
                </button>
                <button className="button is-dark" onClick={exportData}>
                    Export
                </button>
            </div>
            <p>Import and export your settings to a file (JSON)</p>
        </div>
    );
}
