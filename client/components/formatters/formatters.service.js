/**
 * Created by breed on 7/11/16.
 */

'use strict';

angular.module('steamAppApp')
  .factory('Formatters', function ($filter) {

    var Formatters = {};

    Formatters.dataFormatter = {
      'name': nameFormatter,
      'date': dateFormatter,
      'title': titleFormatter,
      'titleKeepSymbols': titleKeepSymbolsFormatter,
      'default': titleFormatter,
      'caps': capsFormatter,
      'capsNoCommas': capsNoCommasFormatter,
      'currency': currencyFormatter,
      'none': function(val) {return val;}
    };


    function capsFormatter(val) {
      return val.toUpperCase();
    }

    function capsNoCommasFormatter(val) {
      if (typeof val === 'string' || val instanceof String) {
        val = val.replace(',', '');
        return val.toUpperCase();
      }
      return val;
    }

    // Used to title-ize values
    function titleFormatter (val, unformat) {
      if(unformat) {
        return _.snakeCase(val);
      } else {
        return _.startCase(val);
      }
    }

    // Used to title-ize values without removing symbolic characters (other than _)
    function titleKeepSymbolsFormatter (val) {
      return _.map(_.words(val, /[^\s_]+/g), function(word){
        return _.capitalize(word);
      }).join(" ");
    }

    // Used to format name values
    function nameFormatter (val, unformat) {
      var parts;

      // If it is comma separated assume that its in the form lastname, firstname
      if (unformat){
        if (val && val.match(/\s/g)) {
          parts = val.split(' ');
          return (parts[1].trim() + ", " + parts[0].trim()).toLowerCase();
        } else {
          return val.toLowerCase();
        }
      } else if (val === true || val === false) {
        return val;
      } else {
        if (val && val.match(/.*,.*/g)) {
          parts = val.split(',');
          return _.startCase([parts[1].trim(), parts[0].trim()].join(' '));
        } else {
          return _.startCase(val);
        }
      }
    }

    function currencyFormatter(val, decimalPlaces) {
      if(_.isFinite(val)) {
        return $filter('currency')(val, '$', decimalPlaces || 0);
      } else {
        return val;
      }
    }

    // Used to format date values
    function dateFormatter (date, format) {
      return moment(new Date(date)).format(format);
    }

    return Formatters;

  });
