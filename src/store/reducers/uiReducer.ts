import { createSlice } from "@reduxjs/toolkit";

interface SettingsState {
  navbarOpen: boolean;
}

const initialState: SettingsState = {
  navbarOpen: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleNavbar: (state) => {
      return {
        ...state,
        navbarOpen: !state.navbarOpen,
      };
    },
  },
});

export const { toggleNavbar } = uiSlice.actions;
export default uiSlice.reducer;
