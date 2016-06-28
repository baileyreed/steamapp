'use strict';

(function() {

  class MainController {

    constructor($http, $scope, $compile, $timeout, Auth) {
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
      var getSummaryTemplate = (cardConfig, cb) => {
        console.log("Summary");
        // Not using the cardConfig here but you could use it to make request
        this.$http.get('components/deckster/testSummaryCard.html').success(html => {
           cb && cb(this.$compile(html)($scope));
        });
      }

      var getDetailsTemplate = (cardConfig, cb) => {
        console.log("Test");
        // Not using the cardConfig here but you could use it to make request
        this.$http.get('components/deckster/testDetailsCard.html').success(html => {
          cb && cb(this.$compile(html)($scope));
        });
      }

      'use strict';


      this.deck.cards = [
        {
          title: 'Photos',
          id: 'photoCard',
          hasPopout: true,
          summaryContentHtml: getSummaryTemplate,
          detailsContentHtml: getDetailsTemplate,
          position: {
            size_x: 1,
            size_y: 1,
            col: 1,
            row: 1
          }
        },
        {
          title: 'Alerts',
          id: 'alertsCard',
          summaryContentHtml: getSummaryTemplate,
          detailsContentHtml: getDetailsTemplate,
          position: {
            size_x: 1,
            size_y: 2,
            col: 4,
            row: 1
          }
        },
        {
          title: 'Geospatial',
          id: 'mapCard',
          summaryContentHtml: getSummaryTemplate,
          detailsContentHtml: getDetailsTemplate,
          position: {
            size_x: 2,
            size_y: 2,
            col: 2,
            row: 1
          }
        },
        {
          title: 'Table Data',
          id: 'tableCard',
          summaryContentHtml: getSummaryTemplate,
          detailsContentHtml: getDetailsTemplate,
          position: {
            size_x: 1,
            size_y: 2,
            col: 1,
            row: 2
          }
        },
        {
          title: 'Timeline',
          id: 'timelineCard',
          summaryContentHtml: getSummaryTemplate,
          detailsContentHtml: getDetailsTemplate,
          position: {
            size_x: 3,
            size_y: 1,
            col: 2,
            row: 3
          }
        }
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
