chrome.runtime.onMessage.addListener((message: ExtensionMessage) => {
    switch (message.event) {
        case 'page-visited':
            onPageVisited(message as PageVisitedMessage);
            break;
        case 'page-left':
            onPageLeft(message as PageLeftMessage);
            break;
        default:
            console.log('Mysterious message received', message);
    }
});

async function onPageVisited(message: PageVisitedMessage) {
    console.log('Page visited', { message });
    const currentURL = message.url;
    const urlGroups = await getURLGroups();

    const matchingGroup = findMatchingGroup(urlGroups, currentURL);
    if (!matchingGroup) {
        console.log("Current page doesn't match", { currentURL });
        return;
    }

    let todaysHistory = matchingGroup.history[getCurrentDate()];
    if (!todaysHistory) {
        todaysHistory = matchingGroup.history[getCurrentDate()] = [];
    }

    const lastHistoryEntry = todaysHistory.length
        ? todaysHistory[todaysHistory.length - 1]
        : ({} as HistoryEntry);
    if (lastHistoryEntry.start && !lastHistoryEntry.end) {
        console.log('Continuing with unfinished HistoryEntry', {
            todaysHistory,
        });
        return;
    }

    todaysHistory.push({
        start: new Date().toISOString(),
    });

    await setURLGroups(urlGroups);
    console.log('history entry started', { matchingGroup });
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
        console.error('Page matched but no history for today', {
            currentURL,
            matchingGroup,
        });
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

function getCurrentDate(): string {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const today = new Date(now.getTime() - offset * 60 * 1000);
    return today.toISOString().split('T')[0];
}
