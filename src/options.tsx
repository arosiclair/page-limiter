import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import GroupControl from './components/Settings/GroupControl';
import { debounce } from './utils';
import storageLookupData from './storage-lookup-data';
import SaveIndicator from './components/Settings/SaveIndicator';

const Options = () => {
    const [isSaving, setIsSaving] = useState(false);
    const [groups, setGroups] = useState<Group[]>([]);
    const [allowedPatterns, setAllowedPatterns] = useState<string[]>([]);

    // Load settings from storage on mount
    useEffect(() => {
        chrome.storage.sync.get(storageLookupData, (items) => {
            const data = items as Partial<ExportData>;

            if (data.groups?.length) {
                setGroups(data.groups);
            } else {
                addGroup();
            }

            if (data.allowedPatterns) {
                setAllowedPatterns(data.allowedPatterns);
            }
        });
    }, []);

    const saveSettings = debounce((data: ExportData) => {
        // Saves options to chrome.storage.sync.
        chrome.storage.sync.set(cleanData(data), () => {
            // Update status to let user know options were saved.
            setIsSaving(true);
            const id = setTimeout(() => {
                setIsSaving(false);
            }, 1000);
            return () => clearTimeout(id);
        });
    }, 1000);

    const addGroup = () => {
        const newGroups = [...groups];
        newGroups.push({
            id: crypto.randomUUID(),
            name: `Group ${newGroups.length + 1}`,
            timelimitSeconds: 600,
            patterns: [],
            secondsUsed: {},
        });
        saveGroups(newGroups);
    };

    const updateGroup = (updatedGroup: Group) => {
        const index = groups.findIndex((group) => group.id === updatedGroup.id);
        if (index === -1) {
            console.warn("Couldn't update urlGroup", { id: updatedGroup.id });
            return;
        }

        const newGroups = [...groups];
        newGroups[index] = updatedGroup;
        saveGroups(newGroups);
    };

    const updateGroupIndex = (id: string, newIndex: number) => {
        // Clamp the new index
        newIndex = Math.max(0, Math.min(newIndex, groups.length - 1));

        const oldIndex = groups.findIndex((urlGroup) => urlGroup.id === id);
        if (oldIndex === -1) {
            console.warn("Couldn't update urlGroup index", { id });
            return;
        }

        if (oldIndex === newIndex) {
            return;
        }

        const isIncreasing = newIndex > oldIndex;

        const newUrlGroups = [
            ...groups.slice(0, newIndex).filter((urlGroup) => urlGroup.id !== id),
        ];
        if (isIncreasing) {
            newUrlGroups.push(groups[newIndex], groups[oldIndex]);
        } else {
            newUrlGroups.push(groups[oldIndex], groups[newIndex]);
        }
        newUrlGroups.push(...groups.slice(newIndex + 1).filter((urlGroup) => urlGroup.id !== id));

        saveGroups(newUrlGroups);
    };

    const deleteGroup = (id: string) => {
        const newUrlGroups = groups.filter((group) => group.id !== id);
        saveGroups(newUrlGroups);
    };

    const saveGroups = (newGroups: Group[]) => {
        setGroups(newGroups);
        saveSettings({ groups: newGroups, allowedPatterns });
    };

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

    const clearGroups = () => {
        chrome.storage.sync.set({ urlGroups: [] });
    };

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

    const updateAllowedPatterns: React.ChangeEventHandler<HTMLTextAreaElement> = (event) => {
        const newAllowedPatterns = event.currentTarget.value
            .split('\n')
            .map((pattern) => pattern.trim());
        setAllowedPatterns(newAllowedPatterns);
        saveSettings({ groups, allowedPatterns: newAllowedPatterns });
    };

    return (
        <div className="is-flex">
            <aside className="menu p-3" style={{ width: 250 }}>
                <div className="is-flex is-justify-content-space-between is-align-items-center">
                    <h5 className="title is-5 m-0 pb-1">Page Limiter</h5>
                    <SaveIndicator isLoading={isSaving} />
                </div>
                <ul className="menu-list">
                    <li>
                        <a href="#">Pages</a>
                    </li>
                    <li>
                        <a href="#">Import & Export</a>
                    </li>
                </ul>
            </aside>
            <main className="px-3 py-2">
                <button
                    className="button is-primary mr-2"
                    onClick={() => saveSettings({ groups, allowedPatterns })}
                >
                    Save
                </button>
                <button className="button is-danger mr-2" onClick={clearGroups}>
                    Clear
                </button>
                <button className="button is-dark mr-2" onClick={exportData}>
                    Export
                </button>
                <button className="button is-dark" onClick={importData}>
                    Import
                </button>
                <hr />

                <h4 className="title is-4">Allow List</h4>
                <textarea
                    id="new-group-name-input"
                    className="textarea mb-4"
                    placeholder="page-to-limit.com/subpage-to-allow"
                    value={allowedPatterns.join('\n')}
                    onChange={updateAllowedPatterns}
                />

                <h4 className="title is-4">Limited Groups</h4>
                <div>
                    {groups.map((group, index) => (
                        <GroupControl
                            key={group.id}
                            index={index}
                            group={group}
                            onChange={updateGroup}
                            onIndexChange={updateGroupIndex}
                            onDelete={deleteGroup}
                        />
                    ))}
                </div>
                <div className="has-text-centered">
                    <button className="button is-primary" onClick={addGroup}>
                        Add group
                    </button>
                </div>
            </main>
        </div>
    );
};

const root = createRoot(document.getElementById('root')!);

root.render(
    <React.StrictMode>
        <Options />
    </React.StrictMode>
);
