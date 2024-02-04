/* eslint-disable no-console */
require('dotenv').config();
const path = require('path');
const express = require('express');

const PORT = process.env.PORT || 3000;

const app = express();

app.use('/', express.static(path.join(__dirname, 'public')));

app.get('/api/hello-world', (req, res) => {
  res.json({ message: 'Hello World!' });
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
