import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

const Options = () => {
    const [status, setStatus] = useState<string>('');
    const [urlGroups, setUrlGroups] = useState<UrlGroup[]>([]);

    const [newGroupName, setNewGroupName] = useState<string>('');
    const [newGroupTimelimit, setNewGroupLimitTimelimit] = useState<string>('');
    const [newGroupUrls, setNewGroupUrls] = useState<string>('');

    // Load settings from storage on mount
    useEffect(() => {
        chrome.storage.sync.get({ urlGroups: [] }, (items) => {
            setUrlGroups(items.urlGroups);
        });
    }, []);

    const addGroup = () => {
        const newGroups = [...urlGroups];
        newGroups.push({
            id: crypto.randomUUID(),
            name: newGroupName,
            timelimitSeconds: Number(newGroupTimelimit),
            urls: newGroupUrls.split('\n'),
            history: {},
        });
        setUrlGroups(newGroups);
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
        <>
            <h1>Settings</h1>
            <h2>Add Group</h2>
            <div>
                <div>
                    <input
                        type="text"
                        placeholder="Name"
                        value={newGroupName}
                        onChange={(event) =>
                            setNewGroupName(event.currentTarget.value)
                        }
                    />
                </div>
                <div>
                    <input
                        type="number"
                        placeholder="Timelimit (minutes)"
                        value={newGroupTimelimit}
                        onChange={(event) =>
                            setNewGroupLimitTimelimit(event.currentTarget.value)
                        }
                    />
                </div>

                <div>
                    <textarea
                        name="new-urls"
                        placeholder="URL patterns"
                        id=""
                        value={newGroupUrls}
                        onChange={(event) =>
                            setNewGroupUrls(event.currentTarget.value)
                        }
                    ></textarea>
                </div>
                <button onClick={addGroup}>Add</button>
            </div>
            <h2>Groups</h2>
            <div>
                {urlGroups.map((urlGroup) => (
                    <div key={urlGroup.id}>
                        <div>ID: {urlGroup.id}</div>
                        <div>Name: {urlGroup.name}</div>
                        <div>Timelimit: {urlGroup.timelimitSeconds}</div>
                        <div>Urls: {JSON.stringify(urlGroup.urls)}</div>
                    </div>
                ))}
            </div>
            <div>{status}</div>
            <button onClick={saveOptions}>Save</button>
            <button onClick={clearGroups}>Clear</button>
        </>
    );
};

const root = createRoot(document.getElementById('root')!);

root.render(
    <React.StrictMode>
        <Options />
    </React.StrictMode>
);
