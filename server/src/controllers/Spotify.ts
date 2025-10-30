type token = {
	access_token: string;
	refresh_token: string;
};
type access = {
	access_token: string;
};

type SpotifyTokenResponse = {
	access_token: string;
	refresh_token?: string;
	token_type: string;
	expires_in: number;
};

const client_id = String(process.env.CLIENT_ID);
const client_secret = String(process.env.CLIENT_SECRET);
// Cache the base64 encoded credentials to avoid recomputing
const authorizationHeader = `Basic ${Buffer.from(`${client_id}:${client_secret}`).toString("base64")}`;

export async function generateToken(code: string): Promise<token> {
	const redirect_uri = String(process.env.REDIRECT_URL);
	const params = new URLSearchParams();
	params.append("grant_type", "authorization_code");
	params.append("code", String(code));
	params.append("redirect_uri", redirect_uri);
	const headers = {
		"content-type": "application/x-www-form-urlencoded",
		Authorization: authorizationHeader,
	};
	try {
		const result = await fetch("https://accounts.spotify.com/api/token", {
			method: "POST",
			headers: headers,
			body: params,
		});
		const data = await result.json() as SpotifyTokenResponse;
		return { access_token: data.access_token, refresh_token: data.refresh_token ?? "" };
	} catch (error) {
		throw new Error(`Error: ${error}`);
	}
}
export async function generateAccessToken(code: string): Promise<access> {
	const params = new URLSearchParams();
	params.append("grant_type", "refresh_token");
	params.append("refresh_token", String(code));
	const headers = {
		"content-type": "application/x-www-form-urlencoded",
		Authorization: authorizationHeader,
	};
	try {
		const result = await fetch("https://accounts.spotify.com/api/token", {
			method: "POST",
			headers: headers,
			body: params,
		});
		const data = await result.json() as SpotifyTokenResponse;
		return { access_token: data.access_token };
	} catch (error) {
		throw new Error(`Error: ${error}`);
	}
}
