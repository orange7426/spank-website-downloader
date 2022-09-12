import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Account {
  username: string;
  password: string;
  serviceIds: Array<string>;
}

export interface AccountsState {
  accounts: Array<Account>;
}

const initialState: AccountsState = {
  accounts: [],
};

export const accountsSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    add: (state, action: PayloadAction<{ account: Account }>) => {
      // TODO: unique
      state.accounts.push(action.payload.account);
    },
    remove: (state, action: PayloadAction<{ index: number }>) => {
      state.accounts.splice(action.payload.index, 1);
    },
  },
});

export const { add, remove } = accountsSlice.actions;

export default accountsSlice.reducer;
