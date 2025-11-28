import React, { CSSProperties, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { getSettings } from './settings';
import { findMatchingPattern, findMatchingGroup, getTimeLeft } from './groups';

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
        statusClass = 'tag is-large is-success';
        match = matchingAllowedPattern;
        timeLeft = <InfinityIcon />;
    } else if (matchingGroupName) {
        status = 'LIMITED';
        statusClass = 'tag is-large is-warning';
        match = matchingGroupName;
        let minutesLeft = String(Math.floor(matchingGroupTimeLeft / 60)).padStart(2, '0');
        let secondsLeft = String(matchingGroupTimeLeft % 60).padStart(2, '0');
        timeLeft = `${minutesLeft}:${secondsLeft}`;
    } else {
        status = 'NONE';
        statusClass = 'tag is-large is-dark';
        match = 'No match';
        timeLeft = <InfinityIcon />;
    }

    return (
        <main className="p-3" style={{ minWidth: '500px' }}>
            <div className="is-flex is-justify-content-space-between is-align-items-center">
                <h1 className="title is-6 m-0">PAGE LIMITER</h1>
                <div className="title is-6 m-0">
                    <a
                        className="icon-link"
                        href="/options.html"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <span className="icon-text">
                            <span className="icon">
                                <span className="material-symbols-outlined">settings</span>
                            </span>
                            <span>Settings</span>
                        </span>
                    </a>
                </div>
            </div>
            <hr />
            <div className="is-flex is-justify-content-space-between">
                <div>
                    <h2 className="title is-4">
                        Status:
                        <span className={`${statusClass} ml-2 fw-bold`}>{status}</span>
                    </h2>
                    <h5 className="subtitle is-6">{match}</h5>
                </div>
                <div
                    className={`${statusClass} is-flex-direction-column py-2 px-3`}
                    style={{ height: 'auto' }}
                >
                    <h5 className="title is-6 mb-2" style={{ color: 'inherit' }}>
                        Time left
                    </h5>
                    <div className="title is-3 has-text-centered m-0" style={{ color: 'inherit' }}>
                        {timeLeft}
                    </div>
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
        <span className="material-symbols-outlined" style={{ fontSize: 40 }}>
            all_inclusive
        </span>
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
