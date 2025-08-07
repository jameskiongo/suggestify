import express from "express";
import "dotenv/config";

const router = express.Router();

function generateRandomString(length: number) {
	let text = "";
	const possible =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	for (let i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}
router.get("/spotify", async (_req, res) => {
	const state = generateRandomString(16);
	const redirect_uri = "http://127.0.0.1:3000/auth/callback";
	const scope = "user-read-private user-read-email";
	const params = new URLSearchParams();
	params.append("client_id", String(process.env.CLIENT_ID));
	params.append("response_type", "code");
	params.append("redirect_uri", redirect_uri);
	params.append("scope", scope);
	params.append("state", state);

	res.send(
		`<a href='https://accounts.spotify.com/authorize?${params.toString()}'>Spotify</a>`,
	);
});

router.get("/callback", async (_req, res) => {
	res.send("Callback router");
});
export default router;
