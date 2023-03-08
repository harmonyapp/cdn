import express from "express";
import readRouter from "./routers/read.js";
import writeRouter from "./routers/write.js";
import { auth } from "./middleware.js";

const app = express();

app.use(readRouter);
app.use(auth, writeRouter);

export default app;
