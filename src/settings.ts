import { project } from './utils';

type LocalSettings = {
    isSyncingEnabled: boolean;
};

type SyncSettings = {
    groups: Group[];
    allowedPatterns: string[];
    isStrictModeEnabled: boolean;
};

export type Settings = LocalSettings & SyncSettings;

const localSettingsWithDefaults: LocalSettings = {
    isSyncingEnabled: true,
};

const syncSettingsWithDefaults: SyncSettings = {
    groups: [],
    allowedPatterns: [],
    isStrictModeEnabled: false,
};

export async function getSettings(): Promise<Settings> {
    const syncSettings = await getSyncSettings();
    const localSettings = await getLocalSettings();

    return {
        ...localSettings,
        ...syncSettings,
    };
}

async function getSyncSettings(): Promise<SyncSettings> {
    const isSyncingEnabled = await getIsSyncingEnabled();
    const store = isSyncingEnabled ? 'sync' : 'local';

    return await chrome.storage[store].get(syncSettingsWithDefaults);
}

async function getLocalSettings(): Promise<LocalSettings> {
    return await chrome.storage.local.get(localSettingsWithDefaults);
}

export async function saveSettings(data: Partial<Settings>) {
    const isSyncingEnabled = await getIsSyncingEnabled();
    const store = isSyncingEnabled ? 'sync' : 'local';

    const syncSettings = project(
        data,
        Object.keys(syncSettingsWithDefaults)
    ) as Partial<SyncSettings>;
    const localSettings = project(
        data,
        Object.keys(localSettingsWithDefaults)
    ) as Partial<LocalSettings>;

    return Promise.all([
        chrome.storage[store].set(cleanData(syncSettings)),
        chrome.storage.local.set(cleanData(localSettings)),
    ]);
}

function cleanData(data: Partial<Settings>): Partial<Settings> {
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
    const carryoverSettings = shouldCarryoverSettings ? await getSyncSettings() : {};
    await chrome.storage.local.set({ isSyncingEnabled: enabled });
    saveSettings(carryoverSettings);
}

export async function getIsSyncingEnabled() {
    const localSettings = await getLocalSettings();
    return localSettings.isSyncingEnabled;
}
