import { createServer } from "cors-anywhere";
const host = "0.0.0.0";
const initialPort = 8085;
let port = initialPort;
const maxPort = initialPort + 10; // Try up to 10 ports

function startServer(currentPort) {
    const server = createServer({
        originWhitelist: [], // Allow all origins
        requireHeader: ["origin", "x-requested-with"],
        removeHeaders: ["cookie", "cookie2"],
    });
    
    server.listen(currentPort, host, function () {
        // eslint-disable-next-line no-undef
        console.log("Running CORS Anywhere on " + host + ":" + currentPort);
    }).on("error", (err) => {
        // eslint-disable-next-line no-undef
        if (err.code === 'EADDRINUSE' && currentPort < maxPort) {
        // eslint-disable-next-line no-undef
            console.log(`Port ${currentPort} is in use, trying ${currentPort + 1}`);
            startServer(currentPort + 1);
        } else {
        // eslint-disable-next-line no-undef
            console.log("Error starting server:", err);
        }
    });
}

startServer(port);
