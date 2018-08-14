'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var orderBy = require('lodash.orderby');
function prep(val) {
  return !isNaN(val) ? parseFloat(val) : String(val).toLowerCase();
}
module.exports.processResults = function(config, rows) {
  if (!config) {
    return rows;
  }
  if (!Array.isArray(rows)) {
    for (var key in rows) {
      if (Array.isArray(rows[key])) {
        rows[key] = module.exports.processResults(config, rows[key]);
      }
    }
    return rows;
  }
  var fields = config.fields,
    filter = config.filter,
    q = config.q,
    start = config.start,
    end = config.end,
    limit = config.limit,
    page = config.page,
    sort = config.sort,
    order = config.order;
  if (filter) {
    var _loop_1 = function(key) {
      var keyParts = String(key).split('_');
      var string = keyParts[0];
      var operator = keyParts[1];
      var value = prep(filter[key]);
      if (operator === 'gte') {
        rows = rows.filter(function(row) {
          return prep(row[string]) >= value;
        });
      } else if (operator === 'lte') {
        rows = rows.filter(function(row) {
          return prep(row[string]) <= value;
        });
      } else if (operator === 'gt') {
        rows = rows.filter(function(row) {
          return prep(row[string]) > value;
        });
      } else if (operator === 'lt') {
        rows = rows.filter(function(row) {
          return prep(row[string]) < value;
        });
      } else if (operator === 'ne') {
        rows = rows.filter(function(row) {
          return prep(row[string]) !== value;
        });
      } else if (operator === 'like') {
        rows = rows.filter(function(row) {
          return prep(row[string]).indexOf(value) > -1;
        });
      } else {
        rows = rows.filter(function(row) {
          return prep(row[string]) === value;
        });
      }
    };
    for (var key in filter) {
      _loop_1(key);
    }
  }
  if (q) {
    var str_1 = String(q).toLowerCase();
    rows = rows.filter(function(row) {
      var match = false;
      for (var item in row) {
        if (
          String(row[item])
            .toLowerCase()
            .indexOf(str_1) > -1
        ) {
          match = true;
        }
      }
      return match;
    });
  }
  if (fields) {
    rows = rows.map(function(row) {
      var out = {};
      fields.forEach(function(f) {
        out[f] = row[f];
      });
      return out;
    });
  }
  if (start && !limit) {
    rows = rows.slice(start - 1, end);
  } else if (end) {
    rows = rows.slice(0, end);
  } else if (page) {
    var l = limit || 10;
    var s = l * (page - 1);
    s = s < 0 ? 0 : s;
    rows = rows.slice(s, s + l);
  } else if (limit) {
    var begin = (start || 1) - 1;
    rows = rows.slice(begin, begin + limit);
  }
  if (sort && Array.isArray(order)) {
    rows = orderBy(
      rows,
      sort,
      order.map(function(o) {
        return String(o).toLowerCase();
      })
    );
  }
  rows = rows
    .map(function(n) {
      for (var key in n) {
        if (n[key] === undefined) {
          delete n[key];
        }
      }
      return n;
    })
    .filter(function(n) {
      return Object.keys(n).length > 0;
    });
  return rows;
};
//# sourceMappingURL=api.js.map
