import { GroupNameUnspecifiedError } from "../src/internal/errors";
import AD = require("../src");
const sleep = require('util').promisify(setTimeout);
const config = require("./importConfig");

declare var test: any, expect: any, beforeAll: any, jest: any, afterEach: any;

let ad: AD;

beforeAll(async () => {
    jest.setTimeout(30000);

    try {
        ad = new AD(config).cache(false);
    } catch (e) {

    }
});

afterEach(async() => {
    await sleep(1);
});

test("group().add() should not throw", async () => {
    await ad
      .group()
      .add({
          name:        "Test Group 1",
          description: "This is test group 1."
      })
      .catch(err => {
          expect(err).not.toBeDefined();
      });
});


test("group().add() should return a group", async () => {
    await ad
      .group()
      .add({
          name:        "Test Group 2",
          location:    "",
          description: "This is test group 2."
      })
      .catch(err => {
          expect(err).not.toBeDefined();
      });
});

test("group(group).get() should find a single group by CN", async () => {
    let results = await ad.group("Test Group 2").get();

    expect(results.description).toBe("This is test group 2.");
});


test("group().getAll() should return all groups", async () => {
    try {
        let results = await ad.group().getAll();

        expect(results.length).toBeGreaterThan(1);
        expect(results.filter(r => r.cn === "Test Group 2").length).toBe(1);
    } catch (err) {
        expect(err).not.toBeDefined();
    }
});


test("group(group).get() should handle accept a suffix", async () => {
    let results = await ad.group("Test Group 2@" + config.domain).get();
    expect(results.description).toBe("This is test group 2.");
});


test("group(group).exists() should return true for a given group", async () => {
    expect(await ad.group("Test Group 2").exists()).toBe(true);
});


test("group(group).exists() should return false for a bs group", async () => {
    expect(await ad.group("susukino").exists()).toBe(false);
});

test("group(group).addUser(user) should add a user", async () => {
	await ad
		.group("ts-ad-testgroup")
		.addUser("ts-ad-jestuser")
		.catch(err => {
			expect(err).toBeUndefined();
		});
	let result    = await ad.user("ts-ad-jestuser").isMemberOf("ts-ad-testgroup");
	expect(result).toBe(true);
});

test("group(group).removeUser(user) should remove a user", async () => {
	await ad
		.group("ts-ad-testgroup")
		.removeUser("ts-ad-jestuser")
		.catch(err => {
			expect(err).toBeUndefined();
		});
	let result    = await ad.user("ts-ad-jestuser").isMemberOf("ts-ad-testgroup");
	expect(result).toBe(false);
});

test("group(group).remove() should remove the test groups.", async () => {
    try {
        let result = await ad.group("Test Group 1").remove();
        expect(result.success).toBe(true);
        let exists = await ad.group("Test Group 1").exists();
        expect(exists).toBe(false);
        await ad.group("Test Group 2").remove();
    } catch (err) {
        expect(err).not.toBeDefined();
    }
});

test("group().exists() should throw an error when no group name specified", async () => {
    try {
        await ad.group().exists();
    } catch (error) {
        expect(error).toBeInstanceOf(GroupNameUnspecifiedError);
    }
});

test("group().members() should throw an error when no group name specified", async () => {
    try {
        await ad.group().members();
    } catch (error) {
        expect(error).toBeInstanceOf(GroupNameUnspecifiedError);
    }
});

test("group().addUser() should throw an error when no group name specified", async () => {
    try {
        await ad.group().addUser('');
    } catch (error) {
        expect(error).toBeInstanceOf(GroupNameUnspecifiedError);
    }
});

test("group().removeUser() should throw an error when no group name specified", async () => {
    try {
        await ad.group().removeUser('');
    } catch (error) {
        expect(error).toBeInstanceOf(GroupNameUnspecifiedError);
    }
});

test("group().remove() should throw an error when no group name specified", async () => {
    try {
        await ad.group().remove();
    } catch (error) {
        expect(error).toBeInstanceOf(GroupNameUnspecifiedError);
    }
});