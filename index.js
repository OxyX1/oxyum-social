const express = require('express');
const session = require('express-session');
const { AuthorizationCode } = require('simple-oauth2');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(session({ secret: '829327c246b2b2f1b6fb2aadfc5620045302d639', resave: false, saveUninitialized: true }));

const config = {
  client: {
    id: process.env.CLIENT_ID,
    secret: process.env.CLIENT_SECRET,
  },
  auth: {
    tokenHost: process.env.TOKEN_HOST,
    authorizePath: process.env.AUTHORIZE_PATH,
    tokenPath: process.env.TOKEN_PATH,
  },
};

const client = new AuthorizationCode(config);

app.get('/auth', (req, res) => {
  const authorizationUri = client.authorizeURL({
    redirect_uri: 'http://localhost:3000/auth/github/callback',
    scope: 'openid profile email',
    state: 'random_state_string',
  });
  res.redirect(authorizationUri);
});

app.get('/auth/github/callback', async (req, res) => {
  const { code } = req.query;
  const tokenParams = {
    code,
    redirect_uri: 'http://localhost:3000/auth/github/callback',
    scope: 'openid profile email',
  };
  try {
    const accessToken = await client.getToken(tokenParams);
    req.session.token = accessToken.token;
    res.send('Authentication successful! You can now access protected routes.');
  } catch (error) {
    res.status(500).json('Authentication failed');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.send('Logged out');
});

app.listen(PORT, () => {
  console.log(`OAuth2 app running on http://localhost:${PORT}`);
});
