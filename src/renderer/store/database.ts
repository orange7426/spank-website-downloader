import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { TypedUseSelectorHook } from 'react-redux';
import type { AppDispatch, RootState } from '.';

// Render side database cache

export interface DatabaseServiceItem {
  item: Item;
  localThumbnail: string | null;
  status: string | null;
}

export interface ServiceState {
  items: Array<DatabaseServiceItem>;
}

export interface DatabaseState {
  services: Record<string, ServiceState>;
}

const initialState: DatabaseState = {
  services: {},
};

export const databaseSlice = createSlice({
  name: 'database',
  initialState,
  reducers: {
    update: (
      state,
      action: PayloadAction<{
        serviceId: string;
        serviceState: Partial<ServiceState>;
      }>
    ) => {
      const { serviceId, serviceState } = action.payload;
      state.services[serviceId] = {
        ...state.services[serviceId],
        ...serviceState,
      };
    },
  },
});

export const { update } = databaseSlice.actions;

export default databaseSlice.reducer;

export const pullServiceFolder =
  (serviceId: string) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const { libraryLocation } = getState().preferences;
    const items = await window.database.readServiceFolder(
      libraryLocation,
      serviceId
    );
    dispatch(update({ serviceId, serviceState: { items } }));
  };

export const openItemFolder =
  (serviceId: string, item: Item) =>
  async (_dispatch: AppDispatch, getState: () => RootState) => {
    const { libraryLocation } = getState().preferences;
    window.database.openItemFolder(libraryLocation, serviceId, item);
  };
