import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { getSettings } from './settings';
import { findMatchingAllowedURL, findMatchingGroup, getTimeLeft } from './url-groups';

const Popup = () => {
    const [currentURL, setCurrentURL] = useState<string>('');
    const [matchingAllowedUrlPattern, setMatchingAllowedUrlPattern] = useState<string>('');
    const [matchingGroupName, setMatchingGroupName] = useState<string>('');
    const [secondsLeft, setSecondsLeft] = useState<number>(0);

    useEffect(() => {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            setCurrentURL(tabs[0].url ?? '');
        });
    }, []);

    useEffect(() => {
        (async () => {
            const { allowedUrls, urlGroups } = await getSettings();

            const allowedURL = findMatchingAllowedURL(allowedUrls, currentURL);
            if (allowedURL) {
                setMatchingAllowedUrlPattern(allowedURL);
            }

            const matchingGroup = findMatchingGroup(urlGroups, currentURL);
            if (matchingGroup) {
                setMatchingGroupName(matchingGroup.name);
                setSecondsLeft(getTimeLeft(matchingGroup));
            }
        })();
    }, [currentURL]);

    return (
        <pre>
            <ul style={{ minWidth: '500px' }}>
                <li>Current URL: {currentURL}</li>
                <li>Matching allowed: {matchingAllowedUrlPattern}</li>
                <li>Matching group name: {matchingGroupName}</li>
                <li>Time left: {secondsLeft} seconds</li>
            </ul>
        </pre>
    );
};

const root = createRoot(document.getElementById('root')!);

root.render(
    <React.StrictMode>
        <Popup />
    </React.StrictMode>
);
