'use strict';

(function() {

  function UserResource($resource) {
    return $resource('/api/users/:id/:controller', {
      id: '@_id'
    }, {
      changePassword: {
        method: 'PUT',
        params: {
          controller: 'password'
        }
      },
      changeSteam: {
        method: 'PUT',
        params: {
          controller: 'steamId'
        }
      },
      get: {
        method: 'GET',
        params: {
          id: 'me'
        }
      }
    });
  }

  angular.module('steamAppApp.auth')
    .factory('User', UserResource);
})();
