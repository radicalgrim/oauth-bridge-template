let express = require("express");
let request = require("request");
let querystring = require("querystring");

let app = express();

let redirect_uri = process.env.REDIRECT_URI || "http://localhost:8888/callback";

app.get("/login", function (req, res) {
  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: process.env.SPOTIFY_CLIENT_ID,
        scope:
          // Playlist Management
          "ugc-image-upload " + //	 Upload images to Spotify on your behalf.
          "playlist-modify-public " + //  Manage your public playlists.
          "playlist-modify-private " + //  Manage your private playlists.
          "playlist-read-private " + //  Read your private playlists.
          "playlist-read-collaborative " + //  Access your collaborative playlists.
          // Player
          "user-modify-playback-state " + //  Control playback on your Spotify clients and Spotify Connect devices.
          "user-read-currently-playing " + //  Read your currently playing content.
          "user-read-recently-played " + //  Access your recently played items.
          // Library
          "user-library-modify " + //  Manage your saved content.
          // Personalization
          "user-top-read " + //  Read your top artists and content.
          // Profile
          "user-read-email " + //  Get your real email address.
          "user-read-private", //  Access your subscription details.

        // Other scopes I might need
        //'user-follow-modify'               //  Manage who you are following.
        //'user-read-playback-position'      //  Read your position in content you have played.
        //'app-remote-control'               //  Communicate with the Spotify app on your device.
        //'streaming'                        //  Play content and control playback on your other devices.
        //'user-follow-read'                 //  Access your followers and who you are following.
        redirect_uri,
      })
  );
});

app.get("/callback", function (req, res) {
  let code = req.query.code || null;
  let authOptions = {
    url: "https://accounts.spotify.com/api/token",
    form: {
      code: code,
      redirect_uri,
      grant_type: "authorization_code",
    },
    headers: {
      Authorization:
        "Basic " +
        new Buffer(
          process.env.SPOTIFY_CLIENT_ID +
            ":" +
            process.env.SPOTIFY_CLIENT_SECRET
        ).toString("base64"),
    },
    json: true,
  };
  request.post(authOptions, function (error, response, body) {
    var access_token = body.access_token;
    let uri = process.env.FRONTEND_URI || "http://localhost:3000";
    res.redirect(uri + "?access_token=" + access_token);
  });
});

let port = process.env.PORT || 8888;
console.log(
  `Listening on port ${port}. Go /login to initiate authentication flow.`
);
app.listen(port);
