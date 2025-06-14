type UrlGroup = {
    id: string;
    name: string;
    timelimitSeconds: number;
    urls: string[];
    history: {
        [date: string]: HistoryEntry[] | undefined;
    };
};

type HistoryEntry = {
    start: Date;
    end?: Date;
};

type ExtensionMessage = {
    event: string;
};

type PageVisitedMessage = ExtensionMessage & {
    event: 'page-visited';
    url: string;
};

type PageLeftMessage = ExtensionMessage & {
    event: 'page-left';
    url: string;
};
