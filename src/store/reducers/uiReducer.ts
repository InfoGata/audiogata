import { createSlice } from "redux-starter-kit";

interface ISettings {
  navbarOpen: boolean;
}

const initialState: ISettings = {
  navbarOpen: false,
};

const uiSlice = createSlice({
  initialState,
  reducers: {
    toggleNavbar: (state) => {
      return {
        ...state,
        navbarOpen: !state.navbarOpen
      };
    },
  },
  slice: "ui",
});

export const { toggleNavbar } = uiSlice.actions;
export default uiSlice.reducer;
