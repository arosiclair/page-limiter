import React, { useEffect, useState } from 'react';
import storageLookupData from '../../../storage-lookup-data';
import { debounce } from '../../../utils';

export default function ImportExportPage() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [allowedPatterns, setAllowedPatterns] = useState<string[]>([]);

    // Load settings from storage on mount
    useEffect(() => {
        chrome.storage.sync.get(storageLookupData, (items) => {
            const data = items as Partial<ExportData>;

            if (data.groups?.length) {
                setGroups(data.groups);
            }

            if (data.allowedPatterns) {
                setAllowedPatterns(data.allowedPatterns);
            }
        });
    }, []);

    const exportData = () => {
        const timestamp = new Date().toISOString();
        const filename = `page-limiter-export-${timestamp}.json`;
        const data = { urlGroups: groups };

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

    const importData = async () => {
        try {
            const data = await new Promise<ExportData>((resolve, reject) => {
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

            setGroups(data.groups);
            setAllowedPatterns(data.allowedPatterns);
            saveSettings(data);
        } catch (error) {
            console.error('Import failed:', error);
        }
    };

    const saveSettings = debounce((data: ExportData) => {
        // Saves options to chrome.storage.sync.
        chrome.storage.sync.set(cleanData(data));
    }, 1000);

    const cleanData = (data: ExportData): ExportData => {
        return {
            // Filter out empty URLs
            groups: data.groups.map((urlGroup) => ({
                ...urlGroup,
                patterns: urlGroup.patterns.filter(Boolean),
            })),

            // Filter out empty URLs
            allowedPatterns: data.allowedPatterns.filter(Boolean),
        };
    };

    return (
        <div>
            <button className="button is-dark mr-2" onClick={exportData}>
                Export
            </button>
            <button className="button is-dark" onClick={importData}>
                Import
            </button>
        </div>
    );
}
