import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AppDispatch, RootState } from '.';

// Render side database cache

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
    updateItemStatus: (
      state,
      action: PayloadAction<{
        serviceId: string;
        itemId: string;
        newStatus: string | null;
      }>
    ) => {
      const { serviceId, itemId, newStatus } = action.payload;
      const { items } = state.services[serviceId];
      if (items == null) return;
      const index = items.findIndex(
        (item) => item?.itemAbstract?.id === itemId
      );
      if (index < 0) return;
      state.services[serviceId].items[index].status = newStatus;
    },
  },
});

export const { update, updateItemStatus } = databaseSlice.actions;

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
  (serviceId: string, itemAbstract: ItemAbstract) =>
  async (_dispatch: AppDispatch, getState: () => RootState) => {
    const { libraryLocation } = getState().preferences;
    window.database.openItemFolder(libraryLocation, serviceId, itemAbstract);
  };
