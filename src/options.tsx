import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { debounce } from './utils';
import storageLookupData from './storage-lookup-data';
import SaveIndicator from './components/Settings/SaveIndicator';
import { BrowserRouter, HashRouter, Route, Routes } from 'react-router';
import LimitsPage from './components/Settings/pages/LimitsPage';
import ImportExportPage from './components/Settings/pages/ImportExportPage';

const Options = () => {
    const [isSaving] = useState(false);

    return (
        <HashRouter>
            <div className="is-flex">
                <aside className="menu p-3" style={{ width: 250 }}>
                    <div className="is-flex is-justify-content-space-between is-align-items-center">
                        <h5 className="title is-5 m-0 pb-1">Page Limiter</h5>
                        <SaveIndicator isLoading={isSaving} />
                    </div>
                    <ul className="menu-list">
                        <li>
                            <a href="#">Pages</a>
                        </li>
                        <li>
                            <a href="#import-export">Import & Export</a>
                        </li>
                    </ul>
                </aside>
                <main className="px-3 py-2">
                    <Routes>
                        <Route index element={<LimitsPage />} />
                        <Route path="import-export" element={<ImportExportPage />} />
                    </Routes>
                </main>
            </div>
        </HashRouter>
    );
};

const root = createRoot(document.getElementById('root')!);

root.render(
    <React.StrictMode>
        <Options />
    </React.StrictMode>
);
