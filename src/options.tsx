import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import UrlGroup from './components/Settings/Group';
import { debounce } from './utils';
import storageLookupData from './storage-lookup-data';
import SaveIndicator from './components/Settings/SaveIndicator';

const Options = () => {
    const [status, setStatus] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);
    const [urlGroups, setUrlGroups] = useState<UrlGroup[]>([]);
    const [allowedUrls, setAllowedUrls] = useState<string[]>([]);

    // Load settings from storage on mount
    useEffect(() => {
        chrome.storage.sync.get(storageLookupData, (items) => {
            const data = items as Partial<ExportData>;

            if (data.urlGroups?.length) {
                setUrlGroups(items.urlGroups);
            } else {
                addGroup();
            }

            if (data.allowedUrls) {
                setAllowedUrls(data.allowedUrls);
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
        const newGroups = [...urlGroups];
        newGroups.push({
            id: crypto.randomUUID(),
            name: `Group ${newGroups.length + 1}`,
            timelimitSeconds: 600,
            urls: [],
            history: {},
        });
        saveGroups(newGroups);
    };

    const updateGroup = (updatedUrlGroup: UrlGroup) => {
        const index = urlGroups.findIndex((urlGroup) => urlGroup.id === updatedUrlGroup.id);
        if (index === -1) {
            console.warn("Couldn't update urlGroup", { id: updatedUrlGroup.id });
            return;
        }

        const newUrlGroups = [...urlGroups];
        newUrlGroups[index] = updatedUrlGroup;
        saveGroups(newUrlGroups);
    };

    const updateGroupIndex = (id: string, newIndex: number) => {
        // Clamp the new index
        newIndex = Math.max(0, Math.min(newIndex, urlGroups.length - 1));

        const oldIndex = urlGroups.findIndex((urlGroup) => urlGroup.id === id);
        if (oldIndex === -1) {
            console.warn("Couldn't update urlGroup index", { id });
            return;
        }

        if (oldIndex === newIndex) {
            return;
        }

        const isIncreasing = newIndex > oldIndex;

        const newUrlGroups = [
            ...urlGroups.slice(0, newIndex).filter((urlGroup) => urlGroup.id !== id),
        ];
        if (isIncreasing) {
            newUrlGroups.push(urlGroups[newIndex], urlGroups[oldIndex]);
        } else {
            newUrlGroups.push(urlGroups[oldIndex], urlGroups[newIndex]);
        }
        newUrlGroups.push(
            ...urlGroups.slice(newIndex + 1).filter((urlGroup) => urlGroup.id !== id)
        );

        saveGroups(newUrlGroups);
    };

    const deleteGroup = (id: string) => {
        const newUrlGroups = urlGroups.filter((group) => group.id !== id);
        saveGroups(newUrlGroups);
    };

    const saveGroups = (newUrlGroups: UrlGroup[]) => {
        setUrlGroups(newUrlGroups);
        saveSettings({ urlGroups: newUrlGroups, allowedUrls });
    };

    const cleanData = (data: ExportData): ExportData => {
        return {
            // Filter out empty URLs
            urlGroups: data.urlGroups.map((urlGroup) => ({
                ...urlGroup,
                urls: urlGroup.urls.filter(Boolean),
            })),

            // Filter out empty URLs
            allowedUrls: data.allowedUrls.filter(Boolean),
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
            setAllowedUrls(data.allowedUrls);
            saveSettings(data);
        } catch (error) {
            console.error('Import failed:', error);
        }
    };

    const updateAllowedUrls: React.ChangeEventHandler<HTMLTextAreaElement> = (event) => {
        const newAllowedUrls = event.currentTarget.value
            .split('\n')
            .map((pattern) => pattern.trim());
        setAllowedUrls(newAllowedUrls);
        saveSettings({ urlGroups, allowedUrls: newAllowedUrls });
    };

    return (
        <main className="px-3 py-2">
            <div className="d-flex justify-content-between align-items-center">
                <h2 style={{ marginBottom: 0 }}>Page Limiter - Settings</h2>
                <SaveIndicator isLoading={isSaving} />
            </div>

            <hr />

            <div>{status}</div>
            <button
                className="btn btn-primary me-1"
                onClick={() => saveSettings({ urlGroups, allowedUrls })}
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
                value={allowedUrls.join('\n')}
                onChange={updateAllowedUrls}
            />

            <h3>Groups</h3>
            <div>
                {urlGroups.map((urlGroup, index) => (
                    <UrlGroup
                        key={urlGroup.id}
                        index={index}
                        urlGroup={urlGroup}
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
