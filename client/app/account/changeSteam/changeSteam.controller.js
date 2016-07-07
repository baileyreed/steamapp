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

angular.module('steamAppApp')
  .controller('ChangeSteamController', ChangeSteamController);
