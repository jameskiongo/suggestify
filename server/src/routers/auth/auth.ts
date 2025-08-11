import express from "express";
import "dotenv/config";

const router = express.Router();
const redirect_uri = "http://127.0.0.1:3000/auth/callback";
const client_id = String(process.env.CLIENT_ID);
const client_secret = String(process.env.CLIENT_SECRET);

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
	const scope = "user-read-private user-read-email";
	const params = new URLSearchParams();
	params.append("client_id", client_id);
	params.append("response_type", "code");
	params.append("redirect_uri", redirect_uri);
	params.append("scope", scope);
	params.append("state", state);

	res.send(
		`<a href='https://accounts.spotify.com/authorize?${params.toString()}'>Spotify</a>`,
	);
});

router.get("/callback", async (req, res) => {
	const state = req.query.state || null;
	const code = req.query.code || null;
	if (!state || !code) {
		res.redirect("/auth/spotify");
	} else {
		try {
			const token = await generateToken(String(code));
			console.log(`token: ${token}`);
		} catch (error) {
			console.log(error);
		}
	}
});
async function generateToken(code: string) {
	const params = new URLSearchParams();
	params.append("grant_type", "authorization_code");
	params.append("code", String(code));
	params.append("redirect_uri", redirect_uri);
	const headers = {
		"content-type": "application/x-www-form-urlencoded",
		Authorization: `Basic ${Buffer.from(`${client_id}:${client_secret}`).toString("base64")}`,
	};
	try {
		const result = await fetch("https://accounts.spotify.com/api/token", {
			method: "POST",
			headers: headers,
			body: params,
		});
		const { access_token } = await result.json();
		return access_token;
	} catch (error) {
		console.log(error);
	}
}
export default router;
