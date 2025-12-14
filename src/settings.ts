import storageLookupData from './storage-lookup-data';

export function getSettings() {
    return new Promise<Partial<ExportData>>((resolve) => {
        chrome.storage.sync.get(storageLookupData, (items) => {
            resolve(items as ExportData);
        });
    });
}

export function saveSettings(data: ExportData) {
    chrome.storage.sync.set(cleanData(data));
}

function cleanData(data: ExportData): ExportData {
    return {
        // Filter out empty URLs
        groups: data.groups.map((group) => ({
            ...group,
            patterns: group.patterns.filter(Boolean),
        })),

        // Filter out empty URLs
        allowedPatterns: data.allowedPatterns.filter(Boolean),
    };
}

export function setGroups(groups: Group[]) {
    return new Promise<void>((resolve) => {
        chrome.storage.sync.set({ groups }, () => {
            resolve();
        });
    });
}
