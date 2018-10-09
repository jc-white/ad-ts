import { IAddUserProps } from "../src/interfaces";
import { InvalidCredentialError } from "../src/internal/errors";
import AD = require("../src");
const sleep = require('util').promisify(setTimeout);
const config = require("./importConfig");

declare var test: any, expect: any, beforeAll: any, jest: any, afterEach: any;

let ad: AD;

beforeAll(async () => {
    jest.setTimeout(30000);

    try {
       ad = new AD(config).cache(false);

        await ad.group().add({
            name: "ts-ad-testgroup"
        });
    } catch (e) {

    }
});

afterEach(async() => {
    await sleep(1);
});

test("user().add() should not throw", async () => {
    let newUserProps: IAddUserProps = {
        userName:   "ts-ad-testuser1",
        firstName:  "ts-ad",
        lastName:   "testuser1",
        commonName: "ts-ad testuser1",
        title:      "foobar",
        pass:       "SuperWord4567!"
    };

    await ad
      .user()
      .add(newUserProps)
      .catch(err => {
          expect(err).not.toBeDefined();
      });
});


test("user().add() should return a user", async () => {
    await ad
      .user()
      .add({
          userName:   "ts-ad-testuser2",
          firstName:  "ts-ad",
          lastName:   "testuser2",
          commonName: "ts-ad testuser2",
          title:      "foobar",
          pass:       "SuperWord4567!"
      })
      .catch(err => {
          expect(err).not.toBeDefined();
      });
});

test("user().add({firstName, lastName}) should infer a commonName", async () => {
    try {
        await ad.user().add({
            userName:  "ts-ad-testuser3",
            firstName: "ts-ad",
            lastName:  "testuser3",
            pass:      "SuperWord4567!"
        });
        const user = await ad.user("ts-ad-testuser3").get();
        expect(user.cn.toLowerCase()).toBe("ts-ad testuser3");
    } catch (err) {
        expect(err).not.toBeDefined();
    }
});


test("user(user).authenticate(pass) should pass authentication.", async () => {
    try {
        let result = await ad.user("ts-ad-testuser1").authenticate("SuperWord4567!");
        expect(result).toBe(true);
    } catch (err) {
        expect(err).toBeUndefined();
    }
});

test("user(user).authenticate(badpass) should fail authentication.", async () => {
    try {
        await ad.user("ts-ad-testuser1").authenticate("jetlag!");
    } catch (err) {
        expect(err).toBeInstanceOf(InvalidCredentialError);
    }
});


test("user().getAll() should return all users", async () => {
    try {
        let results = await ad.user().getAll();

        expect(results.length).toBeGreaterThan(1);
        expect(results.filter(r => r.sAMAccountName === "ts-ad-testuser1").length).toBe(1);
    } catch (err) {
        expect(err).not.toBeDefined();
    }
});

test("user().getAll() should filter by field", async () => {
    let results = await ad.user().getAll({
        fields: ["givenName"]
    });

    expect(results.filter(r => r.sAMAccountName !== undefined).length).toBe(0);
    expect(results.filter(r => r.givenName !== undefined).length).toBeGreaterThan(0);
});

test("user().getAll() should sort", async () => {
    let results = await ad.user().getAll({
        sort:  ["cn"],
        order: ["desc"]
    });

    let idx51;
    let idx52;
    for (let i = 0; i < results.length; ++i) {
        if (results[i].cn === "ts-ad testuser2") {
            idx52 = i;
        }
        if (results[i].cn === "ts-ad testuser1") {
            idx51 = i;
        }
    }
    expect(idx51).not.toBeUndefined();
    expect(idx52).not.toBeUndefined();
    expect(idx52).toBeLessThan(idx51);
});

test("user().getAll() should full text search", async () => {
    let results = await ad.user().getAll({
        q: ["testuser"]
    });
    expect(results.length).toBe(3);
});

test("user().getAll() should filter values", async () => {
    let results = await ad.user().getAll({
        filter: {
            cn: "ts-ad testuser2"
        }
    });
    expect(results.length).toBe(1);
});

test("user(user).get() should find a single user by sAMAccountName", async () => {
    let results = await ad.user("ts-ad-testuser1").get();
    expect(results.sAMAccountName).toBe("ts-ad-testuser1");
});

test("user(user).get() should find a single user by userPrincipalName", async () => {
    let results = await ad.user("ts-ad-testuser1@" + config.domain).get();
    expect(results.sAMAccountName).toBe("ts-ad-testuser1");
});

test("user(user).get(opts) should take filter options", async () => {
    let results = await ad.user("ts-ad-testuser1").get({
        fields: ["givenName"]
    });
    expect(results.sAMAccountName).toBeUndefined();
    expect(results.givenName).not.toBeUndefined();
});

test("user(user).exists() should return true for a given user", async () => {
    expect(await ad.user("ts-ad-testuser1").exists()).toBe(true);
});

test("user(user).exists() should return false for a bs user", async () => {
    expect(await ad.user("dskfdslkfjekfjeidj").exists()).toBe(false);
});

test("user(user).addToGroup(group) should add a user", async () => {
    await ad
      .user("ts-ad-testuser1")
      .addToGroup("ts-ad-testgroup")
      .catch(err => {
          expect(err).toBeUndefined();
      });

    let result = await ad.user("ts-ad-testuser1").isMemberOf("ts-ad-testgroup");
    expect(result).toBe(true);
});

test("user(user).removeFromGroup(group) should remove a user from a group.", async () => {
    await ad
      .user("ts-ad-testuser1")
      .removeFromGroup("ts-ad-testgroup")
      .catch(err => {
          expect(err).toBeUndefined();
      });

    let result = await ad.user("ts-ad-testuser1").isMemberOf("ts-ad-testgroup");
    expect(result).toBe(false);
});

test("user(user).password(pass) should change a password.", async () => {
    try {
        await ad.user("ts-ad-testuser1").setPassword("iSunMonkey23!");
        let trueResult = await ad.user("ts-ad-testuser1").authenticate("iSunMonkey23!");
        expect(trueResult).toBe(true);
    } catch (err) {
        expect(err).toBeUndefined();
    }
});


test("user(user).password(pass) should throw on a missing password.", async () => {
    try {
        await ad.user("ts-ad-testuser1").setPassword("");
    } catch (err) {
        expect(err).toBeDefined();
    }
});

test("user(user).passwordNeverExpires() should not throw.", async () => {
    try {
        let result = await ad.user("ts-ad-testuser1").passwordNeverExpires();
        expect(result.success).toBe(true);
    } catch (err) {
        expect(err).not.toBeDefined();
    }
});

test("user(user).passwordExpires() should not throw.", async () => {
    try {
        let result = await ad.user("ts-ad-testuser1").passwordExpires();
        expect(result.success).toBe(true);
    } catch (err) {
        expect(err).not.toBeDefined();
    }
});

test("user(user).disable() should not throw.", async () => {
    try {
        let result = await ad.user("ts-ad-testuser1").disable();
        expect(result.success).toBe(true);
    } catch (err) {
        expect(err).not.toBeDefined();
    }
});

test("user(user).enable() should not throw.", async () => {
    try {
        let result = await ad.user("ts-ad-testuser1").enable();
        expect(result.success).toBe(true);
    } catch (err) {
        expect(err).not.toBeDefined();
    }
});

test("user(user).move() should move the user.", async () => {
    try {
        let result = await ad.user("ts-ad-testuser1").move("OU=TS-AD-TestOU");
        expect(result.success).toBe(true);
        let location = await ad.user("ts-ad-testuser1").getLocation();
        expect(location.split(",")[1]).toBe("OU=TS-AD-TestOU");
    } catch (err) {
        expect(err).not.toBeDefined();
    }
});

test("user(user).move() should handle an invalid user.", async () => {
    try {
        await ad.user("test52000").move("OU=TS-AD-TestOU");
    } catch (err) {
        expect(err).toBeDefined();
    }
});

test("user(user).unlock() should not throw.", async () => {
    try {
        let result = await ad.user("ts-ad-testuser1").unlock();
        expect(result.success).toBe(true);
    } catch (err) {
        expect(err).not.toBeDefined();
    }
});

test("user(user).update({}) should update a user", async () => {
    try {
        await ad.user("ts-ad-testuser1").update({
            firstName:  "tester",
            lastName:   "00",
            commonName: "Test User 00",
            title:      "foo-bar",
            pass:       "SuperTesto54!!!",
            userName:   "ts-ad-testuser00",
            enabled:    false
        });

        let exists = await ad.user("ts-ad-testuser00").exists();
        expect(exists).toBe(true);
    } catch (err) {
        expect(err).not.toBeDefined();
    }
});

test("user(user).remove() should remove the user.", async () => {
    try {
        let exists = await ad.user("ts-ad-testuser00").exists();

        if (exists === true) {
            await ad.user("ts-ad-testuser00").remove();
            exists = await ad.user("ts-ad-testuser00").exists();
        }

        expect(exists).toBe(false);
        await ad.user("ts-ad-testuser2").remove();
        await ad.user("ts-ad-testuser3").remove();
    } catch (err) {
        expect(err).not.toBeDefined();
    }
});