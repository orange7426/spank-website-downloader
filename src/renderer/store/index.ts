import { createStore, combineReducers } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import createElectronStore from './electron-store';

import accounts from './accounts';

const persistConfig = {
  key: 'root',
  storage: createElectronStore(),
};

const rootReducer = combineReducers({
  accounts,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = createStore(persistedReducer);

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
