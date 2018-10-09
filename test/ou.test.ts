import AD = require("../src");
const sleep = require('util').promisify(setTimeout);
const config = require("./importConfig");

declare var test: any, expect: any, beforeAll: any, jest: any, afterEach: any;

let ad: AD;

beforeAll(async () => {
    jest.setTimeout(30000);

	try {
        ad = new AD(config).cache(false);

		await ad.ou("Test OU 1").remove();
		await ad.ou("Test OU 2").remove();
	} catch (e) {
	}
});

afterEach(async() => {
    await sleep(1);
});

test("ou().add() should not throw", async () => {
	await ad
		.ou()
		.add({
			name:        "Test OU 1",
			description: "This is test OU 1."
		})
		.catch(err => {
			expect(err).not.toBeDefined();
		});
});

test("ou().add() should return an ou", async () => {
	try {
		await ad.ou().add({
			name:        "Test OU 2",
			location:    "OU=Test OU 1",
			description: "This is test OU 2."
		});
	} catch (err) {
		expect(err).not.toBeDefined();
	}
});

test("ou().getAll() should return all ous", async () => {
	try {
		let results = await ad.ou().getAll();
		expect(results.length).toBeGreaterThan(1);
		expect(
			results.filter(r => r.description === "This is test OU 2.").length
		).toBe(1);
	} catch (err) {
		expect(err).not.toBeDefined();
	}
});

test("ou(ou).get() should find a single ou by CN", async () => {
	let results = await ad.ou("Test OU 2").get();
	expect(results.description).toBe("This is test OU 2.");
});

test("ou(ou).exists() should return true for a given ou", async () => {
	expect(await ad.ou("Test OU 2").exists()).toBe(true);
});

test("ou(ou).exists() should return false for a bs ou", async () => {
	expect(await ad.ou("susukino").exists()).toBe(false);
});

test("ou(ou).remove() should remove the ou.", async () => {
	try {
		let result = await ad.ou("Test OU 2").remove();
		expect(result.success).toBe(true);
		let exists = await ad.ou("Test OU 2").exists();
		expect(exists).toBe(false);
		await ad.ou("Test OU 1").remove();
	} catch (err) {
		expect(err).not.toBeDefined();
	}
});
