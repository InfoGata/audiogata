import { createSlice } from "@reduxjs/toolkit";

interface ISettings {
  navbarOpen: boolean;
}

const initialState: ISettings = {
  navbarOpen: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleNavbar: (state) => {
      return {
        ...state,
        navbarOpen: !state.navbarOpen
      };
    },
  },
});

export const { toggleNavbar } = uiSlice.actions;
export default uiSlice.reducer;
