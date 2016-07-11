/**
 * Created by breed on 7/7/16.
 */

'use strict';

class ChangeSteamController {

  constructor(Auth, $state) {
    this.user = {};
    this.errors = {};
    this.Auth = Auth;
    this.$state = $state;
    this.submitted = false;
  }


  changeSteam(form) {
    this.submitted = true;

    if (form.$valid) {
      if (!this.user.steamId) {
        this.Auth.changeSteam(this.user.steamUrl)
          .then(() => {
            console.log(this.user.steamUrl);
            //this.$apply();
          })
          .catch(() => {
            this.errors.other = 'Error occurred';
            this.message = '';
          });
        console.log("just changed it to the url");
        var obj = {
          ajaxOptions: {
            url: "/api/steam/getSteamId",
            method: 'GET'
          },
          ajax: function (request) {
            $.ajax(request);
          },
          responseHandler: function (result) {
            var foundSteamId = result.steamId ? result.steamId : "";

            this.Auth.changeSteam(foundSteamId)
              .then(() => {
                this.message = 'Steam profile successfully added.';
                this.showReturn = true;
                this.$apply();
              })
              .catch(() => {
                this.errors.other = 'Error occurred';
                this.message = '';
              });
            return {}
          }
        }
      } else {
        this.Auth.changeSteam(this.user.steamId)
          .then(() => {
            this.message = 'Steam profile successfully added.';
            this.showReturn = true;
            this.$apply();
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
