import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import UrlGroup from './components/Settings/Group';
import NewGroup from './components/Settings/NewGroup';

const Options = () => {
    const [status, setStatus] = useState<string>('');
    const [urlGroups, setUrlGroups] = useState<UrlGroup[]>([]);

    // Load settings from storage on mount
    useEffect(() => {
        chrome.storage.sync.get({ urlGroups: [] }, (items) => {
            setUrlGroups(items.urlGroups);
        });
    }, []);

    const addGroup = (name: string, timelimitSeconds: string, urls: string) => {
        const newGroups = [...urlGroups];
        newGroups.push({
            id: crypto.randomUUID(),
            name,
            timelimitSeconds: Number(timelimitSeconds),
            urls: urls.split('\n'),
            history: {},
        });
        setUrlGroups(newGroups);
    };

    const updateGroup = (updatedUrlGroup: UrlGroup) => {
        const index = urlGroups.findIndex((urlGroup) => urlGroup.id === updatedUrlGroup.id);
        if (!index) {
            console.warn("Couldn't update urlGroup", { id: updatedUrlGroup.id });
        }

        const newUrlGroups = [...urlGroups];
        newUrlGroups[index] = updatedUrlGroup;
        setUrlGroups(newUrlGroups);
    };

    const saveOptions = () => {
        // Saves options to chrome.storage.sync.
        chrome.storage.sync.set({ urlGroups }, () => {
            // Update status to let user know options were saved.
            setStatus('Options saved.');
            const id = setTimeout(() => {
                setStatus('');
            }, 1000);
            return () => clearTimeout(id);
        });
    };

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

            <h3>Add Group</h3>
            <NewGroup onNewGroupAdded={addGroup} />
            <hr />

            <h3>Groups</h3>
            <div>
                {urlGroups.map((urlGroup) => (
                    <UrlGroup key={urlGroup.id} urlGroup={urlGroup} onGroupChanged={updateGroup} />
                ))}
            </div>
            <div>{status}</div>
            <button className="btn btn-primary" onClick={saveOptions}>
                Save
            </button>
            <button className="btn btn-danger" onClick={clearGroups}>
                Clear
            </button>
        </main>
    );
};

const root = createRoot(document.getElementById('root')!);

root.render(
    <React.StrictMode>
        <Options />
    </React.StrictMode>
);
