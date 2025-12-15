import { getSettings, setGroups } from './settings';
import { findMatchingPattern, findMatchingGroup, getCurrentDate, getSecondsLeft } from './groups';
import AsyncLock from 'async-lock';

const lock = new AsyncLock();

chrome.runtime.onMessage.addListener((message: ExtensionMessage, sender, sendResponse) => {
    console.log('message received', message);
    switch (message.event) {
        case 'page-visited':
            onPageVisited(message as PageVisitedMessage).then(sendResponse);
            return true;
        case 'add-time':
            addTime(message as AddTimeMessage);
            break;
        default:
            return;
    }
});

export type PageVisitedEventResult = {
    didMatch: boolean;
    secondsLeft: number;
};

async function onPageVisited(message: PageVisitedMessage): Promise<PageVisitedEventResult> {
    const currentURL = message.url;
    const { groups, allowedPatterns } = await getSettings();

    const allowedPattern = findMatchingPattern(allowedPatterns ?? [], currentURL);
    if (allowedPattern) {
        console.log('current page is allowed', { allowedPattern, currentURL });
        return { didMatch: false, secondsLeft: 0 };
    }

    if (!groups) {
        console.log('no groups set', { currentURL });
        return { didMatch: false, secondsLeft: 0 };
    }

    const matchingGroup = findMatchingGroup(groups, currentURL);
    return {
        didMatch: !!matchingGroup,
        secondsLeft: getSecondsLeft(matchingGroup),
    };
}

async function addTime(message: AddTimeMessage) {
    const currentURL = message.url;

    // If the content_script and popup call addTime in quick succession, we need to process them synchronously to count
    // the time correctly.
    lock.acquire('addTime', async (done) => {
        const { groups, allowedPatterns } = await getSettings();

        if (!groups) {
            console.log('no groups set', { currentURL });
            done();
            return;
        }

        const allowedPattern = findMatchingPattern(allowedPatterns ?? [], currentURL);
        if (allowedPattern) {
            console.log('current page is allowed', { allowedPattern, currentURL });
            done();
            return;
        }

        const matchingGroup = findMatchingGroup(groups, currentURL);
        if (!matchingGroup) {
            console.log("current page doesn't match", { currentURL });
            done();
            return;
        }

        matchingGroup.secondsUsed = {
            [getCurrentDate()]:
                (matchingGroup.secondsUsed[getCurrentDate()] ?? 0) + message.secondsUsed,
        };

        await setGroups(groups);
        console.log('time added', { matchingGroup });
        done();
    });
}
