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

export async function setIsSyncingEnabled(enabled: boolean, shouldCarryoverSettings: boolean) {
    const carryoverSettings = shouldCarryoverSettings ? await getSettings() : {};

    await new Promise<void>((resolve) => {
        chrome.storage.local.set({ isSyncingEnabled: enabled }, () => {
            resolve();
        });
    });

    saveSettings(carryoverSettings);
}

export function getIsSyncingEnabled() {
    return new Promise<boolean>((resolve) => {
        chrome.storage.local.get({ isSyncingEnabled: true }, (items) => {
            resolve(items.isSyncingEnabled);
        });
    });
}
