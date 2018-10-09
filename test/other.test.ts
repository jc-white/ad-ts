declare var test: any, expect: any, beforeAll: any;

import AD = require("../src");

const config = require("./importConfig");

const ad = new AD(config).cache(false);

beforeAll(async () => {
    try {
        await ad.user().add({
            userName:   "ts-ad-test54",
            firstName:  "Test",
            commonName: "ts-ad-test54",
            lastName:   "54",
            pass:       "SuperWord4567!!!"
        });
    } catch (err) {
    }
});

test("other().get(opts) should return all non-user/group objects", async () => {
    try {
        let results = await ad.other().get();
        expect(results.length).toBeGreaterThan(1);
        expect(results.filter(r => r.sn === "54").length).toBe(0);
    } catch (err) {
        expect(err).not.toBeDefined();
    }
});

test("other().getAll(opts) should return all objects", async () => {
    try {
        let results = await ad.other().getAll();
        expect(results.users).toBeDefined();
        expect(results.groups).toBeDefined();
        expect(results.other).toBeDefined();
        expect(results.users.length).toBeGreaterThan(1);
        expect(results.groups.length).toBeGreaterThan(1);
        expect(results.other.length).toBeGreaterThan(1);
    } catch (err) {
        expect(err).not.toBeDefined();
    }
});

test("ad.find(opts) should return an arbitrary search.", async () => {
    try {
        let results = await ad.find("CN=ts-ad-test54");
        expect(results.users).toBeDefined();
        expect(results.groups).toBeDefined();
        expect(results.other).toBeDefined();
        expect(results.users.length).toBe(1);
    } catch (err) {
        expect(err).not.toBeDefined();
    }
});

test("caching should clear on timeout", async () => {
    try {
        ad._AD._cachedItems.users = {};

        let start       = Date.now();
        await ad.user("ts-ad-test54").get();
        expect(Date.now() - start).toBeGreaterThan(10);

        start = Date.now();
        await ad.user("ts-ad-test54").get();
        expect(Date.now() - start).toBeLessThan(10);

        ad.cacheTimeout(0);

        start = Date.now();
        await ad.user("ts-ad-test54").get();
        expect(Date.now() - start).toBeGreaterThan(10);

        ad.cacheTimeout(60000).cache(false);
        await ad.user("ts-ad-test54").get();
        expect(Date.now() - start).toBeGreaterThan(10);

        await ad.user("ts-ad-test54").remove();
    } catch (err) {
        expect(err).toBeUndefined();
    }
});
