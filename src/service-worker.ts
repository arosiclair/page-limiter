import { getSettings, setGroups } from './settings';
import { findMatchingPattern, findMatchingGroup, getCurrentDate, getSecondsLeft } from './groups';
import { differenceInSeconds } from 'date-fns';

export type PageVisitedEventResult = {
    didMatch: boolean;
    secondsLeft: number;
};

let currentMatchedGroupID: string;
let currentPageStartTime: Date;
let currentTimeout: NodeJS.Timeout;

chrome.tabs.onActivated.addListener(async (activeInfo) => {
    console.log('tab activated', { activeInfo });

    const tab = await chrome.tabs.get(activeInfo.tabId);
    const currentURL = tab.url;
    const currentTabID = tab.id;

    if (!currentURL) {
        console.log('No URL for the current tab', { tab });
        return;
    }

    if (!currentTabID) {
        console.log('No URL for the current tab', { tab });
        return;
    }

    onPageChanged(currentURL, currentTabID);
});

chrome.tabs.onUpdated.addListener(async (tabID, changeInfo, tab) => {
    console.log('tab updated', { tab, changeInfo });

    const currentURL = changeInfo.url;
    const currentTabID = tab.id;

    if (!currentURL) {
        console.log('No URL for the current tab', { tab });
        return;
    }

    if (!currentTabID) {
        console.log('No URL for the current tab', { tab });
        return;
    }

    onPageChanged(currentURL, currentTabID);
});

async function onPageChanged(currentURL: string, tabID: number) {
    const { groups, allowedPatterns } = await getSettings();

    if (!groups) {
        console.log('No urlGroups set');
        return;
    }

    // Finish tracking the current session
    clearTimeout(currentTimeout);
    const prevMatchingGroup = groups?.find((group) => group.id === currentMatchedGroupID);
    const secondsUsed = differenceInSeconds(new Date(), currentPageStartTime);
    addTime(groups, prevMatchingGroup, secondsUsed);

    // Check for matches
    const allowedPattern = findMatchingPattern(allowedPatterns ?? [], currentURL);
    if (allowedPattern) {
        console.log('Current page is allowed. No time added', { allowedPattern, currentURL });
        return;
    }

    const matchingGroup = findMatchingGroup(groups, currentURL);
    if (!matchingGroup) {
        console.log("Current page doesn't match", { currentURL });
        return;
    }

    const secondsLeft = getSecondsLeft(matchingGroup);
    if (secondsLeft === 0) {
        blockPage(tabID);
        return;
    }

    // Start tracking this session
    currentMatchedGroupID = matchingGroup.id;
    currentPageStartTime = new Date();
    currentTimeout = setTimeout(() => {
        blockPage(tabID);
    }, secondsLeft * 1000);
}

async function addTime(groups: Group[], matchingGroup: Group | undefined, seconds: number) {
    if (!matchingGroup) {
        return;
    }

    matchingGroup.secondsUsed[getCurrentDate()] =
        (matchingGroup.secondsUsed[getCurrentDate()] ?? 0) + seconds;

    await setGroups(groups);
    console.log('Time added', { group: matchingGroup });
}

function blockPage(tabId: number) {
    return chrome.tabs.update(tabId, { url: 'https://0.0.0.0/' });
}
