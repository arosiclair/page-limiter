import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import UrlGroup from './components/Settings/Group';
import { debounce } from './utils';

type ExportData = {
    urlGroups: UrlGroup[];
};

const Options = () => {
    const [status, setStatus] = useState<string>('');
    const [urlGroups, setUrlGroups] = useState<UrlGroup[]>([]);

    // Load settings from storage on mount
    useEffect(() => {
        chrome.storage.sync.get({ urlGroups: [] }, (items) => {
            if (items.urlGroups?.length) {
                setUrlGroups(items.urlGroups);
            } else {
                addGroup();
            }
        });
    }, []);

    const addGroup = () => {
        const newGroups = [...urlGroups];
        newGroups.push({
            id: crypto.randomUUID(),
            name: `Group ${newGroups.length + 1}`,
            timelimitSeconds: 600,
            urls: [],
            history: {},
        });
        setUrlGroups(newGroups);
    };

    const updateGroup = (updatedUrlGroup: UrlGroup) => {
        const index = urlGroups.findIndex((urlGroup) => urlGroup.id === updatedUrlGroup.id);
        if (index === -1) {
            console.warn("Couldn't update urlGroup", { id: updatedUrlGroup.id });
            return;
        }

        const newUrlGroups = [...urlGroups];
        newUrlGroups[index] = updatedUrlGroup;
        setUrlGroups(newUrlGroups);
        saveGroups(newUrlGroups);
    };

    const deleteGroup = (id: string) => {
        const newUrlGroups = urlGroups.filter((group) => group.id !== id);
        setUrlGroups(newUrlGroups);
        saveGroups(newUrlGroups);
    };

    const saveGroups = debounce((urlGroups: UrlGroup[]) => {
        // Filter out any empty url patterns
        const cleanedUrlGroups = urlGroups.map((urlGroup) => ({
            ...urlGroup,
            urls: urlGroup.urls.filter(Boolean),
        }));

        // Saves options to chrome.storage.sync.
        chrome.storage.sync.set({ urlGroups: cleanedUrlGroups }, () => {
            // Update status to let user know options were saved.
            setStatus('Options saved.');
            const id = setTimeout(() => {
                setStatus('');
            }, 1000);
            return () => clearTimeout(id);
        });
    }, 1000);

    const clearGroups = () => {
        chrome.storage.sync.set({ urlGroups: [] }, () => {
            // Update status to let user know options were saved.
            setStatus('Options cleared.');
            const id = setTimeout(() => {
                setStatus('');
            }, 1000);
            return () => clearTimeout(id);
        });
    };

    const exportData = () => {
        const timestamp = new Date().toISOString();
        const filename = `page-limiter-export-${timestamp}.json`;
        const data = { urlGroups };

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

    // Usage with async/await:
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

            setUrlGroups(data.urlGroups);
            saveGroups(data.urlGroups);
        } catch (error) {
            console.error('Import failed:', error);
        }
    };

    return (
        <main className="px-3 py-2">
            <h2>Page Limiter - Settings</h2>
            <hr />

            <div>{status}</div>
            <button className="btn btn-primary me-1" onClick={() => saveGroups(urlGroups)}>
                Save
            </button>
            <button className="btn btn-danger me-1" onClick={clearGroups}>
                Clear
            </button>
            <button className="btn btn-secondary me-1" onClick={exportData}>
                Export
            </button>
            <button className="btn btn-secondary" onClick={importData}>
                Import
            </button>
            <hr />

            <h3>Groups</h3>
            <div>
                {urlGroups.map((urlGroup) => (
                    <UrlGroup
                        key={urlGroup.id}
                        urlGroup={urlGroup}
                        onChange={updateGroup}
                        onDelete={deleteGroup}
                    />
                ))}
            </div>
            <div className="text-center">
                <button className="btn btn-primary" onClick={addGroup}>
                    Add group
                </button>
            </div>
        </main>
    );
};

const root = createRoot(document.getElementById('root')!);

root.render(
    <React.StrictMode>
        <Options />
    </React.StrictMode>
);
