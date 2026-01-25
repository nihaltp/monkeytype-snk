import { expect, test, mock, afterEach } from "bun:test";
import { getMonkeytypeUserContribution } from "../index";

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
});

test("getMonkeytypeUserContribution with profile endpoint", async () => {
  global.fetch = mock(() => Promise.resolve(new Response(JSON.stringify({
    data: {
      testActivity: {
        testsByDays: [0, 10, 20, 0, 5]
      }
    }
  })))) as unknown as typeof fetch;

  const cells = await getMonkeytypeUserContribution("user");
  expect(cells.length).toBe(5);
  expect(cells[1].count).toBe(10);
  // max is 20. 10/20 * 4 = 2.
  expect(cells[1].level).toBe(2);
  expect(cells[2].level).toBe(4);
});

test("getMonkeytypeUserContribution with apeKey", async () => {
  global.fetch = mock((url, init) => {
      // @ts-ignore
      if (url.toString().includes("currentTestActivity") && init?.headers?.["Authorization"] === "ApeKey key") {
           return Promise.resolve(new Response(JSON.stringify({
                data: {
                    testsByDays: [5, 5, 5]
                }
           })));
      }
      return Promise.resolve(new Response("{}"));
  }) as unknown as typeof fetch;

  const cells = await getMonkeytypeUserContribution("user", { apeKey: "key" });
  expect(cells.length).toBe(3);
  expect(cells[0].count).toBe(5);
  expect(cells[0].level).toBe(4);
});
