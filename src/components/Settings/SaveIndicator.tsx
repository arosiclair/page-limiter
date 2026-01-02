import React, { useEffect, useState } from 'react';
import { getSettings } from '../../settings';

export default function SaveIndicator() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSyncEnabled, setIsSyncEnabled] = useState(false);

    useEffect(() => {
        refresh();

        const onStorageUpdated = () => {
            refresh();
            setIsLoading(true);
            setTimeout(() => {
                setIsLoading(false);
            }, 500);
        };

        chrome.storage.onChanged.addListener(onStorageUpdated);

        return () => chrome.storage.onChanged.removeListener(onStorageUpdated);
    }, []);

    const refresh = async () => {
        const settings = await getSettings();
        setIsSyncEnabled(settings.isSyncingEnabled);
    };

    if (isLoading) {
        if (isSyncEnabled) {
            return (
                <span className="material-symbols-outlined" style={{ fontSize: 32 }}>
                    cloud_upload
                </span>
            );
        } else {
            return (
                <span className="material-symbols-outlined" style={{ fontSize: 32 }}>
                    save_clock
                </span>
            );
        }
    }

    if (isSyncEnabled) {
        return (
            <span className="material-symbols-outlined" style={{ fontSize: 32, color: 'green' }}>
                cloud_done
            </span>
        );
    } else {
        return (
            <span className="material-symbols-outlined" style={{ fontSize: 32, color: 'green' }}>
                save
            </span>
        );
    }
}
