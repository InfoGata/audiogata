import { createSlice } from "redux-starter-kit";

interface ISettings {
  navbarOpen: boolean;
  queuebarOpen: boolean;
}

const initialState: ISettings = {
  navbarOpen: true,
  queuebarOpen: true,
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
    toggleQueuebar: (state) => {
      return {
        ...state,
        queuebarOpen: !state.queuebarOpen
      };
    }
  },
  slice: "ui",
});

export const { toggleNavbar, toggleQueuebar } = uiSlice.actions;
export default uiSlice.reducer;