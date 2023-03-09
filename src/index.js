import app from "./app.js";
import { PORT } from "./constants.js";

function signalListener() {
    process.exit();
}

process.on("SIGINT", signalListener);
process.on("SIGTERM", signalListener);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
