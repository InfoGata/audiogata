import { createServer } from "cors-anywhere";
const host = "0.0.0.0";
const port = 8085;

createServer({
    originWhitelist: [], // Allow all origins
    requireHeader: ["origin", "x-requested-with"],
    removeHeaders: ["cookie", "cookie2"],
    })
    .listen(port, host, function () {
        // eslint-disable-next-line no-undef
        console.log("Running CORS Anywhere on " + host + ":" + port);
    });
