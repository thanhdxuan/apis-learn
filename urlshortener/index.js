require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const app = express();
const bodyParser = require('body-parser');
// Basic Configuration
const port = process.env.PORT || 3000;
const shorturl = new Map();
app.use(cors());
app.use('/', bodyParser.urlencoded());
function isValidHttpUrl(str) {
  const pattern = new RegExp(
    '^(https?:\\/\\/)' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$', // fragment locator
    'i'
  );
  return pattern.test(str);
}
app.post('/api/shorturl', function (req, res) {
  host_url = req.body.url;
  if (!isValidHttpUrl(host_url)) {
    return res.json({ error: "invalid url"});
  }
  //dns.lookup(host_url, (err, address, family) => {
  //  if (err) {
  //    return res.json({error: err.message});
  //  }
  //});
  if (shorturl.has(host_url) == false) {
    let sh_key = Math.floor(Math.random() * 10000 + 1); 
    shorturl.set(host_url, sh_key);
  }
  return res.json({ original_url: host_url, short_url: shorturl.get(host_url) });
});
app.get('/api/shorturl/:name', function (req, res) {
  name = req.params.name;
  console.log(shorturl);
  shorturl.forEach((key, value) => {
    console.log(key, value);
    if (key == name) {
     return res.redirect(value);
    }
  });
  return;
});
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
