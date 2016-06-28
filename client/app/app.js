'use strict';

angular.module('steamAppApp', ['steamAppApp.auth', 'steamAppApp.admin', 'steamAppApp.constants',
    'ngCookies', 'ngResource', 'ngSanitize', 'ui.router', 'ui.bootstrap', 'validation.match', 'decksterjs'
  ])
  .config(function($urlRouterProvider, $locationProvider) {
    $urlRouterProvider.otherwise('/');

    $locationProvider.html5Mode(true);

  });
