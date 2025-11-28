import React from 'react';

type SaveIndicatorProps = {
    isLoading: boolean;
};

export default function SaveIndicator({ isLoading }: SaveIndicatorProps) {
    if (isLoading) {
        return (
            <span className="material-symbols-outlined" style={{ fontSize: 36 }}>
                cloud_upload
            </span>
        );
    }

    return (
        <span className="material-symbols-outlined" style={{ fontSize: 36, color: 'green' }}>
            cloud_done
        </span>
    );
}
