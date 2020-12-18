import ky from "ky";

/*
 * get access and refresh tokens from spotify
 *
 * @param {boolean} refreshing              If true then access token will only be refreshed
 * @param {string}  code                    The code string sent by spotify after callback
 * @param {string}  stored_refreshed_token  Refresh_token if access token is refreshed
 *
 * Refreshing also work in real life. Drink water my dude
 */
export function getTokens(refreshing, code, stored_refresh_token) {
  const requestParams = new URLSearchParams();
  requestParams.set("redirect_uri", this.$properties.url.callback);
  requestParams.set("client_id", this.$properties.app_credentials.id);
  requestParams.set("client_secret", this.$properties.app_credentials.secret);
  if (refreshing) {
    requestParams.set("grant_type", "refresh_token");
    requestParams.set("refresh_token", stored_refresh_token);
  } else {
    requestParams.set("code", code);
    requestParams.set("grant_type", "authorization_code");
  }

  (async () => {
    // get token from spotify api
    await ky
      .post(this.$properties.url.spotify.token, { body: requestParams })
      .json()
      .then((res) => {
        console.log("token successfully retrieved from Spotify");

        let refresh_token = refreshing
          ? stored_refresh_token
          : res.refresh_token;
        let tokens = JSON.stringify({
          access_token: res.access_token,
          refresh_token: refresh_token,
        });

        // store token on Node server
        const options = {
          body: tokens,
          headers: { "Content-Type": "application/json" },
        };
        ky.post(this.$properties.url.node_server, options)
          .then(() => {
            if (refreshing) {
              console.log("token successfully refreshed on Node server");
            } else {
              console.log("token successfully stored on Node server");
            }
          })
          .catch((err) => {
            console.log("error");
            console.log(err);
          });
      })
      .catch((err) => {
        console.log("error");
        console.log(err);
      });
  })();
}
