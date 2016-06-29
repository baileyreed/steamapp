/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/steam              ->  index
 * POST    /api/steam              ->  create
 * GET     /api/steam/:id          ->  show
 * PUT     /api/steam/:id          ->  update
 * DELETE  /api/steam/:id          ->  destroy
 */

'use strict';

var Client = require('node-rest-client').Client;

var client = new Client();

//edit in here
//
var _ = require('lodash');

// function respondWithResult(res, statusCode) {
//   statusCode = statusCode || 200;
//   return function(entity) {
//     if (entity) {
//       res.status(statusCode).json(entity);
//     }
//   };
// }
//
// function saveUpdates(updates) {
//   return function(entity) {
//     var updated = _.merge(entity, updates);
//     return updated.save()
//       .then(updated => {
//         return updated;
//       });
//   };
// }
//
// function removeEntity(res) {
//   return function(entity) {
//     if (entity) {
//       return entity.remove()
//         .then(() => {
//           res.status(204).end();
//         });
//     }
//   };
// }
//
// function handleEntityNotFound(res) {
//   return function(entity) {
//     if (!entity) {
//       res.status(404).end();
//       return null;
//     }
//     return entity;
//   };
// }
//
// function handleError(res, statusCode) {
//   statusCode = statusCode || 500;
//   return function(err) {
//     res.status(statusCode).send(err);
//   };
// }
//
export function news(req, res) {
  client.get("http://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=440&count=3&maxlength=300&format=json", function (data, response) {
    console.log(data);
    //console.log(response);
    var news = _.get(data, 'appnews.newsitems', []);
    news = _.map(news, function(item) {
      return {
        'title': '<a href="' + item.url + '">' + item.title + '</a>',
        'description':item.contents
      }
    });
    res.json({rows: news});
  })
}


//
// // Gets a list of Steams
// export function index(req, res) {
//   return Steam.find().exec()
//     .then(respondWithResult(res))
//     .catch(handleError(res));
// }
//
// // Gets a single Steam from the DB
// export function show(req, res) {
//   return Steam.findById(req.params.id).exec()
//     .then(handleEntityNotFound(res))
//     .then(respondWithResult(res))
//     .catch(handleError(res));
// }
//
// // Creates a new Steam in the DB
// export function create(req, res) {
//   return Steam.create(req.body)
//     .then(respondWithResult(res, 201))
//     .catch(handleError(res));
// }
//
// // Updates an existing Steam in the DB
// export function update(req, res) {
//   if (req.body._id) {
//     delete req.body._id;
//   }
//   return Steam.findById(req.params.id).exec()
//     .then(handleEntityNotFound(res))
//     .then(saveUpdates(req.body))
//     .then(respondWithResult(res))
//     .catch(handleError(res));
// }
//
// // Deletes a Steam from the DB
// export function destroy(req, res) {
//   return Steam.findById(req.params.id).exec()
//     .then(handleEntityNotFound(res))
//     .then(removeEntity(res))
//     .catch(handleError(res));
// }
