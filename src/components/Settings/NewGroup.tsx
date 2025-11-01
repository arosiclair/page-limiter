import React, { useState } from 'react';

type NewGroupProps = {
    onNewGroupAdded: (name: string, timelimitSeconds: string, urls: string) => void;
};

export default function NewGroup({ onNewGroupAdded }: NewGroupProps) {
    const [newGroupName, setNewGroupName] = useState<string>('');
    const [newGroupTimelimit, setNewGroupLimitTimelimit] = useState<string>('');
    const [newGroupUrls, setNewGroupUrls] = useState<string>('');

    const addGroup = () => {
        onNewGroupAdded(newGroupName, newGroupTimelimit, newGroupUrls);
    };

    return (
        <div>
            <div className="mb-2">
                <label htmlFor="new-group-name-input" className="form-label">
                    Group name
                </label>
                <input
                    id="new-group-name-input"
                    className="form-control"
                    type="text"
                    placeholder="Name"
                    value={newGroupName}
                    onChange={(event) => setNewGroupName(event.currentTarget.value)}
                />
            </div>
            <div className="mb-2">
                <label htmlFor="new-group-timelimit-input" className="form-label">
                    Timelimit
                </label>
                <input
                    id="new-group-timelimit-input"
                    className="form-control"
                    type="number"
                    placeholder="Timelimit (minutes)"
                    value={newGroupTimelimit}
                    onChange={(event) => setNewGroupLimitTimelimit(event.currentTarget.value)}
                />
            </div>

            <div className="mb-2">
                <label htmlFor="new-group-url-input" className="form-label">
                    URL patterns
                </label>
                <textarea
                    id="new-group-url-input"
                    className="form-control"
                    name="new-urls"
                    placeholder="URL patterns"
                    value={newGroupUrls}
                    onChange={(event) => setNewGroupUrls(event.currentTarget.value)}
                ></textarea>
            </div>
            <div className="text-end">
                <button className="btn btn-primary" onClick={addGroup}>
                    Add
                </button>
            </div>
        </div>
    );
}
