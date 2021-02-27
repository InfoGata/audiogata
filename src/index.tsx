import { createMuiTheme, MuiThemeProvider } from "@material-ui/core/styles";
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import "@fontsource/roboto"
import App from "./App";
import "./index.css";
import store, { persistor } from "./store/store";
import reportWebVitals from "./reportWebVitals";

const theme = createMuiTheme({
  palette: {
    type: "dark",
  },
});

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <MuiThemeProvider theme={theme}>
          <App />
        </MuiThemeProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root"),
);

reportWebVitals();
