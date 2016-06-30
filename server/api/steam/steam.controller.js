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

var _ = require('lodash');


var apiKey = "D93991D6DF3EA0044F99AFAA9FF9A45B";
var profileId = "76561198202153900";

export function news(req, res) {
  client.get("http://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=440&count=3&maxlength=300&format=json", function (data, response) {
    var news = _.get(data, 'appnews.newsitems', []);
    news = _.map(news, function(item) {
      return {
        'title': '<a href="' + item.url + '">' + item.title + '</a>',
        'description': item.contents
      }
    });
    res.json({rows: news});
  })
}

export function friends(req, res) {
  client.get("http://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=" + apiKey + "&steamid=" + profileId + "&relationship=friend", function (data, response) {
    var friendList = _.get(data, 'friendslist.friends', []);
    var steamIds = _.map(friendList, function(friend) {
       return friend.steamid;
    }).join(",");
    client.get("http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=" + apiKey + "&steamids=" + steamIds, function (data, response) {
      friendList = _.get(data, 'response.players', []);
      friendList = _.map(friendList, function(friend) {
        return {
          "name": friend.personaname,
          "avatar": '<img src="' + friend.avatarmedium + '" alt="profile picture" style="width:128;height:128;">'
        }
      });
      res.json({rows: friendList});
    })
  })
}

//
// export function friendProfiles(req, res) {
//   client.get("http://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=" + apiKey + "&steamid=" + profileId + "&relationship=friend", function (data, response) {
//     var friendList = _.get(data, 'friendslist.friends', []);
//     var steamIds = _.map(friendList, function(friend) {
//       return friend.steamid;
//     }).join(",");
//
//     client.get("http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=" + apiKey + "&steamids=" + steamIds, function (data, response) {
//
//       friendList = _.get(data, 'response.players', []);
//       friendList = _.map(friendList, function(friend) {
//         console.log(friendList.length)
//         return {
//           "name": friend.personaname,
//           "avatar": '<img src="' + friend.avatarmedium + '" alt="profile picture" style="width:128;height:128;">'
//         }
//       });
//       res.json({rows: friendList}); // pass profile info here
//     })
//   })
// }

      //TODO: get profile pictures working
export function profile(req, res) {
  client.get("http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=" + apiKey + "&steamids=" + profileId, function (data, response) {
    var profile = _.get(data, 'response.players', []);
    var modProfile = [];
    modProfile[0] = {"Your profile":'<h3><a href="' + profile[0].profileurl + '">' + profile[0].personaname + '</h3>'};
    modProfile[1] = {"Your profile":'<img src="' + profile[0].avatarmedium + '" alt="profile picture" style="width:128;height:128;">'};
    res.json({rows: modProfile});
  });
}
