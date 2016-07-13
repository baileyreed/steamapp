'use strict';

angular.module('steamAppApp', ['steamAppApp.auth', 'steamAppApp.admin', 'steamAppApp.constants',
    'ngCookies', 'ngResource', 'ngSanitize', 'ui.router', 'ui.bootstrap', 'validation.match', 'decksterjs'
  ])
  .config(function($urlRouterProvider, $locationProvider, $httpProvider) {

    $urlRouterProvider
      .otherwise('/');

    $locationProvider.html5Mode(true);
    $httpProvider.interceptors.push('authInterceptor');

  });

  // .run(function ($rootScope, $location, $uibModalStack, Auth, Highcharts, ThemeManager, grant, $q, $window) {
  //   $rootScope.GlobalConfig = window.GlobalConfig;
  //   ThemeManager.init();
  //
  //   // Redirect to login if route requires auth and you're not logged in
  //   $rootScope.$on('$stateChangeStart', function (event, next) {
  //     Auth.isLoggedInAsync(function(loggedIn) {
  //       if (next.authenticate && !loggedIn) {
  //         $window.location.href = '/auth/login/';
  //       }
  //     });
  //   });
  //
  //   $rootScope.$on('$stateChangeSuccess', function (event, next) {
  //     $uibModalStack.dismissAll();
  //   });
