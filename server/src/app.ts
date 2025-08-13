import cookieParser from "cookie-parser";
import express from "express";
import authRouter from "./routers/auth/auth";
const app = express();
app.use(express.json());
app.use(cookieParser());

const PORT = 3000;

app.get("/ping", (_req, res) => {
	console.log("someone pinged here");
	res.send("pong");
});

app.use("/auth", authRouter);

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
