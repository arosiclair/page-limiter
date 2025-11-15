import React, { useState } from 'react';
import { getTimeLeft, getTimeUsed } from '../../url-groups';

type UrlGroupProps = {
    index: number;
    urlGroup: UrlGroup;
    onChange: (updatedUrlGroup: UrlGroup) => void;
    onIndexChange: (id: string, newIndex: number) => void;
    onDelete: (id: string) => void;
};

export default function UrlGroup({
    index,
    urlGroup,
    onChange,
    onIndexChange,
    onDelete,
}: UrlGroupProps) {
    const [newIndex, setNewIndex] = useState<string | undefined>(undefined);
    const value = newIndex !== undefined ? newIndex : index + 1;

    const updateOrder = () => {
        if (newIndex === undefined) {
            return;
        }

        onIndexChange(urlGroup.id, Number(newIndex) - 1);
        setNewIndex(undefined);
    };

    return (
        <div className="mb-5">
            <div className="d-flex">
                <div className="me-2" style={{ width: 75 }}>
                    <label htmlFor={`${urlGroup.id}-group-order-input`} className="form-label">
                        Order
                    </label>
                    <input
                        id={`${urlGroup.id}-group-order-input`}
                        className="form-control"
                        type="number"
                        value={value}
                        onChange={(event) => setNewIndex(event.currentTarget.value)}
                        onBlur={() => updateOrder()}
                        onKeyUp={(event) => event.key === 'Enter' && updateOrder()}
                    />
                </div>
                <div className="flex-grow-1 me-2">
                    <label htmlFor={`${urlGroup.id}-group-name-input`} className="form-label">
                        Group name
                    </label>
                    <input
                        id={`${urlGroup.id}-group-name-input`}
                        className="form-control"
                        type="text"
                        placeholder="Name"
                        value={urlGroup.name}
                        onChange={(event) =>
                            onChange({
                                ...urlGroup,
                                name: event.currentTarget.value,
                            })
                        }
                    />
                </div>
                <div className="mb-2">
                    <label htmlFor={`${urlGroup.id}-group-timelimit-input`} className="form-label">
                        Timelimit (seconds)
                    </label>
                    <input
                        id={`${urlGroup.id}-group-timelimit-input`}
                        className="form-control"
                        type="number"
                        placeholder="Timelimit (minutes)"
                        value={urlGroup.timelimitSeconds}
                        onChange={(event) =>
                            onChange({
                                ...urlGroup,
                                timelimitSeconds: Number(event.currentTarget.value),
                            })
                        }
                    />
                </div>
            </div>

            <div className="mb-2">
                <label htmlFor={`${urlGroup.id}-group-patterns-input`} className="form-label">
                    URL patterns
                </label>
                <textarea
                    id={`${urlGroup.id}-group-patterns-input`}
                    className="form-control"
                    name="new-urls"
                    placeholder="page-to-limit.com"
                    value={urlGroup.patterns.join('\n')}
                    onChange={(event) =>
                        onChange({
                            ...urlGroup,
                            patterns: event.currentTarget.value
                                .split('\n')
                                .map((pattern) => pattern.trim()),
                        })
                    }
                ></textarea>
            </div>

            <div className="d-flex align-items-center">
                <span className="flex-grow-1">
                    Time used: {getTimeUsed(urlGroup)} seconds • Time left: {getTimeLeft(urlGroup)}{' '}
                    seconds
                </span>
                <button className="btn btn-danger" onClick={() => onDelete(urlGroup.id)}>
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
