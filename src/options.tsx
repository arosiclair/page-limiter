import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import UrlGroup from './components/Settings/Group';
import { debounce } from './utils';

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
        saveOptions();
    };

    const saveOptions = debounce(() => {
        // Saves options to chrome.storage.sync.
        chrome.storage.sync.set({ urlGroups }, () => {
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

    return (
        <main className="px-3 py-2">
            <h2>Page Limiter - Settings</h2>
            <hr />

            <div>{status}</div>
            <button className="btn btn-primary me-1" onClick={saveOptions}>
                Save
            </button>
            <button className="btn btn-danger" onClick={clearGroups}>
                Clear
            </button>
            <hr />

            <h3>Groups</h3>
            <div>
                {urlGroups.map((urlGroup) => (
                    <UrlGroup key={urlGroup.id} urlGroup={urlGroup} onGroupChanged={updateGroup} />
                ))}
            </div>
            <div className="text-end">
                <button className="btn btn-primary" onClick={addGroup}>
                    Add
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
