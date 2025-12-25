import React, { ChangeEvent, useEffect, useState } from 'react';
import { getSettings, setIsStrictModeEnabled as saveIsStrictModeEnabled } from '../../../settings';

export default function StrictModePage() {
    const [isStrictModeEnabled, setIsStrictModeEnabled] = useState(false);

    useEffect(() => {
        (async function () {
            const settings = await getSettings();
            setIsStrictModeEnabled(settings.isStrictModeEnabled ?? false);
        })();
    }, []);

    return (
        <div>
            <label htmlFor="">
                <span className="title is-3 mr-3">Enabled</span>
                <input
                    type="checkbox"
                    style={{ width: 20, height: 20 }}
                    checked={isStrictModeEnabled}
                    onChange={(event) => {
                        setIsStrictModeEnabled(event.target.checked);
                        saveIsStrictModeEnabled(event.target.checked);
                    }}
                ></input>
            </label>
            <p>isStrictModeEnabled: {JSON.stringify(isStrictModeEnabled)}</p>
        </div>
    );
}
