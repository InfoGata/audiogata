import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  navbarOpen: boolean;
  trackLoading: boolean;
}

const initialState: UiState = {
  navbarOpen: false,
  trackLoading: false,
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
    setNavbarOpen: (state, action: PayloadAction<boolean>) => {
      state.navbarOpen = action.payload;
    },
    setTrackLoading: (state, action: PayloadAction<boolean>) => {
      return {
        ...state,
        trackLoading: action.payload,
      };
    },
  },
});

export const { toggleNavbar, setTrackLoading, setNavbarOpen } = uiSlice.actions;
export default uiSlice.reducer;
