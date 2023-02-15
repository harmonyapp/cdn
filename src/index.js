import express from "express";
import { PORT } from "./constants.js";
import { auth } from "./middleware.js";
import readRouter from "./routers/read.js";
import writeRouters from "./routers/write.js";

const app = express();

app.use(readRouter);

app.use(auth, writeRouters);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
