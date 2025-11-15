import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { getSettings } from './settings';
import { findMatchingAllowedPattern, findMatchingGroup, getTimeLeft } from './url-groups';

const Popup = () => {
    const [currentURL, setCurrentURL] = useState<string>('');
    const [matchingAllowedPattern, setMatchingAllowedPattern] = useState<string>('');
    const [matchingGroupName, setMatchingGroupName] = useState<string>('');
    const [secondsLeft, setSecondsLeft] = useState<number>(0);

    useEffect(() => {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            setCurrentURL(tabs[0].url ?? '');
        });
    }, []);

    useEffect(() => {
        (async () => {
            const { allowedPatterns, urlGroups } = await getSettings();

            const allowedPattern = findMatchingAllowedPattern(allowedPatterns, currentURL);
            if (allowedPattern) {
                setMatchingAllowedPattern(allowedPattern);
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
                <li>Matching allowed: {matchingAllowedPattern}</li>
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
