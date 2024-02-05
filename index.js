/* eslint-disable no-console */
require('dotenv').config();
const path = require('path');
const express = require('express');
const https = require('https');
const xml2js = require('xml2js');

const PORT = process.env.PORT || 3000;
const MAP = require('./map.json');

const fetch = (url) => new Promise((resolve, reject) => {
  https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      resolve(JSON.parse(data));
    });
  }).on('error', (err) => {
    reject(err);
  });
});

const app = express();

app.use('/', express.static(path.join(__dirname, 'public')));

app.get('/api/hello-world', (req, res) => {
  res.json({ message: 'Hello World!' });
});

app.get('/api/widget-data', (req, res) => {
  res.json({
    message: `Hello Widget! ${new Date().toISOString()}`,
  });
});

app.get('/api/alerts-image', async (req, res) => {
  try {
    const data = await fetch(`https://api.alerts.in.ua/v1/alerts/active.json?token=${process.env.ALERTS_API_TOKEN}`);
    // console.log(data);
    const map = {
      ...MAP,
      svg: {
        ...MAP.svg,
        g: {
          ...MAP.svg.g,
          path: MAP.svg.g.path.map((region) => {
            const alert = data.alerts.find((alertInstance) => alertInstance.location_uid === region.$['data-uid']);
            if (!alert) {
              return {
                ...region,
                $: {
                  ...region.$,
                  'data-oblast': '',
                },
              };
            }

            return {
              ...region,
              $: {
                ...region.$,
                'data-oblast': '',
                fill: '#ff6065',
              },
            };
          }),
        },
      },
    };
    const svg = new xml2js.Builder({ headless: true }).buildObject(map);
    // console.log(svg);
    const mapUrl = `data:image/svg+xml;base64,${Buffer.from(svg, 'binary').toString('base64')}`;
    // console.log(mapUrl);
    res.json({
      connected: true,
      mapUrl,
      message: `Map updated at ${new Date().toLocaleTimeString()}`,
    });
  } catch (e) {
    console.error(e);
    res.json({
      connected: false,
      message: e.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
