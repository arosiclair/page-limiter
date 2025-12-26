import React, { useEffect, useState } from 'react';
import {
    getIsSyncingEnabled,
    setIsSyncingEnabled as saveIsSyncingEnabled,
} from '../../../settings';

export default function SyncingPage() {
    const [isSyncingEnabled, setIsSyncingEnabled] = useState(true);

    useEffect(() => {
        (async function () {
            setIsSyncingEnabled(await getIsSyncingEnabled());
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
                        checked={isSyncingEnabled}
                        onChange={(event) => {
                            setIsSyncingEnabled(event.target.checked);
                            saveIsSyncingEnabled(event.target.checked);
                        }}
                    ></input>
                </label>
            </div>
        </div>
    );
}
