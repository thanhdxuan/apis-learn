const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser');
const mongoose = require('mongoose');


//--------------------------------------


const URI = process.env.MONGO_URI;

let User;

mongoose.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true });

const { Schema } = mongoose;

const userSchema = new Schema({
  username: String,
  count: Number,
  log: [Object]
});

const exerciseSchema = {
  description: String,
  duration: Number,
  date: String
};


User = mongoose.model('User', userSchema);

const createAndSaveUser = (username, done) => {
  let user = User({ username: username, count: 0, log: []});
  return user.save(function(err, data) {
    if (err) return done(err);
    return done(null, data);
  });
};

const getAllUser = (done) => {
  User.find().select('username _id __v').exec((err, listuser) => {
    if (err) return done(err);
    done(null, listuser);
  });
}

const getLogById = (userId, done) => {
  User.find({_id: userId}, function(err, data) {
    if (err) return done(err);
    done(null, data);
  });
};


const addExerciseById = (userId, oExercise, done) => {
  User.findById(userId, function(err, data) {
    if (err) return done(err);
    data.log.push(oExercise);
    data.count = data.log.length;
    data.save();
    done(null, data);
  });
};


//--------------------------------------








app.use(cors());
app.use('/', bodyParser.urlencoded({extend: false}));
app.post('/api/users', function(req, res, next) {
  username = req.body.username;
  createAndSaveUser(username, (err, data) => {
    if (err) return next(err);
    User.findById(data._id).select('username _id').exec((err, pers) => {
      if (err) return next(err);
      res.json(pers);
    });
  });
});

//app.use('/', bodyParser.urlencoded({extend: false}));
app.post('/api/users/:userId/exercises', function(req, res, next) {
  userId = req.params.userId;
  date = req.body.date;
  if (!isNaN(date)) {
    date = date * 1;
  }
  if (date === undefined || date == 0) {
    date = Date.now();
    date = new Date(date);
  }
  else {
    date = new Date(date);
  }
  exercise = {
    description: req.body.description,
    duration: parseInt(req.body.duration),
    date: date.toDateString()
  }
  addExerciseById(userId, exercise, (err, data) => {
    if (err) return next(err);
    res.json({
      _id: data._id,
      username: data.username,
      date: exercise.date,
      duration: parseInt(exercise.duration),
      description: exercise.description
    });
  });
});

app.get('/api/users', function(req, res, next) {
  getAllUser((err, data) => {
    if (err) return next(err);
    res.json(data);
  });
});

// GET /api/users/:_id/logs?[from][&to][&limit]
app.get('/api/users/:_id/logs', function(req, res, next) {
  userId = req.params._id;
  
  User.findById({ _id: userId })
    .select('_id username count log')
    .exec((err, data) => {
        let result = data.log;
        from = req.query.from;
        timestamp_left = Date.parse(from);
        to = req.query.to;
        timestamp_right = Date.parse(to);
        limit = req.query.limit ? req.query.limit : 0;
        console.log(from, to, limit);
        if (!isNaN(timestamp_left)) {
          result = result.filter((log) => {
            log_date = new Date(log.date);
            return log_date > timestamp_left && log_date < timestamp_right;
          });
        }

        if (!isNaN(limit) && limit != 0) {
          limit = limit * 1;
          while (result.length > limit) {
            result.pop();
          }
        }
        res.json({
          _id: data._id,
          username: data.username,
          from: from,
          to: to,
          count: result.length,
          log: result
        });
    });
});

app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});





const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
