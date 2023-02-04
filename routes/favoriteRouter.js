const express = require('express');
const Favorite = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors,authenticate.verifyUser, (req, res, next) => {
    Favorite.find({user:req.user._id})
    .populate('user')
    .populate('campsites')
    .then(favorites => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user:req.user._id})
    .then(favorite => {
        if(favorite) {
            // looping over the array that we got on the req.body
            req.body.forEach(fav => {
                if(!favorite.campsites.includes(fav._id))
                // for each fav obj, we push the _id to the campsites field from the document
                favorite.campsites.push(fav._id)
            })
            favorite.save()
            .then((favorite) => {
                console.log('Favorite Created', favorite);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);

            })
            .catch(err => next(err)); 
        } else {
            Favorite.create({user:req.user._id, campsites:req.body}) 
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);

                })
                .catch(err => next(err)); 
            }
        })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorite');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({user:req.user._id})
    .then(favorite => {
        if(favorite) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
        } else {
            //res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain');
            res.end('You do not have any favorites to delete.');
        }
    })
    .catch(err => next(err));
});



//New Route parameter created for campsiteId endpoints
favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(`GET operation not supported on /favorites/${req.params.campsiteId}`);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    Favorite.findOne({user:req.user._id})
    .then(favorite => {
        if(favorite) {
            // See if the campsiteId passed in the URL is already in the user's list of favorites
            if(!favorite.campsites.includes(req.params.campsiteId)){
            favorite.campsites.push(req.params.campsiteId)// Add the campsiteId from the URL to the array of campsites
            favorite.save()
            .then((favorite) => {
                console.log('Favorite Created', favorite);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
            .catch(err => next(err)); 

            } else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/plain');
                res.end('That campsite is already in the list of favorites!')
            }
         
        } else {
            // This user does not have any favorites saved, so create a new favorites document
            // and add the campsiteId from the URL
            Favorite.create({user:req.user._id, campsites:req.params.campsiteId}) 
            .then((favorite) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);

            })
            .catch(err => next(err)); 
        }
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /favorites/${req.params.campsiteId}`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user:req.user._id})//Find hte users fav doc.
    .then(favorite => {
        const campsiteIndex = favorites.campsites.indexOf(req.params.campsiteId)//If campsiteId from the URL is present in users fav List
        if(campsiteIndex !== -1) {
            favorite.campsites.splice(campsiteIndex, 1) //Deletes the campsite from the list
            favorite.save()
            .then((favorite) => {
                console.log('Favorite Deleted', favorite);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
            .catch(err => next(err)); 
        
        } else {
            //res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain');
            res.end('You do not have any favorites to delete.');
        }
    })
    .catch(err => next(err));
})




module.exports = favoriteRouter;