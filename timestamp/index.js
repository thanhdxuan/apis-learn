// index.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

app.get("/api/:date?", function (req, res) {

  date = req.params.date;
  if (date === undefined) {
    date = new Date(Date.now());
    utcTime = date.toUTCString();
    res.json({unix: Date.now(), utc: utcTime});
    return;
  }
  if (!isNaN(date)) { //Check if string is a number
    date = date * 1; //Convert string to number
  }
  date = new Date(date);
  utcTime = date.toUTCString();
  unixTime = Date.parse(utcTime);
  if (!isNaN(date)) {
    res.json({unix: unixTime, utc: utcTime});
  }
  else {
    res.json({error: "Invalid Date"});
  }
});




// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
