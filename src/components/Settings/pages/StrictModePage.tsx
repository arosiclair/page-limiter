import React, { useEffect, useState } from 'react';
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
            <div className="mb-3">
                <label htmlFor="strictModeCheckbox">
                    <span className="title is-3 mr-3">Enabled</span>
                    <input
                        id="strictModeCheckbox"
                        type="checkbox"
                        style={{ width: 20, height: 20 }}
                        checked={isStrictModeEnabled}
                        onChange={(event) => {
                            setIsStrictModeEnabled(event.target.checked);
                            saveIsStrictModeEnabled(event.target.checked);
                        }}
                    ></input>
                </label>
            </div>
            <ul className="pl-5" style={{ listStyle: 'initial' }}>
                <li>Restricts changes to the allow list after any group is expired</li>
                <li>Restricts changes to any group above an expired group</li>
                <li>Restricts changes to an expired group</li>
                <li>Restricts changes to the order of groups below an expired group</li>
            </ul>
        </div>
    );
}
