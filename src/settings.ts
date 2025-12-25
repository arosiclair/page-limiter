import storageLookupData from './storage-lookup-data';

export function getSettings() {
    return new Promise<Partial<ExportData>>((resolve) => {
        chrome.storage.sync.get(storageLookupData, (items) => {
            resolve(items as ExportData);
        });
    });
}

export function saveSettings(data: Partial<ExportData>) {
    chrome.storage.sync.set(cleanData(data));
}

function cleanData(data: Partial<ExportData>): Partial<ExportData> {
    const result: Partial<ExportData> = {};

    if (data.groups) {
        // Filter out empty URLs
        result.groups = data.groups.map((group) => ({
            ...group,
            patterns: group.patterns.filter(Boolean),
        }));
    }

    if (data.allowedPatterns) {
        // Filter out empty URLs
        result.allowedPatterns = data.allowedPatterns.filter(Boolean);
    }

    return result;
}

export function setGroups(groups: Group[]) {
    return new Promise<void>((resolve) => {
        chrome.storage.sync.set({ groups }, () => {
            resolve();
        });
    });
}

export function setIsStrictModeEnabled(enabled: boolean) {
    return new Promise<void>((resolve) => {
        chrome.storage.sync.set({ isStrictModeEnabled: enabled }, () => {
            resolve();
        });
    });
}
