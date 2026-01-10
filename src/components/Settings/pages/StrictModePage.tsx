import React, { useEffect, useState } from 'react';
import { getSettings, saveSettings } from '../../../settings';
import { getSecondsLeft } from '../../../groups';

export default function StrictModePage() {
    const [isStrictModeEnabled, setIsStrictModeEnabled] = useState(false);
    const [shouldRestrictChanges, setShouldRestrictChanges] = useState(false);

    useEffect(() => {
        (async function () {
            const settings = await getSettings();
            const hasExpiredGroups = settings.groups.some(
                (group) =>
                    group.timelimitSeconds !== 0 &&
                    getSecondsLeft(group, settings.dailyResetTime) === 0
            );
            setIsStrictModeEnabled(settings.isStrictModeEnabled);
            setShouldRestrictChanges(settings.isStrictModeEnabled && hasExpiredGroups);
        })();
    }, []);

    return (
        <div>
            <div className="mb-3">
                <label htmlFor="strictModeCheckbox">
                    <span className="title is-3 mr-3">Enabled</span>
                    <input
                        id="strictModeCheckbox"
                        type="checkbox"
                        style={{ width: 20, height: 20 }}
                        checked={isStrictModeEnabled}
                        onChange={(event) => {
                            if (shouldRestrictChanges) {
                                return;
                            }

                            setIsStrictModeEnabled(event.target.checked);
                            saveSettings({ isStrictModeEnabled: event.target.checked });
                        }}
                        disabled={shouldRestrictChanges}
                    ></input>
                </label>
            </div>
            <ul className="pl-5" style={{ listStyle: 'initial' }}>
                <li>Restricts changes to the allow list while any group is expired</li>
                <li>Restricts changes to any group above an expired group</li>
                <li>Restricts changes to an expired group</li>
                <li>Restricts changes to the order of groups below an expired group</li>
                <li>Restricts changes to the daily reset time while any group is expired</li>
                <li>Cannot be disabled while any group is expired</li>
            </ul>
        </div>
    );
}
