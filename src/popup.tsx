import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { getSettings } from './settings';
import { findMatchingPattern, findMatchingGroup, getSecondsLeft } from './groups';
import { differenceInSeconds } from 'date-fns';
import { PageVisitedEventResult } from './service-worker';
import AsyncLock from 'async-lock';
import Timer from './modules/timer';

// It takes some time for the content script to add time after losing focus to the popup. So wait we wait a few ms
// So that we can fetch the updated time data.
const FETCH_TIMER_DELAY = 250;

const Popup = () => {
    const [matchingAllowedPattern, setMatchingAllowedPattern] = useState<string>('');
    const [matchingGroupName, setMatchingGroupName] = useState<string>('');
    const [matchingGroupTimeLeft, setMatchingGroupTimeLeft] = useState<number>(0);

    useEffect(() => {
        setTimeout(() => {
            chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
                const currentURL = tabs[0].url ?? '';
                const { allowedPatterns, groups } = await getSettings();
                const allowedPattern = findMatchingPattern(allowedPatterns, currentURL);
                const matchingGroup = findMatchingGroup(groups, currentURL);
                let secondsLeft = getSecondsLeft(matchingGroup);

                setMatchingAllowedPattern(allowedPattern ?? '');
                setMatchingGroupName(matchingGroup?.name ?? '');
                setMatchingGroupTimeLeft(secondsLeft);

                if (!secondsLeft) {
                    return;
                }

                let interval: NodeJS.Timeout;
                interval = setInterval(() => {
                    secondsLeft--;
                    setMatchingGroupTimeLeft(secondsLeft);

                    if (secondsLeft === 0) {
                        clearInterval(interval);
                    }
                }, 1000);
            });
        }, FETCH_TIMER_DELAY);
    }, []);

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

let currentURL = '';
const lock = new AsyncLock();
const timer = new Timer();
timer.onTimeout = blockPage;

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    currentURL = tabs[0].url ?? '';
    setTimeout(() => {
        startTimer(currentURL);
    }, FETCH_TIMER_DELAY);
});
window.addEventListener('blur', stopTimer);
window.addEventListener('beforeunload', stopTimer);

function startTimer(url: string) {
    lock.acquire('timer', (done) => {
        if (timer.isRunning()) {
            done();
            return;
        }

        const message: PageVisitedMessage = {
            source: 'popup',
            event: 'page-visited',
            url: url,
        };

        chrome.runtime.sendMessage(message, (response: PageVisitedEventResult) => {
            if (!response.didMatch) {
                done();
                return;
            }

            timer.start(response.secondsLeft);
            done();
        });
    });
}

function stopTimer() {
    lock.acquire('timer', (done) => {
        if (!timer.isRunning()) {
            done();
            return;
        }

        const message: AddTimeMessage = {
            source: 'popup',
            event: 'add-time',
            url: currentURL,
            secondsUsed: differenceInSeconds(new Date(), timer.stop()),
        };

        chrome.runtime.sendMessage(message);
        done();
    });
}

function blockPage() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTabId = tabs[0].id ?? 0;
        const url = tabs[0].url ?? '';
        const message: BlockPageMessage = {
            source: 'popup',
            event: 'block-page',
            url,
        };
        chrome.tabs.sendMessage(activeTabId, message);
    });
}
