import React, { ReactNode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import SaveIndicator from './components/Settings/SaveIndicator';
import { HashRouter, NavLink, Route, Routes } from 'react-router';
import LimitsPage from './components/Settings/pages/LimitsPage';
import ImportExportPage from './components/Settings/pages/ImportExportPage';
import StrictModePage from './components/Settings/pages/StrictModePage';
import SyncingPage from './components/Settings/pages/SyncingPage';
import DailyResetTimePage from './components/Settings/pages/DailyResetTimePage';

const Options = () => {
    return (
        <HashRouter>
            <div className="is-flex">
                <aside className="menu p-3" style={{ width: 250 }}>
                    <div className="is-flex is-justify-content-space-between is-align-items-center">
                        <h5 className="title is-5 m-0 pb-1">PAGE LIMITER</h5>
                        <SaveIndicator />
                    </div>
                    <ul className="menu-list">
                        <NavItem to="/">Limits</NavItem>
                        <NavItem to="import-export">Import & Export</NavItem>
                        <NavItem to="strict-mode">Strict Mode</NavItem>
                        <NavItem to="daily-reset-time">Daily Reset Time</NavItem>
                        <NavItem to="syncing">Syncing</NavItem>
                    </ul>
                </aside>
                <main className="p-3">
                    <Routes>
                        <Route index element={<LimitsPage />} />
                        <Route path="import-export" element={<ImportExportPage />} />
                        <Route path="strict-mode" element={<StrictModePage />} />
                        <Route path="daily-reset-time" element={<DailyResetTimePage />} />
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
