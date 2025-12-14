import React, { useEffect, useState } from 'react';
import GroupControl from '../GroupControl';
import { debounce } from '../../../utils';
import storageLookupData from '../../../storage-lookup-data';
import { saveSettings } from '../../../settings';

export default function LimitsPage() {
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

    const saveSettingsDebounced = debounce(saveSettings, 1000);

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
        saveSettingsDebounced({ groups: newGroups, allowedPatterns });
    };

    const clearGroups = () => {
        chrome.storage.sync.set({ urlGroups: [] });
    };

    const updateAllowedPatterns: React.ChangeEventHandler<HTMLTextAreaElement> = (event) => {
        const newAllowedPatterns = event.currentTarget.value
            .split('\n')
            .map((pattern) => pattern.trim());
        setAllowedPatterns(newAllowedPatterns);
        saveSettingsDebounced({ groups, allowedPatterns: newAllowedPatterns });
    };

    return (
        <div>
            <button
                className="button is-primary mr-2"
                onClick={() => saveSettingsDebounced({ groups, allowedPatterns })}
            >
                Save
            </button>
            <button className="button is-danger mr-2" onClick={clearGroups}>
                Clear
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
        </div>
    );
}
