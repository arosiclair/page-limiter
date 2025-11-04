import React from 'react';
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
    return (
        <div className="mb-4">
            <div className="d-flex">
                <div className="me-2" style={{ width: 75 }}>
                    <label htmlFor="new-group-order-input" className="form-label">
                        Order
                    </label>
                    <input
                        id="new-group-order-input"
                        className="form-control"
                        type="number"
                        placeholder="Name"
                        value={index + 1}
                        onChange={(event) =>
                            onIndexChange(urlGroup.id, Number(event.currentTarget.value) - 1)
                        }
                    />
                </div>
                <div className="flex-grow-1 me-2">
                    <label htmlFor="new-group-name-input" className="form-label">
                        Group name
                    </label>
                    <input
                        id="new-group-name-input"
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
                    <label htmlFor="new-group-timelimit-input" className="form-label">
                        Timelimit (seconds)
                    </label>
                    <input
                        id="new-group-timelimit-input"
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
                <label htmlFor="new-group-url-input" className="form-label">
                    URL patterns
                </label>
                <textarea
                    id="new-group-url-input"
                    className="form-control"
                    name="new-urls"
                    placeholder="page-to-limit.com"
                    value={urlGroup.urls.join('\n')}
                    onChange={(event) =>
                        onChange({
                            ...urlGroup,
                            urls: event.currentTarget.value
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

            <pre>
                <div>DEBUG</div>
                <div>ID: {urlGroup.id}</div>
                <div>Name: {urlGroup.name}</div>
                <div>Timelimit: {urlGroup.timelimitSeconds}</div>
                <div>Urls: {JSON.stringify(urlGroup.urls)}</div>
            </pre>
        </div>
    );
}
