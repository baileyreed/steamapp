/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/steam              ->  index
 * POST    /api/steam              ->  create
 * GET     /api/steam/:id          ->  show
 * PUT     /api/steam/:id          ->  update
 * DELETE  /api/steam/:id          ->  destroy
 */

'use strict';


var async = require('async');

var Client = require('node-rest-client').Client;

var client = new Client();

var _ = require('lodash');

var apiKey = "D93991D6DF3EA0044F99AFAA9FF9A45B";


export function news(req, res) {
  client.get("http://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=440&count=3&maxlength=300&format=json", function (data, response) {
    var news = _.get(data, 'appnews.newsitems', []);
    news = _.map(news, function(item) {
      return {
        'title': '<a href="' + item.url + '" target="_blank">' + item.title + '</a>',
        'description': item.contents
      }
    });
    res.json({rows: news});
  })
}

export function friends(req, res) {
  var profileId = req.user.steam.id;
  client.get("http://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=" + apiKey + "&steamid=" + profileId + "&relationship=friend", function (data, response) {
    var friendList = _.get(data, 'friendslist.friends', []);
    var steamIds = _.map(friendList, function(friend) {
      return friend.steamid;
    }).join(",");
    client.get("http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=" + apiKey + "&steamids=" + steamIds, function (data, response) {
      friendList = _.get(data, 'response.players', []);
      friendList = _.map(friendList, function(friend) {
        return {
          "avatar": '<a href="' + friend.profileurl + '" target="_blank"><img src="' + friend.avatarmedium + '" alt="profile picture" style="width:128;height:128;"></a>',
          "name": '<p>' + friend.personaname + '</p>'
        }
      });
      res.json({rows: friendList});
    })
  })
}

export function friendGames(req, res) {
  var profileId = req.user.steam.id;
  // get a list of friends' ids
  client.get("http://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=" + apiKey + "&steamid=" + profileId + "&relationship=friend", function (data, response) {
    var steamIds = _.get(data, 'friendslist.friends', []);
    steamIds = _.map(steamIds, function(friend) {
      return friend.steamid;
    }).join(",");

    // convert
    client.get("http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=" + apiKey + "&steamids=" + steamIds, function (data, response) {
      var friendList = _.get(data, 'response.players', []);

      // get self's owned games
      client.get("http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=" + apiKey + "&steamid=" + profileId + "&format=json&include_appinfo=1", function (data2, response) {
        // make additional object for self
        var me = {
          steamid: profileId,
          personaname: "<b>me</b>",
          games: []
        };
        // add games to self object
        me.games = _.get(data2, 'response.games', []);

        // call GetOwnedGames for each friend
        async.map(friendList, function (friend, done) {
          client.get("http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=" + apiKey + "&steamid=" + friend.steamid + "&format=json&include_appinfo=1", function (data3, response) {
            var gameList = _.get(data3, 'response.games', []);
            friend.games = gameList;
            //console.log(friend);
            done(null, friend);
          })
        }, function (err, people) {
          if (err) {
            return res.status(500).send("Unable to get friends' games");
          }
          people.push(me); // add self to friends array

          // transform game info
          people = _.map(people, function(person) {
            person.games = _.map(person.games, function(game) {
              return {
                "icon": '<a href="http://store.steampowered.com/app/' + game.appid + '/" target="_blank"><img src="https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/0d/' + game.img_icon_url + '.jpg" alt="game icon" ' +
                  'style="width:128;height:128;" onError="this.onerror=null;this.src=\'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb.jpg\';"></a>',
                "title": game.name,
                "hours_played": Math.round(game.playtime_forever / 0.6) / 100,
                "owner": person.personaname
              };
            })
            return person.games;
          });
          res.json({rows: people});
        })
      })
    })
  })
}


export function profile(req, res) {
  var profileId = req.user.steam.id;
  client.get("http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=" + apiKey + "&steamids=" + profileId, function (data, response) {
    var profiles = _.get(data, 'response.players', []);
    var myProfile = profiles[0];
    var modProfile = [{
      "" : '<div><a href="' + myProfile.profileurl + '" target="_blank"><img src="' + myProfile.avatarmedium + '" alt="profile picture" style="width:128;height:128;"></a><p>' + myProfile.personaname + '</p></div>'
    }];
    res.json({rows: modProfile});
  });
}
