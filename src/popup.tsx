import React, { CSSProperties, useEffect, useState } from 'react';
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
        match = 'No match';
        timeLeft = <InfinityIcon />;
    }

    return (
        <main className="p-3" style={{ minWidth: '500px' }}>
            <div className=" d-flex align-items-center justify-content-between">
                <h6 className="m-0 fw-bold">PAGE LIMITER</h6>
                <h6 className="m-0">
                    <a
                        className="icon-link text-decoration-none"
                        href="/options.html"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <SettingsIcon />
                        Settings
                    </a>
                </h6>
            </div>
            <hr />
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

function SettingsIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="currentColor"
            className="bi bi-gear"
            viewBox="0 0 16 16"
        >
            <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0" />
            <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115z" />
        </svg>
    );
}
