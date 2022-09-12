import { combineReducers } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import { configureStore } from '@reduxjs/toolkit';
import createElectronStore from './electronStore';

import accounts from './accounts';
import preferences from './preferences';

const persistConfig = {
  key: 'root',
  storage: createElectronStore(),
};

const rootReducer = combineReducers({
  accounts,
  preferences,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
