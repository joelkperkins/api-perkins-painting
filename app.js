const express = require('express');
const cors = require('cors');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const passport = require('passport');
const ClientJWTBearerStrategy = require('passport-oauth2-jwt-bearer').Strategy;
const { authenticate } = require('./auth/auth');
const { addUser, getUsers } = require('./controllers/user.controller');
const { addContract, getContractsForUser } = require('./controllers/contract.controller');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(awsServerlessExpressMiddleware.eventContext())

app.use(passport.initialize());

passport.use(new ClientJWTBearerStrategy(
  function(claimSetIss, done) {
    Clients.findOne({ clientId: claimSetIss }, function (err, client) {
      if (err) { return done(err); }
      if (!client) { return done(null, false); }
      return done(null, client);
    });
  }
));

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Ping!' });
 });

/**
 * @apiRoute GET /users
 *
 * @apiSuccess object[] Returns array of user objects
 */
app.get('/users', passport.authenticate(['oauth2-jwt-bearer'], { session: false }),
  (req, res) => {
    getUsers().then(data => {
      res.status(data.code || 501).json(data.payload || null);
    }, err => {
      res.status(err.code || 501).json(err.payload || null);
    });
  }
);

 /**
 * @apiRoute POST '/users' Creates a new user from body
 *
 * @apiBody {object} {id: string, email: string, phone: string, role: string, contracts: string[], createdAt: string, updatedAt:string }
 *
 * @apiSuccess {object} Confirmation of sent message, returns user info object
 */
app.post('/users', authenticate, async (req, res) => {
  addUser(req.body).then(data => {
    res.status(data.code || 501).json(data.payload || null);
  }, err => {
    res.status(err.code || 501).json(err.payload || null);
  });
});

/**
 * @apiRoute GET /contracts subscribed to by a user
 *
 * @apiSuccess object[] Returns array of contract objects
 */
app.get('/contracts', authenticate, (req, res) => {
  getContractsForUser(req.query).then(data => {
    res.status(data.code || 501).json(data.payload || 2);
  }, err => {
    res.status(err.code || 501).json(err || 1);
  });
});

 /**
 * @apiRoute POST '/users' Creates a new coontract from body
 *
 * @apiBody {object} {id: string, contract: string, builder: string, contact: string, email: string, phases: number , project: string, units: string[], createdAt: string, updatedAt:string }
 *
 * @apiSuccess {object} Confirmation of posted contract, returns contract object
 */
app.post('/contracts', authenticate, async (req, res) => {
  addContract(req.body).then(data => {
    res.status(data.code || 501).json(data.payload || null);
  }, err => {
    res.status(err.code || 501).json(err.payload || null);
  });
});

module.exports = app;
