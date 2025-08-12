import express from "express";
import "dotenv/config";
import { generateAccessToken, generateToken } from "../../controllers/Spotify";

const router = express.Router();
const redirect_uri = String(process.env.REDIRECT_URL);
const client_id = String(process.env.CLIENT_ID);

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
			const { access_token, refresh_token } = token;
			res.cookie("access_token", access_token, { maxAge: 3600 });
			res.cookie("refresh_token", refresh_token);
			res.redirect("/auth/profile");
		} catch (error) {
			console.log(error);
		}
	}
});
router.get("/profile", async (req, res) => {
	if (!req.cookies) {
		res.redirect("spotify");
	} else {
		const access = req.cookies["access_token"];
		const refresh = req.cookies["refresh_token"];
		if (!access && !refresh) {
			res.redirect("/auth/spotify");
		}
		if (refresh) {
			const token = await generateAccessToken(refresh);
			const { access_token } = token;
			const refreshed = access_token;
			try {
				const result = await fetch("https://api.spotify.com/v1/me/playlists", {
					method: "GET",
					headers: { Authorization: `Bearer ${refreshed}` },
				});
				const data = await result.json();
				res.send(data);
			} catch (error) {
				throw new Error(`Error: ${error}`);
			}
		}
	}
});

export default router;
