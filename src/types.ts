type Group = {
    id: string;
    name: string;
    timelimitSeconds: number;
    patterns: string[];
    secondsUsed: {
        [date: string]: number | undefined;
    };
};

type HistoryEntry = {
    start: string;
    end?: string;
};

type ExtensionMessage = {
    source: 'content-script' | 'popup' | 'service-worker';
    event: string;
};

type PageLoadingMessage = ExtensionMessage & {
    event: 'page-loading';
    url: string;
};

type PageVisitedMessage = ExtensionMessage & {
    event: 'page-visited';
    url: string;
};

type PageLeftMessage = ExtensionMessage & {
    event: 'page-left';
    url: string;
};

type AddTimeMessage = ExtensionMessage & {
    event: 'add-time';
    url: string;
    secondsUsed: number;
};

type TimeAddedMessage = ExtensionMessage & {
    event: 'time-added';
    groupId: string;
    secondsUsed: number;
};

type BlockPageMessage = ExtensionMessage & {
    event: 'block-page';
    url: string;
};
