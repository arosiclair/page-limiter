import storageLookupData from './storage-lookup-data';

export function getSettings() {
    return new Promise<Partial<ExportData>>((resolve) => {
        chrome.storage.sync.get(storageLookupData, (items) => {
            resolve(items as ExportData);
        });
    });
}

export function setURLGroups(urlGroups: UrlGroup[]) {
    return new Promise<void>((resolve) => {
        chrome.storage.sync.set({ urlGroups }, () => {
            resolve();
        });
    });
}
