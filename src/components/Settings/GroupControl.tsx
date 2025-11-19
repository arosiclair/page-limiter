import React, { useState } from 'react';
import { getTimeLeft, getTimeUsed } from '../../url-groups';

type GroupControlProps = {
    index: number;
    group: Group;
    onChange: (updatedGroup: Group) => void;
    onIndexChange: (id: string, newIndex: number) => void;
    onDelete: (id: string) => void;
};

export default function GroupControl({
    index,
    group,
    onChange,
    onIndexChange,
    onDelete,
}: GroupControlProps) {
    const [newIndex, setNewIndex] = useState<string | undefined>(undefined);
    const [newTimelimit, setNewTimelimit] = useState(String(group.timelimitSeconds));

    const value = newIndex !== undefined ? newIndex : index + 1;

    const updateOrder = () => {
        if (newIndex === undefined) {
            return;
        }

        onIndexChange(group.id, Number(newIndex) - 1);
        setNewIndex(undefined);
    };

    return (
        <div className="mb-5">
            <div className="d-flex">
                <div className="me-2" style={{ width: 75 }}>
                    <label htmlFor={`${group.id}-group-order-input`} className="form-label">
                        Order
                    </label>
                    <input
                        id={`${group.id}-group-order-input`}
                        className="form-control"
                        type="number"
                        value={value}
                        onChange={(event) => setNewIndex(event.currentTarget.value)}
                        onBlur={() => updateOrder()}
                        onKeyUp={(event) => event.key === 'Enter' && updateOrder()}
                    />
                </div>
                <div className="flex-grow-1 me-2">
                    <label htmlFor={`${group.id}-group-name-input`} className="form-label">
                        Group name
                    </label>
                    <input
                        id={`${group.id}-group-name-input`}
                        className="form-control"
                        type="text"
                        placeholder="Name"
                        value={group.name}
                        onChange={(event) =>
                            onChange({
                                ...group,
                                name: event.currentTarget.value,
                            })
                        }
                    />
                </div>
                <div className="mb-2">
                    <label htmlFor={`${group.id}-group-timelimit-input`} className="form-label">
                        Timelimit (seconds)
                    </label>
                    <input
                        id={`${group.id}-group-timelimit-input`}
                        className="form-control"
                        type="number"
                        value={newTimelimit}
                        onChange={(event) => {
                            setNewTimelimit(String(event.currentTarget.value));
                            onChange({
                                ...group,
                                timelimitSeconds: Number(event.currentTarget.value),
                            });
                        }}
                    />
                </div>
            </div>

            <div className="mb-2">
                <label htmlFor={`${group.id}-group-patterns-input`} className="form-label">
                    URL patterns
                </label>
                <textarea
                    id={`${group.id}-group-patterns-input`}
                    className="form-control"
                    name="new-urls"
                    placeholder="page-to-limit.com"
                    value={group.patterns.join('\n')}
                    onChange={(event) =>
                        onChange({
                            ...group,
                            patterns: event.currentTarget.value
                                .split('\n')
                                .map((pattern) => pattern.trim()),
                        })
                    }
                ></textarea>
            </div>

            <div className="d-flex align-items-center">
                <span className="flex-grow-1">
                    Time used: {getTimeUsed(group)} seconds • Time left: {getTimeLeft(group)}{' '}
                    seconds
                </span>
                <button className="btn btn-danger" onClick={() => onDelete(group.id)}>
                    Delete
                </button>
            </div>

            {/* <pre>
                <div>DEBUG</div>
                <div>ID: {urlGroup.id}</div>
                <div>Name: {urlGroup.name}</div>
                <div>Timelimit: {urlGroup.timelimitSeconds}</div>
                <div>Urls: {JSON.stringify(urlGroup.urls)}</div>
            </pre> */}
        </div>
    );
}
