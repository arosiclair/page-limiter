import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { getSettings } from './settings';
import { findMatchingPattern, findMatchingGroup, getTimeLeft } from './url-groups';

const Popup = () => {
    const [currentURL, setCurrentURL] = useState<string>('');
    const [matchingAllowedPattern, setMatchingAllowedPattern] = useState<string>('');
    const [matchingGroupName, setMatchingGroupName] = useState<string>('');
    const [matchingGroupTimeLeft, setMatchingGroupTimeLeft] = useState<number>(0);

    useEffect(() => {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            setCurrentURL(tabs[0].url ?? '');
        });
    }, []);

    useEffect(() => {
        (async () => {
            const { allowedPatterns, groups } = await getSettings();
            const allowedPattern = findMatchingPattern(allowedPatterns, currentURL);
            const matchingGroup = findMatchingGroup(groups, currentURL);
            setMatchingAllowedPattern(allowedPattern ?? '');
            setMatchingGroupName(matchingGroup?.name ?? '');
            setMatchingGroupTimeLeft(getTimeLeft(matchingGroup));
        })();
    }, [currentURL]);

    let status = '';
    let statusClass = '';
    let timeLeft;
    let match;
    if (matchingAllowedPattern) {
        status = 'ALLOWED';
        statusClass = 'badge text-bg-success';
        match = matchingAllowedPattern;
        timeLeft = <InfinityIcon />;
    } else if (matchingGroupName) {
        status = 'LIMITED';
        statusClass = 'badge text-bg-warning';
        match = matchingGroupName;
        let minutesLeft = String(Math.floor(matchingGroupTimeLeft / 60)).padStart(2, '0');
        let secondsLeft = String(matchingGroupTimeLeft % 60).padStart(2, '0');
        timeLeft = `${minutesLeft}:${secondsLeft}`;
    } else {
        status = 'NONE';
        statusClass = 'badge text-bg-secondary';
        match = 'No matches';
        timeLeft = <InfinityIcon />;
    }

    return (
        <main className="p-3" style={{ minWidth: '500px' }}>
            <h5 className="fw-bold">PAGE LIMITER</h5>
            <div className="d-flex align-items-center justify-content-between">
                <div>
                    <h3>
                        Status:
                        <span className={`${statusClass} ms-2 fw-bold`}>{status}</span>
                    </h3>
                    <h4>{match}</h4>
                </div>
                <div className={`${statusClass} py-2 px-3`}>
                    <h5>Time left</h5>
                    <h1 className="m-0 text-center fw-bold">{timeLeft}</h1>
                </div>
            </div>
        </main>
    );
};

const root = createRoot(document.getElementById('root')!);

root.render(
    <React.StrictMode>
        <Popup />
    </React.StrictMode>
);

function InfinityIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            strokeWidth="16"
            fill="currentColor"
            className="bi bi-infinity"
            viewBox="0 0 16 16"
        >
            <path d="M5.68 5.792 7.345 7.75 5.681 9.708a2.75 2.75 0 1 1 0-3.916ZM8 6.978 6.416 5.113l-.014-.015a3.75 3.75 0 1 0 0 5.304l.014-.015L8 8.522l1.584 1.865.014.015a3.75 3.75 0 1 0 0-5.304l-.014.015zm.656.772 1.663-1.958a2.75 2.75 0 1 1 0 3.916z" />
        </svg>
    );
}
