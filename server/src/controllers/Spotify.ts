type token = {
	access_token: string;
	refresh_token: string;
};
type access = {
	access_token: string;
};

const client_id = String(process.env.CLIENT_ID);
const client_secret = String(process.env.CLIENT_SECRET);

export async function generateToken(code: string): Promise<token> {
	const redirect_uri = String(process.env.REDIRECT_URL);
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
		const { access_token, refresh_token } = await result.json();
		return { access_token, refresh_token };
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
		Authorization: `Basic ${Buffer.from(`${client_id}:${client_secret}`).toString("base64")}`,
	};
	try {
		const result = await fetch("https://accounts.spotify.com/api/token", {
			method: "POST",
			headers: headers,
			body: params,
		});
		const { access_token } = await result.json();
		return { access_token };
	} catch (error) {
		throw new Error(`Error: ${error}`);
	}
}
