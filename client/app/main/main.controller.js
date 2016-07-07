'use strict';

( function() {

  class MainController {

    constructor($http, $scope, $compile, $timeout, Auth, Card) {
      this.$http = $http;
      this.$compile = $compile;
      this.$timeout = $timeout;
      this.awesomeThings = [];
      this.isLoggedIn = Auth.isLoggedIn;
      this.isAdmin = Auth.isAdmin;
      this.getCurrentUser = Auth.getCurrentUser;

      this.initialized = false;
      this.deck = {
        rootUrl: '/deckster',
        //settings for gridster
        gridsterOpts: {
          max_cols: 4,
          widget_margins: [10, 10],
          widget_base_dimensions: ['auto', 250],
          responsive_breakpoint: 850
        }
      };

      // examples Of how you can fetch content for cards
      // var getSummaryTemplate = (cardConfig, cb) => {
      //   console.log("Summary");
      //   // Not using the cardConfig here but you could use it to make request
      //   this.$http.get('components/deckster/testSummaryCard.html').success(html => {
      //      cb && cb(this.$compile(html)($scope));
      //   });
      // }
      //
      // var getDetailsTemplate = (cardConfig, cb) => {
      //   console.log("Test");
      //   // Not using the cardConfig here but you could use it to make request
      //   this.$http.get('components/deckster/testDetailsCard.html').success(html => {
      //     cb && cb(this.$compile(html)($scope));
      //   });
      // }


      this.deck.cards = [
        new Card({
          title: 'Your Profile',
          id: 'photoCard',
          summaryViewType: "table",
          summaryViewOptions: {
            tooltipEnabled: true,
            tablePageSize: 12,
            pagination: false,
            columnBreakpoint: 5,
            numColumns: 1,
            apiUrl: "/api/steam/profile"
          },
          position: {
            size_x: 1,
            size_y: 1,
            col: 1,
            row: 1
          }

        }),
        new Card({
          title: "Friends' Games",
          id: 'alertsCard',
          summaryViewType: "table",
          summaryViewOptions: {
            tooltipEnabled: true,
            tablePageSize: 12,
            pagination: false,
            columnBreakpoint: 5,
            numColumns: 3,
            apiUrl: "/api/steam/friendGames",
            preDataTransform: function(card, data, callback) {
              var games = _.flatten(data);

              // sort by title
              games.sort(function(a,b) {return (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0);} );

              games = _.map(games, function(game) {
                return {
                  "icon": game.icon,
                  "title": game.title,
                  //"devTitle": game.title, // unformatted title
                  "owners": game.owner + " (" + game.hours_played + ")"
                };
              });

              for (var i = 0; i < games.length-1; i++) {
                while (games[i].title == games[i+1].title) {
                    games[i].owners += ", " + games[i+1].owners;
                    if(games[i+1].owners)
                    _.pullAt(games, i+1);
                }
              }
              for (var i = 0; i < games.length; i++) {
                games[i].title = ~games[i].owners.indexOf("<b>me</b>") ? '<b>' + games[i].title + '</b>' : games[i].title;
              }
              
              callback(games);
            }
          },
          position: {
            size_x: 2,
            size_y: 3,
            col: 3,
            row: 1
          }
        }),
        new Card({
          title: 'Team Fortress News',
          id: 'tableCard',
          summaryViewType: "table",
          summaryViewOptions: {
            tooltipEnabled: true,
            tablePageSize: 12,
            pagination: false,
            columnBreakpoint: 5,
            numColumns: 3,
            apiUrl: "/api/steam/news"
          },
          position: {
            size_x: 1,
            size_y: 2,
            col: 1,
            row: 2
          }
        }),
        new Card({
          title: 'My Friends',
          id: 'timelineCard',
          summaryViewType: "table",
          summaryViewOptions: {
            tooltipEnabled: true,
            tablePageSize: 12,
            pagination: false,
            columnBreakpoint: 5,
            numColumns: 2,
            noDataMessage: "Looks like you have no friends :(",
            apiUrl: "/api/steam/friends"
          },
          position: {
            size_x: 1,
            size_y: 3,
            col: 2,
            row: 1
          }
        }),
        // new Card({
        //   title: "Everyone's Games",
        //   id: 'mapCard',
        //   summaryViewType: "table",
        //   summaryViewOptions: {
        //     tooltipEnabled: true,
        //     tablePageSize: 12,
        //     pagination: false,
        //     columnBreakpoint: 5,
        //     numColumns: 3,
        //     noDataMessage: "Looks like you have no games :(",
        //     apiUrl: "/api/steam/myGames"
        //   },
        //   position: {
        //     size_x: 1,
        //     size_y: 2,
        //     col: 3,
        //     row: 1
        //   }
        // })
      ];

    }



    $onInit() {
      this.$http.get('/api/things')
        .then(response => {
          this.awesomeThings = response.data;
        });

      this.$timeout(() => {
        this.initialized = true
      });

    }

  }

  angular.module('steamAppApp')
    .component('main', {
      templateUrl: 'app/main/main.html',
      controller: MainController
    });
})();
