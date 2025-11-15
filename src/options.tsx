import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import GroupControl from './components/Settings/GroupControl';
import { debounce } from './utils';
import storageLookupData from './storage-lookup-data';
import SaveIndicator from './components/Settings/SaveIndicator';

const Options = () => {
    const [status, setStatus] = useState<string>('');
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
            history: {},
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
        <main className="px-3 py-2">
            <div className="d-flex justify-content-between align-items-center">
                <h2>Page Limiter - Settings</h2>
                <SaveIndicator isLoading={isSaving} />
            </div>

            <hr />

            <div>{status}</div>
            <button
                className="btn btn-primary me-1"
                onClick={() => saveSettings({ groups, allowedPatterns })}
            >
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

            <h3>Allow List</h3>
            <textarea
                id="new-group-name-input"
                className="form-control mb-4"
                placeholder="page-to-limit.com/subpage-to-allow"
                value={allowedPatterns.join('\n')}
                onChange={updateAllowedPatterns}
            />

            <h3>Groups</h3>
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
