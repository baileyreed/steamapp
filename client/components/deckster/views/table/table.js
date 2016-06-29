/**
 * Created by omezu on 5/6/15.
 */
;
(function (root, factory) {

  if (typeof define === 'function' && define.amd) {
    define(['jquery', 'deckster'], factory);
  } else {
    root.DecksterTableCard = factory(root.$ || root.jQuery, root.Deckster);
  }

}(window, function ($, Deckster) {
  Deckster.views = Deckster.views || {};
  var $tableElContainer;
  var viewIdSuffix = "-table";

  // View configuration for table
  Deckster.views.table = {
    getContentHtml: function (card, cb) {
      var currentView = card.currentSection;
      // Create an unique id that we can use for the table container
      card[currentView + 'TableId'] = card.options.id + currentView + viewIdSuffix;
      card[currentView + 'TablePaginationId'] = card.options.id + currentView + '-tablePagination';

      var viewOptions = card.options.getCurrentViewOptions(currentView);
      var numColumns = viewOptions.numColumns; //must be an even number if transpose is true

      var columns = _.fill(new Array(numColumns), '&nbsp;');
      var headerRow = '<tr><th>' + columns.join('</th><th>') + '</th></tr>';

      var tableContainerHtml =
        '<div class="table-responsive">' +
        '<table id="' + card[currentView + 'TableId'] + '">' +
        '<thead> ' + headerRow + '</thead> ' +
        '<tbody></tbody>' +
        '</table>';

      tableContainerHtml += '</div>';

      cb(tableContainerHtml);
    },

    // This function gets bound to the correct load callback
    // will either be summaryContentHtml or detailsContentHtml
    onLoad: function (card, section) {
      var viewOptions = card.options.getCurrentViewOptions(section);

      //Set card up for drilldown implementation
      if (card.options.getCurrentViewType(section) === "drilldownView") {
        var $drilldownEl = $('#' + card[section + "DrilldownViewId"]);
        this.getContentHtml(card, function (tableHtml) {
          $drilldownEl.append(tableHtml)
        });
      }

      var $tableEl = $('#' + card[section + 'TableId']);

      $tableElContainer = $tableEl.parents().eq(1);

      // If the table container exist initialize a table object
      if ($tableEl.length != 0) {

        card.options.loadData(card, function () {
          var cardOptions = card.options.getCurrentViewOptions(card.currentSection);

          card[section + 'Table'] = $tableEl.bootstrapTable({
            classes: "table table-hover" + (viewOptions.transpose ? " transposed" : ""),
            pagination: viewOptions.pagination || true,
            showHeader: viewOptions.transpose ? false : true,
            sidePagination: 'server',
            pageSize: viewOptions.transpose ? 1 : (viewOptions.pageSize || 10),
            pageList: viewOptions.transpose ? [] : [10, 25, 50, 100],
            height: $tableElContainer.height(),
            paginationVAlign: 'bottom',
            reorderableColumns: true,
            queryParamsType: 'limit',
            ajaxOptions: {
              url: viewOptions.apiUrl,
              method: 'GET'
            },
            ajax: function (request) {
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
                    row[key] = dataFormatter(value);
                  });
                  rows.push(row);
                });
              }

                //TODO fix this formatting
                if (result.rows.length === 0 && (!viewOptions.message || !viewOptions.showMessage(card))) {
                  rows.push(["No data to display"]);
                }

              card[section + 'Table'].data('bootstrap.table').initHeader();

              return {total: result.total, rows: rows};
            }
          });

          card[section + 'Table'].on('pre-body.bs.table', function (data) {
            card[section + 'Table'].data('bootstrap.table').initSort();
          });

          card[section + 'Table'].on('post-body.bs.table', function () {
            if (viewOptions.htmlTransform) {
              viewOptions.htmlTransform(card);
            }
          });
        });
      }
    },
    resize: function (card, section) {
      if (card[section + 'Table']) {
        card[section + 'Table'].bootstrapTable("resetView", {
          height: $tableElContainer.height()
        });
      }
    }
  };
}));
