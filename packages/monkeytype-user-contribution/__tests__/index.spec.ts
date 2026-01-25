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
  expect(cells.length).toBe(371); // Should be padded

  // Last 5 elements should match input
  const last5 = cells.slice(-5);
  expect(last5[1].count).toBe(10);
  expect(last5[1].level).toBe(2);
  expect(last5[2].level).toBe(4);

  // First element should be 0 (padded)
  expect(cells[0].count).toBe(0);
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
  expect(cells.length).toBe(371);
  const last3 = cells.slice(-3);
  expect(last3[0].count).toBe(5);
  expect(last3[0].level).toBe(4);
});
