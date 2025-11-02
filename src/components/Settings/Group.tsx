import React from 'react';

type UrlGroupProps = {
    urlGroup: UrlGroup;
    onGroupChanged: (updatedUrlGroup: UrlGroup) => void;
};

export default function UrlGroup({ urlGroup, onGroupChanged }: UrlGroupProps) {
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
                    value={urlGroup.name}
                    onChange={(event) =>
                        onGroupChanged({
                            ...urlGroup,
                            name: event.currentTarget.value,
                        })
                    }
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
                    value={urlGroup.timelimitSeconds}
                    onChange={(event) =>
                        onGroupChanged({
                            ...urlGroup,
                            timelimitSeconds: Number(event.currentTarget.value),
                        })
                    }
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
                    value={urlGroup.urls.join('\n')}
                    onChange={(event) =>
                        onGroupChanged({
                            ...urlGroup,
                            urls: event.currentTarget.value.split('\n'),
                        })
                    }
                ></textarea>
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
