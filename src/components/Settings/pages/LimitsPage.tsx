import React, { useEffect, useState } from 'react';
import GroupControl from '../GroupControl';
import { debounce } from '../../../utils';
import { getSettings, saveSettings } from '../../../settings';
import { getSecondsLeft } from '../../../groups';

export default function LimitsPage() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [allowedPatterns, setAllowedPatterns] = useState<string[]>([]);
    const [isStrictModeEnabled, setIsStrictModeEnabled] = useState(false);
    const [dailyResetTime, setDailyResetTime] = useState('00:00');

    const lastExpiredGroupIndex = groups.findLastIndex(
        (group) => group.timelimitSeconds !== 0 && getSecondsLeft(group, dailyResetTime) === 0
    );
    const shouldRestrictChanges = isStrictModeEnabled && lastExpiredGroupIndex !== -1;

    const refreshSettings = async () => {
        const settings = await getSettings();

        if (settings.groups?.length) {
            setGroups(settings.groups);
        } else {
            addGroup();
        }

        setAllowedPatterns(settings.allowedPatterns);
        setIsStrictModeEnabled(settings.isStrictModeEnabled ?? false);
        setDailyResetTime(settings.dailyResetTime);
    };

    // Load settings from storage on mount
    useEffect(() => {
        refreshSettings();
    }, []);

    useEffect(() => {
        const onMessageReceived = (message: ExtensionMessage) => {
            if (message.event === 'time-added') {
                refreshSettings();
            }
        };

        chrome.runtime.onMessage.addListener(onMessageReceived);
        return () => chrome.runtime.onMessage.removeListener(onMessageReceived);
    }, []);

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

        const newGroups = [...groups.slice(0, newIndex).filter((group) => group.id !== id)];
        if (isIncreasing) {
            newGroups.push(groups[newIndex], groups[oldIndex]);
        } else {
            newGroups.push(groups[oldIndex], groups[newIndex]);
        }
        newGroups.push(...groups.slice(newIndex + 1).filter((urlGroup) => urlGroup.id !== id));

        saveGroups(newGroups);
    };

    const deleteGroup = (id: string) => {
        const newUrlGroups = groups.filter((group) => group.id !== id);
        saveGroups(newUrlGroups);
    };

    const saveGroups = (newGroups: Group[]) => {
        setGroups(newGroups);
        saveSettingsDebounced({ groups: newGroups, allowedPatterns });
    };
    const updateAllowedPatterns: React.ChangeEventHandler<HTMLTextAreaElement> = (event) => {
        const newAllowedPatterns = event.currentTarget.value
            .split('\n')
            .map((pattern) => pattern.trim());
        setAllowedPatterns(newAllowedPatterns);
        saveSettingsDebounced({ groups, allowedPatterns: newAllowedPatterns });
    };

    const saveSettingsDebounced = debounce(saveSettings, 1000);

    return (
        <div>
            <div className="content">
                <p>You can add time limits to websites here.</p>
                <ul>
                    <li>You can add multiple websites to a group. One website per line.</li>
                    <li>
                        You can add specific patterns/URLs to the allow list to prevent them from
                        being limited.
                    </li>
                    <li>
                        You can also enter simple words or phrases (eg: <code>dog</code> will match
                        any page with "dog" in the URL).
                    </li>
                    <li>
                        You can also use{' '}
                        <a
                            href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            regular expressions
                        </a>{' '}
                        by starting and ending your pattern with forward slashes (eg:{' '}
                        <code>/pattern/</code>). Flags aren't supported.
                    </li>
                </ul>
            </div>
            <h4 className="title is-4">Allow List</h4>
            <textarea
                id="new-group-name-input"
                className="textarea mb-4"
                placeholder="page-to-limit.com/subpage-to-allow"
                value={allowedPatterns.join('\n')}
                onChange={updateAllowedPatterns}
                disabled={shouldRestrictChanges}
            />

            <h4 className="title is-4">Limited Groups</h4>
            <div>
                {groups.map((group, index) => (
                    <GroupControl
                        key={group.id}
                        index={index}
                        minIndex={
                            shouldRestrictChanges && index > lastExpiredGroupIndex
                                ? lastExpiredGroupIndex + 1
                                : 0
                        }
                        group={group}
                        disabled={shouldRestrictChanges && index <= lastExpiredGroupIndex}
                        dailyResetTime={dailyResetTime}
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
