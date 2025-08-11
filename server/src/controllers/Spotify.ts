type token = {
	access_token: string;
	refresh_token: string;
};

export async function generateToken(code: string): Promise<token> {
	const redirect_uri = String(process.env.REDIRECT_URL);
	const client_id = String(process.env.CLIENT_ID);
	const client_secret = String(process.env.CLIENT_SECRET);

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
