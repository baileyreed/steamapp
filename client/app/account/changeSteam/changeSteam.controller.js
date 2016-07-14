/**
 * Created by breed on 7/7/16.
 */

'use strict';

class ChangeSteamController {

  constructor(Auth, $state, $http) {
    this.user = {};
    this.errors = {};
    this.Auth = Auth;
    this.$state = $state;
    this.submitted = false;
    this.$http = $http;
  }


  changeSteam(form) {
    this.submitted = true;
    var newThis = this;
    setTimeout(console.log(this.Auth.getCurrentUser()),10000000);

    if (form.$valid) {
      // if steamId field is blank, use steamUrl
      if (!this.user.steamId) {

        // change current user's steamId to steamUrl
        this.Auth.changeSteam(this.user.steamUrl)
          .then(() => {
            console.log("just changed it to the url");
            console.log(this.user.steamUrl);
            // good through here

            var foundSteamId = '';

            // get actual steamId using getSteamId method
            this.$http.get('/api/steam/getSteamId', {
              //params: filters
            }).then(function (response) {
              console.log("setting foundSteamId");
              console.log(response);
              console.log(response.data.steamId);
              foundSteamId = response.data.steamId ? response.data.steamId : '';

              console.log("found steam id pt 2");
              console.log(foundSteamId);

              // change steamId to actual steamId
              newThis.Auth.changeSteam(foundSteamId)
                .then(() => {
                  console.log("final id:");
                  console.log(newThis.Auth.getCurrentUser());
                  newThis.message = 'Steam profile successfully added.';
                  newThis.showReturn = true;

                  return {}

                })
                .catch(() => {
                  newThis.errors.other = 'Error occurred';
                  newThis.message = '';
                });
          })
          .catch(() => {
            this.errors.other = 'Error occurred';
            this.message = '';
          });



        });
        setTimeout(console.log(this.Auth.getCurrentUser()),10000000);

      } else { // if steamId is not blank
        this.Auth.changeSteam(this.user.steamId)
          .then(() => {
            this.message = 'Steam profile successfully added.';
            this.showReturn = true;
          })
          .catch(() => {
            this.errors.other = 'Error occurred';
            this.message = '';
          });
      }
    }
  }
}

angular.module('steamAppApp')
  .controller('ChangeSteamController', ChangeSteamController);
