import { FindResult } from "../../node_modules/@types/activedirectory2/interfaces";
import { Dictionary, IProcessResultsConfig } from "../interfaces";
import { isEmptyObj } from "../internal/helpers";

const orderBy = require("lodash.orderby");

function prep(val: string): string
function prep(val: number): number
function prep(val: any) {
    return (!isNaN(val)) ? parseFloat(val) : String(val).toLowerCase();
}

function processResults<T>(config: IProcessResultsConfig | undefined, rows: FindResult): FindResult
function processResults<T>(config: IProcessResultsConfig | undefined, rows: Array<any>): T[]
function processResults<T>(config: IProcessResultsConfig | undefined, rows: any) {
    if (!config || isEmptyObj(config)) {
        return rows || null;
    }

    if (!Array.isArray(rows)) {
        for (const key in rows) {
            if (Array.isArray(rows[key])) {
                rows[key] = module.exports.processResults(config, rows[key]);
            }
        }

        return rows as FindResult;
    }

    const {
              fields,
              filter,
              q,
              start,
              end,
              limit,
              page,
              sort,
              order
          } = config;

    if (filter) {
        for (const key in filter) {
            const keyParts = String(key).split("_");
            const string   = keyParts[0];
            const operator = keyParts[1];

            const value = prep(filter[key]);
            if (operator === "gte") {
                rows = rows.filter((row: any) => prep(row[string]) >= value);
            } else if (operator === "lte") {
                rows = rows.filter((row: any) => prep(row[string]) <= value);
            } else if (operator === "gt") {
                rows = rows.filter((row: any) => prep(row[string]) > value);
            } else if (operator === "lt") {
                rows = rows.filter((row: any) => prep(row[string]) < value);
            } else if (operator === "ne") {
                rows = rows.filter((row: any) => prep(row[string]) !== value);
            } else if (operator === "like") {
                rows = rows.filter((row: any) => prep(row[string]).indexOf(value) > -1);
            } else {
                rows = rows.filter((row: any) => prep(row[string]) === value);
            }
        }
    }

    if (q) {
        const str = String(q).toLowerCase();
        rows      = rows.filter((row: Dictionary<any>) => {
            let match = false;
            for (const item in row) {
                if (typeof row[item] != "string" && typeof row[item] != "number") {
                    continue;
                }

                if (String(row[item]).toLowerCase().indexOf(str) > -1) {
                    match = true;
                }
            }
            return match;
        });
    }

    if (fields) {
        rows = rows.map((row: Dictionary<any>) => {
            const out: Dictionary<any> = {};

            fields.forEach(f => {
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
        const l = limit || 10;
        let s   = l * (page - 1);
        s       = s < 0 ? 0 : s;
        rows    = rows.slice(s, s + l);
    } else if (limit) {
        let begin = ((start || 1) - 1);
        rows      = rows.slice(begin, begin + limit);
    }

    if (sort && Array.isArray(order)) {
        rows = orderBy(rows, sort, order.map(o => String(o).toLowerCase()));
    }

    rows = rows.map((n: Dictionary<any>) => {
          for (const key in n) {
              if (n[key] === undefined) {
                  delete n[key];
              }
          }
          return n;
      })
      .filter((n: Dictionary<any>) => {
          return Object.keys(n).length > 0;
      });

    return rows as Array<T>;
}

export = processResults;