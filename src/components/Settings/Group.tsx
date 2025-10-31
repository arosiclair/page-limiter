import React from 'react';

type UrlGroupProps = {
    urlGroup: UrlGroup;
};

export default function UrlGroup({ urlGroup }: UrlGroupProps) {
    return (
        <div>
            <div>ID: {urlGroup.id}</div>
            <div>Name: {urlGroup.name}</div>
            <div>Timelimit: {urlGroup.timelimitSeconds}</div>
            <div>Urls: {JSON.stringify(urlGroup.urls)}</div>
        </div>
    );
}
