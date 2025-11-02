import { getCurrentDate, getTotalSeconds } from './url-groups';

chrome.runtime.onMessage.addListener((message: ExtensionMessage, sender, sendResponse) => {
    switch (message.event) {
        case 'page-visited':
            onPageVisited(message as PageVisitedMessage).then(sendResponse);
            return true;
        case 'page-left':
            onPageLeft(message as PageLeftMessage);
            break;
        default:
            console.log('Mysterious message received', message);
    }
});

export type PageVisitedEventResult = {
    didMatch: boolean;
    secondsLeft: number;
};

async function onPageVisited(message: PageVisitedMessage): Promise<PageVisitedEventResult> {
    console.log('Page visited', { message });
    const currentURL = message.url;
    const urlGroups = await getURLGroups();

    const matchingGroup = findMatchingGroup(urlGroups, currentURL);
    const didMatch = !!matchingGroup;
    if (!didMatch) {
        console.log("Current page doesn't match", { currentURL });
        return { didMatch, secondsLeft: 0 };
    }

    let todaysHistory = matchingGroup.history[getCurrentDate()];
    if (!todaysHistory) {
        todaysHistory = matchingGroup.history[getCurrentDate()] = [];
    }

    const lastHistoryEntry = todaysHistory.length
        ? todaysHistory[todaysHistory.length - 1]
        : ({} as HistoryEntry);
    if (lastHistoryEntry.start && !lastHistoryEntry.end) {
        console.log('Ending unfinished HistoryEntry', { todaysHistory });
        lastHistoryEntry.end = new Date().toISOString();
    }

    const secondsUsed = getTotalSeconds(todaysHistory);
    const secondsLeft = Math.max(matchingGroup.timelimitSeconds - secondsUsed, 0);
    if (secondsLeft === 0) {
        return { didMatch, secondsLeft };
    }

    todaysHistory.push({
        start: new Date().toISOString(),
    });

    await setURLGroups(urlGroups);
    console.log('history entry started', { matchingGroup });

    return { didMatch, secondsLeft };
}

async function onPageLeft(message: PageLeftMessage) {
    const currentURL = message.url;
    const urlGroups = await getURLGroups();

    const matchingGroup = findMatchingGroup(urlGroups, currentURL);
    if (!matchingGroup) {
        console.log("Current page doesn't match", { currentURL });
        return;
    }

    const todaysHistory = matchingGroup.history[getCurrentDate()];
    if (!todaysHistory) {
        console.error('Page matched but no history for today', { currentURL, matchingGroup });
        return;
    }

    todaysHistory[todaysHistory.length - 1].end = new Date().toISOString();
    await setURLGroups(urlGroups);
    console.log('history entry finished', { matchingGroup });
}

function getURLGroups() {
    return new Promise<UrlGroup[]>((resolve) => {
        chrome.storage.sync.get({ urlGroups: [] }, (items) => {
            resolve(items.urlGroups);
        });
    });
}

function setURLGroups(urlGroups: UrlGroup[]) {
    return new Promise<void>((resolve) => {
        chrome.storage.sync.set({ urlGroups }, () => {
            resolve();
        });
    });
}

function findMatchingGroup(urlGroups: UrlGroup[], currentURL: string) {
    for (const urlGroup of urlGroups) {
        for (const url of urlGroup.urls) {
            if (!RegExp(url).test(currentURL)) {
                continue;
            }

            return urlGroup;
        }
    }
}
