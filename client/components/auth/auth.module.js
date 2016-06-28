'use strict';

angular.module('steamAppApp.auth', ['steamAppApp.constants', 'steamAppApp.util', 'ngCookies',
    'ui.router'
  ])
  .config(function($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
  });
