import React, { ReactNode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import SaveIndicator from './components/Settings/SaveIndicator';
import { HashRouter, NavLink, Route, Routes } from 'react-router';
import LimitsPage from './components/Settings/pages/LimitsPage';
import ImportExportPage from './components/Settings/pages/ImportExportPage';
import StrictModePage from './components/Settings/pages/StrictModePage';
import SyncingPage from './components/Settings/pages/SyncingPage';

const Options = () => {
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const onStorageUpdated = () => {
            setIsSaving(true);
            setTimeout(() => {
                setIsSaving(false);
            }, 500);
        };

        chrome.storage.onChanged.addListener(onStorageUpdated);

        return () => chrome.storage.onChanged.removeListener(onStorageUpdated);
    }, []);

    return (
        <HashRouter>
            <div className="is-flex">
                <aside className="menu p-3" style={{ width: 250 }}>
                    <div className="is-flex is-justify-content-space-between is-align-items-center">
                        <h5 className="title is-5 m-0 pb-1">Page Limiter</h5>
                        <SaveIndicator isLoading={isSaving} />
                    </div>
                    <ul className="menu-list">
                        <NavItem to="/">Limits</NavItem>
                        <NavItem to="import-export">Import & Export</NavItem>
                        <NavItem to="strict-mode">Strict Mode</NavItem>
                        <NavItem to="syncing">Syncing</NavItem>
                    </ul>
                </aside>
                <main className="p-3">
                    <Routes>
                        <Route index element={<LimitsPage />} />
                        <Route path="import-export" element={<ImportExportPage />} />
                        <Route path="strict-mode" element={<StrictModePage />} />
                        <Route path="syncing" element={<SyncingPage />} />
                    </Routes>
                </main>
            </div>
        </HashRouter>
    );
};

type NavItemProps = {
    to: string;
    children: ReactNode;
};

function NavItem({ to, children }: NavItemProps) {
    return (
        <li className="my-3">
            <NavLink to={to} className={({ isActive }) => (isActive ? 'is-active' : '')}>
                {children}
            </NavLink>
        </li>
    );
}

const root = createRoot(document.getElementById('root')!);

root.render(
    <React.StrictMode>
        <Options />
    </React.StrictMode>
);
