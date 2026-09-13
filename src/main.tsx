import { runPendingAppDataReset } from "./lib/reset-app-data";

// The entry does nothing but this, and the app is imported only afterwards.
// A reset has to happen before the store module is evaluated: persistStore
// reads the persisted state out of localStorage as soon as store.ts is
// imported, and would write it straight back after the reset removed it. The
// same goes for the database, which can only be deleted while nothing holds a
// connection to it. A static import would be evaluated before any code here
// runs, so the app is loaded dynamically.
//
// The app loads whatever happens: a reset must never be what stops it booting.
runPendingAppDataReset()
  .catch(() => {})
  .finally(() => import("./app"));
