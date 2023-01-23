var express = require('express');
const session = require('express-session');
const user = require('../models/user');
const User = require('../models/user');

var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/signup',(req,res,next)=>{
  User.findOne({username:req.body.username})
  .then(user=>{
    if(user){
      const err = new Error(`Username ${req.body.username} already exists.`);
      err.status = 403;
      return next(err);
    }else{
      User.create({
        username:req.body.username,
        password:req.body.password
      })
      .then(user=>{
        res.status = 200;
        res.setHeader('Contetn-Type','application/json');
        res.json({status:'Registration Successful',user:user});
      })
      .catch(err => next(err));
    }
    
  })
  .catch(err=>next(err));
});

router.post('/login',(req,res,next)=>{
  if(!req.session.user){
    const authHeader = req.headers.authorization;
        if (!authHeader) {
            const err = new Error('You are not authenticated!');
            res.setHeader('WWW-Authenticate', 'Basic');
            err.status = 401;
            return next(err);
        }
  
        const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
        const username = auth[0];
        const password = auth[1];
        
        User.findOne({username:username})
        .then(user=>{
          if(!user){
            const err = new Error(`Username ${req.body.username} does not exist.`);
            err.status = 401;
            return next(err);
          }else if (!user.password === password){
            res.status = 401;
            const err = new Error(`Your password is incorrect`);
            return next(err)
          } else if(user.username === username && user.password === password){
            req.session.user = 'authenticated';
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain');
            res.end('You are authenticated!')

          }
        })
        .catch(err=>next(err));
  }else{
    res.status = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('You are already authenticated');
  }
});

router.get('/logout', (req, res, next) => {
  if (req.session) {
      req.session.destroy();
      res.clearCookie('session-id');
      res.redirect('/');
  } else {
      const err = new Error('You are not logged in!');
      err.status = 401;
      return next(err);
  }
});

module.exports = router;
