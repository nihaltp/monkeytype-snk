import { expect, test, mock, afterEach } from "bun:test";
import { getMonkeytypeUserContribution } from "../index";

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
});

test("getMonkeytypeUserContribution with profile endpoint", async () => {
  global.fetch = mock(() =>
    Promise.resolve(
      new Response(
        JSON.stringify({
          data: {
            testActivity: {
              testsByDays: [0, 10, 20, 0, 5],
            },
          },
        }),
      ),
    ),
  ) as unknown as typeof fetch;

  const cells = await getMonkeytypeUserContribution("nihaltp");
  // It trims the array to start on Sunday.
  // Today is likely random, so length varies, but it should be <= 371
  expect(cells.length).toBeLessThanOrEqual(371);
  expect(cells[0].y).toBe(0); // Should always start on Sunday

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
    if (
      url.toString().includes("currentTestActivity") &&
      init?.headers?.["Authorization"] === "ApeKey key"
    ) {
      return Promise.resolve(
        new Response(
          JSON.stringify({
            data: {
              testsByDays: [5, 5, 5],
            },
          }),
        ),
      );
    }
    return Promise.resolve(new Response("{}"));
  }) as unknown as typeof fetch;

  const cells = await getMonkeytypeUserContribution("nihaltp", { apeKey: "key" });
  expect(cells.length).toBeLessThanOrEqual(371);
  expect(cells[0].y).toBe(0);

  const last3 = cells.slice(-3);
  expect(last3[0].count).toBe(5);
  expect(last3[0].level).toBe(4);
});

test("getMonkeytypeUserContribution coordinates align with days of week", async () => {
  // Mock Date to a fixed Wednesday (2024-05-15)
  // Wednesday is day 3 (Sun=0, Mon=1, Tue=2, Wed=3)
  const originalDate = global.Date;
  const originalFetch = global.fetch;

  // @ts-ignore
  global.Date = class extends originalDate {
    constructor(...args: any[]) {
      if (args.length) {
        // @ts-ignore
        super(...args);
      } else {
        // Use local date constructor to ensure getDay() is stable across timezones
        // 2024-05-15 (Month is 0-indexed, so 4 is May)
        // @ts-ignore
        super(2024, 4, 15, 0, 0, 0, 0);
      }
    }
  };

  global.fetch = mock(() =>
    Promise.resolve(
      new Response(
        JSON.stringify({
          data: {
            testActivity: {
              testsByDays: new Array(371).fill(1),
            },
          },
        }),
      ),
    ),
  ) as unknown as typeof fetch;

  try {
    const cells = await getMonkeytypeUserContribution("nihaltp");

    // The last cell corresponds to Today (Wed, y=3)
    const lastCell = cells[cells.length - 1];
    expect(lastCell.y).toBe(3);

    // The cell before that is Tue (y=2)
    const prevCell = cells[cells.length - 2];
    expect(prevCell.y).toBe(2);
    expect(prevCell.x).toBe(lastCell.x);

    // Let's check a cell that crosses the week boundary
    // Wednesday (3). Start date was Thu (4). Offset 4. Trim 3 days. Length 371 - 3 = 368.
    expect(cells.length).toBe(368);
    expect(cells[0].y).toBe(0); // Starts on Sunday

    // Sunday (0) (index 367-1-3 = 363) -> Same x
    const sundayCell = cells[cells.length - 1 - 3];
    expect(sundayCell.y).toBe(0);
    expect(sundayCell.x).toBe(lastCell.x);

    // Saturday (6) (index 367-1-4 = 362) -> Previous x
    const saturdayCell = cells[cells.length - 1 - 4];
    expect(saturdayCell.y).toBe(6);
    expect(saturdayCell.x).toBe(lastCell.x - 1);
  } finally {
    global.Date = originalDate;
    global.fetch = originalFetch;
  }
});
