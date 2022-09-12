import {
  MemoryRouter as Router,
  Routes,
  Route,
  Outlet,
} from 'react-router-dom';
import './App.scss';
import { FocusStyleManager } from '@blueprintjs/core';
import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import Menu from './pages/Menu';
import Preferences from './pages/preferences/Preferences';
import PreferencesGeneral from './pages/preferences/PreferencesGeneral';
import PreferencesAccounts from './pages/preferences/PreferencesAccounts';
import { store, persistor } from './store';

export default function App() {
  useEffect(() => {
    FocusStyleManager.onlyShowFocusOnTabs();
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Router>
          <Menu />
          <Routes>
            <Route path="/" element={<Outlet />}>
              <Route path="preferences" element={<Preferences />}>
                <Route path="general" element={<PreferencesGeneral />} />
                <Route path="accounts" element={<PreferencesAccounts />} />
              </Route>
            </Route>
          </Routes>
        </Router>
      </PersistGate>
    </Provider>
  );
}
