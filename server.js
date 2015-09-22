var express = require('express')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var session = require('express-session')
var path = require('path')
var logger = require('morgan')
var request = require('request')
var fs = require('fs')
var hbsfy = require('hbsfy')
var cons = require('consolidate')

var app = express()

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())

app.use(express.static(path.join(__dirname, 'public')))

app.use(session({
  secret: 'odin',
  resave: false,
  saveUninitialized: false
}))

var passport = require('passport')

app.use(passport.initialize())
app.use(passport.session())

var InstagramStrategy = require('passport-instagram').Strategy
var token

passport.use(new InstagramStrategy({
    clientID: '6a25b788fade4e42978410f3d2827221',
    clientSecret: '8fdb2f57f26445a487daaed43e9f4e7e',
    callbackURL: "https://a2034b7c.ngrok.io/auth/instagram/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    token = accessToken
    done(null, profile)
  }
))

passport.deserializeUser(function(user, done) {
  done(null, user)
})
passport.serializeUser(function(user, done) {
  done(null, user)
})

app.get('/auth/instagram',
  passport.authenticate('instagram'))

app.get('/auth/instagram/callback', 
  passport.authenticate('instagram', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/photos')
  })
app.listen(8080, function () {
  console.log('server started!!!')
})
app.engine('hbs', cons.handlebars)
app.set('views', './views'); // specify the views directory
app.set('view engine', 'hbs'); // register the template engine
app.use('/photos', function(req, res, next) {
  if (req.isAuthenticated() && token) {
    request('https://api.instagram.com/v1/media/popular?access_token=' + token, function (error, response, body) {
      var photos = JSON.parse(body).data
      res.render('photos', { photos: photos })
      var photoArray = []
      photos.forEach(function (photo) {
        photoArray.push(photo.images.low_resolution.url)
      })
      fs.writeFile(Date.now() + '.txt', photoArray, function (err) {
        if (err) throw err
        console.log('It\'s saved!')
      })
    })
    console.log('authenticated')
  } else { 
    console.log('notauth')
  }
})
