const storageLookupData: ExportData = {
    groups: [],
    allowedPatterns: [],
    isStrictModeEnabled: false,
};

export async function getSettings() {
    const isSyncingEnabled = await getIsSyncingEnabled();
    const store = isSyncingEnabled ? 'sync' : 'local';

    return new Promise<Partial<ExportData>>((resolve) => {
        chrome.storage[store].get(storageLookupData, (items) => {
            resolve(items as ExportData);
        });
    });
}

export async function saveSettings(data: Partial<ExportData>) {
    const isSyncingEnabled = await getIsSyncingEnabled();
    const store = isSyncingEnabled ? 'sync' : 'local';

    return new Promise<void>((resolve) => {
        chrome.storage[store].set(cleanData(data), () => resolve());
    });
}

function cleanData(data: Partial<ExportData>): Partial<ExportData> {
    if (data.groups) {
        // Filter out empty URLs
        data.groups = data.groups.map((group) => ({
            ...group,
            patterns: group.patterns.filter(Boolean),
        }));
    }

    if (data.allowedPatterns) {
        // Filter out empty URLs
        data.allowedPatterns = data.allowedPatterns.filter(Boolean);
    }

    return data;
}

export function setIsSyncingEnabled(enabled: boolean) {
    return new Promise<void>((resolve) => {
        chrome.storage.local.set({ isSyncingEnabled: enabled }, () => {
            resolve();
        });
    });
}

export function getIsSyncingEnabled() {
    return new Promise<boolean>((resolve) => {
        chrome.storage.local.get({ isSyncingEnabled: false }, (items) => {
            resolve(items.isSyncingEnabled);
        });
    });
}
