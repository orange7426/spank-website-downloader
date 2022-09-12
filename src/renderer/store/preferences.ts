import { createSlice, Dispatch, PayloadAction } from '@reduxjs/toolkit';

export interface PreferencesState {
  libraryLocation: string;
}

const initialState: PreferencesState = {
  libraryLocation: '/',
};

export const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    updateLibraryLocation: (
      state,
      action: PayloadAction<{ libraryLocation: string }>
    ) => {
      state.libraryLocation = action.payload.libraryLocation;
    },
  },
});

export const { updateLibraryLocation } = preferencesSlice.actions;

export default preferencesSlice.reducer;

export const selectAndUpdateLibraryLocation =
  () => async (dispatch: Dispatch) => {
    const newLocation = await window.preferences.selectLibraryLocation();
    // TODO: Alert
    if (newLocation == null) return;
    dispatch(updateLibraryLocation({ libraryLocation: newLocation }));
  };
