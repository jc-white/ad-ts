import processResults = require("../src/util/processResults");
import { wrapAsync } from "../src/util/wrapAsync";

declare var test: any, expect: any;

interface Animal {
    id: number,
    animal: string,
    chuck: number
}

const rowset: Animal[] = [
    { id: 1, animal: "woodchuck", chuck: 500 },
    { id: 2, animal: "horse", chuck: 20 },
    { id: 3, animal: "duck", chuck: 200 },
    { id: 4, animal: "duck", chuck: 210 },
    { id: 5, animal: "zebra", chuck: 1 }
];

test("api().processResults() should return only certain fields", () => {
    let result = processResults<Animal>({
        fields: ["id", "chuck"]
    }, rowset);
    expect(result.length).toBe(5);
    expect(result[0].id).toBeDefined();
    expect(result[0].chuck).toBeDefined();
    expect(result[0].animal).toBeUndefined();
});

test("api().processResults() should filter by fields", () => {
    let result = processResults<Animal>({
        filter: {
            "animal": "duck",
            "chuck":  200
        }
    }, rowset);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe(3);
});

test("api().processResults() filter _gte ", () => {
    let result = processResults<Animal>({
        filter: { "chuck_gte": 200 }
    }, rowset);
    expect(result.length).toBe(3);
});

test("api().processResults() filter _lte ", () => {
    let result = processResults<Animal>({
        filter: { "chuck_lte": 20 }
    }, rowset);
    expect(result.length).toBe(2);
});

test("api().processResults() filter _gt ", () => {
    let result = processResults({
        filter: { "chuck_gt": 20 }
    }, rowset);
    expect(result.length).toBe(3);
});

test("api().processResults() filter _lt ", () => {
    let result = processResults<Animal>({
        filter: { "chuck_lt": 20 }
    }, rowset);
    expect(result.length).toBe(1);
});

test("api().processResults() filter _ne ", () => {
    let result = processResults<Animal>({
        filter: { "chuck_ne": 20 }
    }, rowset);
    expect(result.length).toBe(4);
});

test("api().processResults() filter _like ", () => {
    let result = processResults<Animal>({
        filter: { "animal_like": "u" }
    }, rowset);
    expect(result.length).toBe(3);
});

test("api().processResults() should do a full text search", () => {
    let result = processResults<Animal>({
        q: ["u"]
    }, rowset);
    expect(result.length).toBe(3);
});

test("api().processResults() should handle start and end", () => {
    let result = processResults<Animal>({
        start:  2,
        end:    3,
        fields: ["id"]
    }, rowset).map(obj => obj.id).join("");
    expect(result).toBe("23");
});

test("api().processResults() should handle end", () => {
    let result = processResults<Animal>({
        end:    3,
        fields: ["id"]
    }, rowset).map(obj => obj.id).join("");
    expect(result).toBe("123");
});

test("api().processResults() should handle start and limit", () => {
    let result = processResults<Animal>({
        start:  2,
        limit:  3,
        fields: ["id"]
    }, rowset).map(obj => obj.id).join("");
    expect(result).toBe("234");
});

test("api().processResults() should handle page and limit", () => {
    let result = processResults<Animal>({
        page:   3,
        limit:  2,
        fields: ["id"]
    }, rowset).map(obj => obj.id).join("");
    expect(result).toBe("5");
});

test("api().processResults() should handle sort", () => {
    let result = processResults<Animal>({
        sort:   ["id"],
        order:  ["desc"],
        fields: ["id"]
    }, rowset).map(obj => obj.id).join("");
    expect(result).toBe("54321");
});

test("wrapAsync should handle success", async () => {
    const prom          = new Promise((resolve, reject) => {
        resolve("fantastic everything");
    });
    const [error, data] = await wrapAsync(prom);
    expect(data).toBeDefined();
    expect(error).toBeUndefined();
});

test("wrapAsync should handle rejects", async () => {
    const prom          = new Promise((resolve, reject) => {
        reject("fudge everything");
    });
    const [error, data] = await wrapAsync(prom);
    expect(error).toBeDefined();
    expect(data).toBeUndefined();
});