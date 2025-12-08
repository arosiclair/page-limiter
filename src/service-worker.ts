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
    const { groups, allowedPatterns } = await getSettings();

    if (!groups) {
        console.log('No urlGroups set');
        return;
    }

    clearTimeout(currentTimeout);
    const prevMatchingGroup = groups?.find((group) => group.id === currentMatchedGroupID);
    const secondsUsed = differenceInSeconds(new Date(), currentPageStartTime);
    addTime(groups, prevMatchingGroup, secondsUsed);

    const tab = await chrome.tabs.get(activeInfo.tabId);
    const currentURL = tab.url;

    if (!currentURL) {
        console.log('No URL for the current tab', { tab });
        return;
    }

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
        blockPage(activeInfo.tabId);
        return;
    }

    currentMatchedGroupID = matchingGroup.id;
    currentPageStartTime = new Date();
    currentTimeout = setTimeout(() => {
        blockPage(activeInfo.tabId);
    }, secondsLeft * 1000);
});

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
