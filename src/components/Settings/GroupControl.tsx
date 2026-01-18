import React, { useState } from 'react';
import { getSecondsLeft } from '../../groups';
import { secondsInMinute } from 'date-fns/constants';

type GroupControlProps = {
    index: number;
    minIndex?: number;
    group: Group;
    disabled?: boolean;
    dailyResetTime: string;
    onChange: (updatedGroup: Group) => void;
    onIndexChange: (id: string, newIndex: number) => void;
    onDelete: (id: string) => void;
};

export default function GroupControl({
    index,
    minIndex = -1,
    group,
    disabled = false,
    dailyResetTime,
    onChange,
    onIndexChange,
    onDelete,
}: GroupControlProps) {
    const [newIndex, setNewIndex] = useState<string | undefined>(undefined);
    const [newTimelimit, setNewTimelimit] = useState(
        String(group.timelimitSeconds / secondsInMinute)
    );

    const orderValue = newIndex !== undefined ? newIndex : index + 1;
    const secondsLeft = getSecondsLeft(group, dailyResetTime);
    const timeLeftMinutes = Math.floor(secondsLeft / secondsInMinute);
    const timeLeftSeconds = secondsLeft % secondsInMinute;

    const updateOrder = () => {
        if (newIndex === undefined) {
            return;
        }

        onIndexChange(group.id, Number(newIndex) - 1);
        setNewIndex(undefined);
    };

    return (
        <div className="mb-5">
            <div className="is-flex">
                <div className="field mr-2" style={{ width: 75 }}>
                    <label className="label" htmlFor={`${group.id}-group-order-input`}>
                        Order
                    </label>
                    <div className="control">
                        <input
                            id={`${group.id}-group-order-input`}
                            className="input"
                            type="number"
                            value={orderValue}
                            onChange={(event) => setNewIndex(event.currentTarget.value)}
                            onBlur={() => updateOrder()}
                            onKeyUp={(event) => event.key === 'Enter' && updateOrder()}
                            disabled={disabled}
                            min={minIndex + 1}
                        />
                    </div>
                </div>
                <div className="field is-flex-grow-1 mr-2">
                    <label className="label" htmlFor={`${group.id}-group-name-input`}>
                        Group name
                    </label>
                    <div className="control">
                        <input
                            id={`${group.id}-group-name-input`}
                            className="input"
                            type="text"
                            placeholder="Name"
                            value={group.name}
                            onChange={(event) =>
                                onChange({
                                    ...group,
                                    name: event.currentTarget.value,
                                })
                            }
                            disabled={disabled}
                        />
                    </div>
                </div>
                <div className="field mb-2">
                    <label className="label" htmlFor={`${group.id}-group-timelimit-input`}>
                        Timelimit (minutes)
                    </label>
                    <div className="control">
                        <input
                            id={`${group.id}-group-timelimit-input`}
                            className="input"
                            type="number"
                            value={newTimelimit}
                            min={0}
                            onChange={(event) => {
                                setNewTimelimit(String(event.currentTarget.value));
                                onChange({
                                    ...group,
                                    timelimitSeconds:
                                        Number(event.currentTarget.value) * secondsInMinute,
                                });
                            }}
                            disabled={disabled}
                        />
                    </div>
                </div>
            </div>

            <div className="mb-2">
                <label htmlFor={`${group.id}-group-patterns-input`} className="label">
                    URL patterns
                </label>
                <textarea
                    id={`${group.id}-group-patterns-input`}
                    className="textarea"
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
                    disabled={disabled}
                ></textarea>
            </div>

            <div className="is-flex is-align-items-center">
                <span className="is-flex-grow-1">
                    Time left: {timeLeftMinutes} minutes {timeLeftSeconds} seconds
                </span>
                <button
                    className="button is-danger"
                    onClick={() => onDelete(group.id)}
                    disabled={disabled}
                >
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
