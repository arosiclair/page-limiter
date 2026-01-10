import React, { useEffect, useState } from 'react';
import { getSettings, saveSettings } from '../../../settings';

export default function DailyResetTimePage() {
    const [dailyResetTime, setDailyResetTime] = useState('');

    useEffect(() => {
        (async function () {
            const settings = await getSettings();
            setDailyResetTime(settings.dailyResetTime);
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
                    setDailyResetTime(event.target.value);
                    saveSettings({ dailyResetTime: event.target.value });
                }}
            />
            <p>Daily Reset Time: {JSON.stringify(dailyResetTime)}</p>
        </div>
    );
}
