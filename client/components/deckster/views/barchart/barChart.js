/**
 * Created by breed on 7/8/16.
 */

;(function (root, factory) {

  if (typeof define === 'function' && define.amd) {
    define(['jquery', 'deckster'], factory);
  } else {
    root.DecksterMapCard = factory(root.$ || root.jQuery, root.Deckster);
  }

}(this, function($, Deckster){
  Deckster.views = Deckster.views || {};

  var viewIdSuffix = "-bar-chart";
  var chartSuffix = "BarChart";
  var chartIdSuffix = chartSuffix + "Id";

  // View configuration for barChart
  Deckster.views.barChart = {
    getContentHtml: function (card, cb) {
      var currentView = card.currentSection;
      // Create an unique id that we can use for the chart container
      card[currentView + chartIdSuffix] = card.options.id + card.currentSection + viewIdSuffix;

      // Send back the html (chart container) for this view
      cb('<div id="' + card[currentView + chartIdSuffix] + '" style="height: 100%;"></div>');

      console.log("looking to get current view options");
    },

    init: function (card, section, options) {
      var $chartEl = $('#' + card[section + chartIdSuffix]);

      // If the chart container exist initialize a chart object
      if($chartEl.length != 0) {
        if (card[section + chartSuffix]) {
          card[section + chartSuffix].destroy();
          card[section + chartSuffix] = null;
        }

        // Create a new chart
        card[section + chartSuffix] = new Highcharts.Chart(options);
      }
    },

    // This function gets bound to the correct load callback
    // will either be summaryContentHtml or detailsContentHtml
    onLoad: function(card, section) {
      var viewOptions = card.options.getCurrentViewOptions(section);

      //Set card up for drilldown implementation
      if(card.options.getCurrentViewType(section) === "drilldownView") {
        var $drilldownEl = $('#' + card[section + "DrilldownViewId"]);
        this.getContentHtml(card, function(tableHtml) {
          $drilldownEl.append(tableHtml)
        })
      }

      var $chartEl = $('#' + card[section + chartIdSuffix]);

      // If the chart container exist initialize a chart object
      if($chartEl.length != 0) {
        card.options.loadData(card, function(series) {

          // Destroy previously created chart
          if (card[section + chartSuffix]) {
            card[section + chartSuffix].destroy();
            card[section + chartSuffix] = null;
          }

          // Groups series if defined
          if(viewOptions.stackedGroups) {
            _.forEach(series.series, function(series) {
              series.stack = series.name;
              var foundGroup = _.find(viewOptions.stackedGroups, {name: series.name});
              if(foundGroup) {
                series.stack = foundGroup.stack;
              }
            });
          }

          // Create a new chart
          Deckster.views.barChart.init(card, section, {
            chart: {
              type: 'bar',
              renderTo: card[section + chartIdSuffix],
              className: 'deckster-chart'
            },
            title: {
              text: null
            },
            subtitle: {
              text: viewOptions.subtitle || null
            },
            xAxis: {
              categories: series.categories || [],
              title: {
                text: viewOptions.xTitle || null
              },
              plotLines: viewOptions.xAxisPlotLines || [],
              labels: {
                formatter: function () {
                  if(viewOptions.xAxisFormatter) {
                    return viewOptions.xAxisFormatter.call(this, card);
                  } else {
                    return this.value;
                  }
                }
              }
            },
            yAxis: {
              title: {
                text: viewOptions.yTitle || null
              },
              plotLines: viewOptions.yAxisPlotLines || [],
              labels: {
                formatter: (viewOptions.yAxisFormatter && viewOptions.yAxisFormatter.bind(card)) || function() { return this.value }
              }
            },
            tooltip: {
              enabled: !_.isUndefined(viewOptions.tooltipEnabled) ? viewOptions.tooltipEnabled : true,
              useHTML: !_.isUndefined(viewOptions.tooltipFormatter),
              formatter: viewOptions.tooltipFormatter || undefined
            },
            plotOptions: {
              series: {
                stacking: viewOptions.columnStacking || null, //null, normal, or percent
                cursor: 'pointer',
                point: {
                  events: {
                    click: function () {
                      if(viewOptions.onBarClick) {
                        viewOptions.onBarClick(card, this);
                      }
                    }
                  }
                }
              }
            },
            legend: {
              enabled: !_.isUndefined(viewOptions.legendEnabled) ? viewOptions.legendEnabled : true,
              layout: 'horizontal',
              align: 'center',
              verticalAlign: 'bottom'
            },
            credits: {
              enabled: false
            },
            ajaxOptions: {
              url: viewOptions.apiURl,
              method: 'GET'
            },
            ajax: function(request) {
              $.ajax(request);
            },
            responseHandler: function (result) {

              if(cardOptions.preDataTransform) {
                cardOptions.preDataTransform(card, result.rows, function(rows) {
                  result.rows = rows;
                });
              }

              if (viewOptions.message && viewOptions.showMessage(card)) {
                result.rows = [];
                card.showMessage(viewOptions.message);
              } else {
                card.hideMessage();
              }

              var getFormatter = function(path, defaultFormat) {
                return card.options.getDataFormatter(_.get(viewOptions, path, defaultFormat));
              };

              var headers = this.columns[0];
              var keys = _.keys(result.rows[0]);
              var rows = [];
              var titleFormatter = getFormatter('dataTransform.titleFormats.series', 'titleKeepSymbols');


              // TODO: support hiddenColumns in the transpose format
              if (viewOptions.transpose) {
                _.each(result.rows, function (values) {
                  var i = 0;
                  var col = 0;
                  var length = _.keys(values).length;
                  _.each(values, function (value, key) {
                    var dataFormatter = getFormatter(['dataFormats', key], 'titleKeepSymbols');
                    var row = _.get(rows, i, []);

                    row[col] = titleFormatter(key);
                    row[col + 1] = dataFormatter(value);

                    rows[i++] = row;

                    if(i >= length / (viewOptions.numColumns / 2)) {
                      i = 0;
                      col += 2;
                    }
                  });
                });
              } else {

                _.forEach(viewOptions.hiddenColumns, function (hiddenCol) {
                  _.pull(keys, hiddenCol);
                });

                _.each(keys, function (header, key) {
                  headers[key].field = header;
                  headers[key].title = titleFormatter(header);
                  headers[key].sortable = viewOptions.transpose ? false : true;
                });

                _.each(result.rows, function (values) {
                  var row = [];
                  _.each(values, function (value, key) {
                    var dataFormatter = getFormatter(['dataFormats', key], 'titleKeepSymbols');
                    //row[key] = dataFormatter(value); // makes avatars all weird and formats text
                    row[key] = value;
                  });
                  rows.push(row);
                });
              }

              //TODO fix this formatting
              if (result.rows.length === 0 && (!viewOptions.message || !viewOptions.showMessage(card))) {
                rows.push([viewOptions.noDataMessage]);
              }

              card[section + 'Table'].data('bootstrap.table').initHeader();

              return {total: result.total, rows: rows};
            },
            series: series.series || [] // This is the data passed in by the loadData function
          });
        });
      }
    },
    resize: function(card, section) {
      var chart = card[section + chartSuffix];
      if(chart) {
        chart.reflow();
      }
    },
    reload: function (card, section) {
      var chart = card[section + chartSuffix];

      if (chart) {
        var options = chart.userOptions;

        chart.destroy();
        card[section + chartSuffix] = null;
        Deckster.views.barChart.init(card, section, options);
      }
    }
  };
}));
