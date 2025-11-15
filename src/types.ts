type Group = {
    id: string;
    name: string;
    timelimitSeconds: number;
    patterns: string[];
    history: {
        [date: string]: HistoryEntry[] | undefined;
    };
};

type HistoryEntry = {
    start: string;
    end?: string;
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

type ExportData = {
    groups: Group[];
    allowedPatterns: string[];
};
