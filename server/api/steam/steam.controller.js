/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/steam              ->  index
 * POST    /api/steam              ->  create
 * GET     /api/steam/:id          ->  show
 * PUT     /api/steam/:id          ->  update
 * DELETE  /api/steam/:id          ->  destroy
 */

'use strict';


// class SteamController {
//   constructor(Auth) {
//     this.isLoggedIn = Auth.isLoggedIn;
//     this.getCurrentUser = Auth.getCurrentUser;
//   }
//   //console.log(this.getCurrentUser());
// }

var Client = require('node-rest-client').Client;

var client = new Client();

var _ = require('lodash');
//var $ = require('https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js');

var apiKey = "D93991D6DF3EA0044F99AFAA9FF9A45B";
var profileId = "76561198043286443";

//var User = require('../user/user.controller').default;

//var Auth = require('../../auth/auth.service');

//var Main = require('../../../client/app/main/main.controller');

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


export function myGames(req, res) {
  client.get("http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=" + apiKey + "&steamid=" + profileId + "&format=json&include_appinfo=1", function (data, response) {
    var gameList = _.get(data, 'response.games', []);
    gameList = _.map(gameList, function(game) {
      return {
        "name": game.name,
        "time played": game.playtime_forever / 60,
        "icon": '<img src="https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/0d/' + game.img_icon_url + '.jpg" alt="game icon" style="width:128;height:128;">'
      }
    });
    res.json({rows: gameList}); // pass profile info here
  })
}

export function profile(req, res, profileID) {
  // $.getScript("../../../client/app/main/main.controller.js", function() {
  //   console.log("loading script");
  // })

  function loadXMLDoc() {
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
        if (xmlhttp.status == 200) {
          console.log(xmlhttp.responseText);
        }
        else if (xmlhttp.status == 400) {
          alert('There was an error 400');
        }
        else {
          alert('something else other than 200 was returned');
        }
      }
    };

    xmlhttp.open("GET", "ajax_info.txt", true);
    xmlhttp.send();
  }


  client.get("http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=" + apiKey + "&steamids=" + profileId, function (data, response) {
    var profiles = _.get(data, 'response.players', []);
    var myProfile = profiles[0];
    var modProfile = [{
      "" : '<div><a href="' + myProfile.profileurl + '"><img src="' + myProfile.avatarmedium + '" alt="profile picture" style="width:128;height:128;"></a><p>' + myProfile.personaname + '</p></div>'
    }];
    res.json({rows: modProfile});
  });
}
