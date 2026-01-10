import React, { useEffect, useState } from 'react';
import { getSettings, saveSettings } from '../../../settings';
import { getSecondsLeft } from '../../../groups';

export default function DailyResetTimePage() {
    const [dailyResetTime, setDailyResetTime] = useState('');
    const [shouldRestrictChanges, setShouldRestrictChanges] = useState(false);

    useEffect(() => {
        (async function () {
            const settings = await getSettings();
            const hasExpiredGroups = settings.groups.some(
                (group) =>
                    group.timelimitSeconds !== 0 &&
                    getSecondsLeft(group, settings.dailyResetTime) === 0
            );

            setDailyResetTime(settings.dailyResetTime);
            setShouldRestrictChanges(settings.isStrictModeEnabled && hasExpiredGroups);
        })();
    }, []);

    return (
        <div>
            <input
                type="time"
                className="input title is-4"
                style={{ width: 'auto' }}
                value={dailyResetTime}
                onChange={(event) => {
                    if (shouldRestrictChanges) {
                        return;
                    }

                    setDailyResetTime(event.target.value);
                    saveSettings({ dailyResetTime: event.target.value });
                }}
                disabled={shouldRestrictChanges}
            />
            <p>Daily Reset Time: {JSON.stringify(dailyResetTime)}</p>
        </div>
    );
}
