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
var config = require('../../config/environment/index');

var apiKey = config.steam.apiKey;

/**
 * Returns recent playtimes for the user and friends in the following format:
 * [{game: "game1", "Jane": 1, "Bob": 2, "John": 3},
 * {game: "game2", "Jane": 5, "Bob": 10, "John": 3}]
 * @param req
 * @param res
 */
export function friendsGamesChart(req, res) {
  if (!req.user.steamId) { // if steam profile has not been added
    res.json("");
    return;
  }

  var profileId = req.user.steamId;

  // get a list of friends' ids
  client.get("http://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=" + apiKey + "&steamid=" + profileId + "&relationship=friend", function (data, response) {
    var steamIds = _.get(data, 'friendslist.friends', []);
    steamIds = _.map(steamIds, function (friend) {
      return friend.steamid;
    }).join(",");

    // convert ids to profile info
    client.get("http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=" + apiKey + "&steamids=" + steamIds, function (data, response) {
      var friendList = _.get(data, 'response.players', []);

      // get self's recently played games
      client.get("http://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=" + apiKey + "&steamid=" + profileId + "&format=json", function (data, response) {
        // make additional object for self
        var me = {
          steamid: profileId,
          personaname: "Me",
          games: []
        };
        // add games to self object
        me.games = _.get(data, 'response.games', []);

        // call GetRecentlyPlayedGames for each friend
        async.map(friendList, function (friend, done) {
          client.get("http://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=" + apiKey + "&steamid=" + friend.steamid + "&format=json", function (data, response) {
            var gameList = _.get(data, 'response.games', []);
            friend.games = gameList;
            done(null, friend);
          })
        }, function (err, people) {
          if (err) {
            return res.status(500).send("Unable to get friends' games");
          }
          people.push(me); // add self to friends array

          // convert list of people into list of games
          var games = _.flatten(_.map(people, function (person) {
            person.games = _.map(person.games, function (game) {
              var gameObject = {
                //TODO: this doesn't work for some reason
                //title: '<a href="http://store.steampowered.com/app/' + game.appid + '/" target="_blank">' + game.name + '</a>',
                title: game.name,
                personaName: person.personaname
              };
              gameObject.Me = 0;
              for (var i = 0; i < friendList.length; i++) {
                gameObject[friendList[i].personaname] = 0
              }
              gameObject[person.personaname] = Math.round(game.playtime_2weeks / 0.6) / 100;
              return gameObject;
            });
            return person.games;
          }));

          // sort by title
          games.sort(function (a, b) {
            return (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0);
          });

          // remove duplicates
          for (var i = 0; i < games.length - 1; i++) {
            while (games[i].title === games[i + 1].title) {
              var newName = games[i + 1].personaName;
              games[i][newName] = games[i + 1][newName];
              _.pullAt(games, i + 1);
            }
            games[i] = _.omit(games[i], 'personaName');
            games[i+1] = _.omit(games[i+1], 'personaName');
          }

          // create a first row with all people
          var firstRow = {};
          firstRow.Me = 0;
          for (var j = 0; j < friendList.length; j++) {
            firstRow[friendList[j].personaname] = 0
          }
          games.unshift(firstRow);
          res.json(games)

        })
      })
    });
  });
}


/**
 * Gets steamId from a vanity url, assuming steamId is already set to the vanity url
 * @param req
 * @param res
 */
export function getSteamId(req, res) {
  client.get("http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=" + apiKey + "&vanityurl=" + req.user.steamId, function (data, response) {
    data = _.get(data, 'response', {});
    if (data.success != 1) {
      res.json({'msg': 'Error: steamId not found'})
    } else {
      res.json({'steamId': data.steamId});
    }
  })
}

/**
 * Returns up to 20 most recent news items about the game the user owns
 * @param req
 * @param res
 */
export function news(req, res) {
  if (!req.user.steamId) { // if steam profile has not been added
    res.json({rows: [{"":"", " ":"", "  ": ""}]});
    return;
  }

  var profileId = req.user.steamId;
  client.get("http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=" + apiKey + "&steamid=" + profileId + "&format=json&include_appinfo=1", function (data, response) {
    var games = _.get(data, 'response.games', []);
    var newsItems = [];

    async.map(games, function (game, done) {
      client.get("http://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=" + game.appid + "&count=10&maxlength=300&format=json", function (data, response) {
        game.newsItems = _.get(data, 'appnews.newsitems', []);
        done(null, game);
      })
    }, function (err, games) {
      if (err) {
        return res.status(500).send("Unable to get friends' games");
      }

      newsItems = _.flatten(_.map(games, function(game) {
        return _.map(game.newsItems, function(item) {
          return {
            game: '<a href="http://store.steampowered.com/app/' + game.appid + '/" target="_blank"><img src="https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/0d/' + game.img_icon_url + '.jpg" alt="game icon" ' +
            'width="75" height="75" onError="this.onerror=null;this.src=\'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb.jpg\';"></a>',
            headline: '<a href="' + item.url + '" target="_blank">' + item.title + '</a>',
            contents: item.contents,
            date: item.date
          };
        });
      }));

      // sort by date then remove date field
      newsItems.sort(function(a,b) {return (a.date < b.date) ? 1 : ((b.date < a.date) ? -1 : 0);} );
      newsItems = _.map(newsItems, function(item) {
        return _.omit(item, 'date');
      });
      newsItems = newsItems.slice(0, 20); // limit number of news items to 20

      res.json({rows: newsItems});
    })
  })
}

/**
 * Return list of friends for a table
 * @param req
 * @param res
 */
export function friends(req, res) {
  if (!req.user.steamId) { // if steam profile has not been added
    res.json({rows: [{"":"", " ":""}]});
    return;
  }

  var profileId = req.user.steamId;
  client.get("http://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=" + apiKey + "&steamid=" + profileId + "&relationship=friend", function (data, response) {

    if (!data.friendslist) { // message for people who have their profile set to private
      res.json({rows: [
        {
          "Message":'<p>Looks like your friends list is private.</p><p><a href="https://steamcommunity.com/profiles/76561198202153900/edit/settings" target="_blank">Click here</a> to change your Profile Status to "Public," then refresh this page.</p>',
          "":""
        }
      ]});
      return;
    }
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

export function friendGamesTable(req, res) {
  if (!req.user.steamId) {
    res.json({rows: [{"": ""}]});
    return;
  }

    var profileId = req.user.steamId;

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
              });
              return person.games;
            });
            res.json({rows: people});
          })
        })
      })
    })
}


export function profile(req, res) {
  if (!req.user.steamId) { // if user has not added a steam id
    res.json({rows: [{"Message": "Please add a Steam profile."}]});
    return;
  }

  var profileId = req.user.steamId;

  client.get("http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=" + apiKey + "&steamids=" + profileId, function (data, response) {

    var profiles = _.get(data, 'response.players', []);

    if (!profiles) { // if user's steam id is invalid
      res.json({rows: [{"Message": "Oops, looks like your Steam ID is invalid. Try changing your Steam profile."}]});
      return;
    }

    var myProfile = profiles[0];

    client.get("http://api.steampowered.com/IPlayerService/GetSteamLevel/v1/?key=" + apiKey + "&steamid=" + profileId, function (data, response) {

      var steamLevel = _.get(data, 'response.player_level', 0);

      steamLevel = steamLevel ? steamLevel : "Err: steam level";

      var modProfile = [{
        "avatar" : '<a href="' + myProfile.profileurl + '" target="_blank"><img src="' + myProfile.avatarfull + '" alt="profile picture" width="110" height="110" style="font-family:Geneva"></a>',
        "persona" : '<h1>' + myProfile.personaname + '</h1><br><p>Level: ' + steamLevel + '</p>',
      }];

      res.json({rows: modProfile});

      });
    });
}
