import { createSlice } from "@reduxjs/toolkit";

interface UiState {
  navbarOpen: boolean;
}

const initialState: UiState = {
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
