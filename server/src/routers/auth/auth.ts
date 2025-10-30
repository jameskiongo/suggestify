import express from "express";
import "dotenv/config";
import { generateAccessToken, generateToken } from "../../controllers/Spotify";

type SpotifyPlaylistsResponse = {
	items: unknown[];
	total: number;
};

const router = express.Router();
const redirect_uri = String(process.env.REDIRECT_URL);
const client_id = String(process.env.CLIENT_ID);

function generateRandomString(length: number) {
	const possible =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	const chars: string[] = [];

	for (let i = 0; i < length; i++) {
		chars.push(possible.charAt(Math.floor(Math.random() * possible.length)));
	}
	return chars.join("");
}
router.get("/spotify", (_req, res) => {
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
	const state = req.query.state as string | undefined;
	const code = req.query.code as string | undefined;
	
	if (!state || !code) {
		res.redirect("/auth/spotify");
		return;
	}
	
	try {
		const token = await generateToken(code);
		res.cookie("access_token", token.access_token, { maxAge: 3600 });
		res.cookie("refresh_token", token.refresh_token);
		res.redirect("/auth/profile");
	} catch (error) {
		console.error("Error in callback:", error);
		res.redirect("/auth/spotify");
	}
});
router.get("/profile", async (req, res) => {
	// Check for refresh token in cookies
	const cookies = req.cookies as Record<string, string> | undefined;
	const refresh = cookies?.["refresh_token"];
	
	if (!refresh) {
		res.redirect("/auth/spotify");
		return;
	}

	try {
		const token = await generateAccessToken(refresh);
		const result = await fetch("https://api.spotify.com/v1/me/playlists", {
			method: "GET",
			headers: { Authorization: `Bearer ${token.access_token}` },
		});
		const data = await result.json() as SpotifyPlaylistsResponse;
		res.send(data);
	} catch (error) {
		console.error("Error fetching profile:", error);
		res.redirect("/auth/spotify");
	}
});

export default router;
