import React, { useEffect, useState } from 'react';
import { getSettings, setIsSyncingEnabled as saveIsSyncingEnabled } from '../../../settings';

export default function SyncingPage() {
    const [isSyncingEnabled, setIsSyncingEnabled] = useState(true);
    const [shouldShowConfirmModal, setShouldShowConfirmModal] = useState(false);

    useEffect(() => {
        (async function () {
            const settings = await getSettings();
            setIsSyncingEnabled(settings.isSyncingEnabled);
        })();
    }, []);

    const confirmWithCarryover = (enabled: boolean, shouldCarryoverSettings: boolean) => {
        setIsSyncingEnabled(enabled);
        saveIsSyncingEnabled(enabled, shouldCarryoverSettings);
        setShouldShowConfirmModal(false);
    };

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
                            if (event.target.checked) {
                                setShouldShowConfirmModal(true);
                            } else {
                                confirmWithCarryover(false, true);
                            }
                        }}
                    ></input>
                </label>
            </div>
            <p>
                When enabled, settings are synced to all Chrome browsers you are logged into using{' '}
                <a
                    href="https://developer.chrome.com/docs/extensions/reference/api/storage#sync"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Chrome's sync storage
                </a>
                . Otherwise, settings are stored locally per device.
            </p>
            <div className={`modal ${shouldShowConfirmModal ? 'is-active' : ''}`}>
                <div className="modal-background"></div>
                <div className="modal-content">
                    <div className="card">
                        <div className="card-content">
                            <h3 className="title is-3">You are about to enable syncing</h3>
                            <p>
                                Do you want to carry over your local settings? If you do, any
                                existing synced settings will be replaced. If not, your local
                                settings will be replaced with any existing synced settings.
                            </p>
                            <div className="has-text-right">
                                <button
                                    className="button mr-2"
                                    onClick={() => confirmWithCarryover(true, false)}
                                >
                                    No
                                </button>
                                <button
                                    className="button is-danger"
                                    onClick={() => confirmWithCarryover(true, true)}
                                >
                                    Yes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <button
                    className="modal-close is-large"
                    onClick={() => setShouldShowConfirmModal(false)}
                ></button>
            </div>
        </div>
    );
}
