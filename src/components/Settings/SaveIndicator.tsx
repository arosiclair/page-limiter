import React from 'react';

type SaveIndicatorProps = {
    isLoading: boolean;
};

export default function SaveIndicator({ isLoading }: SaveIndicatorProps) {
    if (isLoading) {
        return (
            <span className="material-symbols-outlined" style={{ fontSize: 32 }}>
                cloud_upload
            </span>
        );
    }

    return (
        <span className="material-symbols-outlined" style={{ fontSize: 32, color: 'green' }}>
            cloud_done
        </span>
    );
}
