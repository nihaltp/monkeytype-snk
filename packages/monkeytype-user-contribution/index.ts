/**
 * get the contribution grid from a monkeytype user page
 *
 * @param userName monkeytype user name
 * @param options options containing apeKey
 *
 */
export const getMonkeytypeUserContribution = async (
  userName: string,
  options?: { apeKey?: string }
) => {
  let json: any;
  if (options?.apeKey) {
     const res = await fetch(`https://api.monkeytype.com/users/currentTestActivity`, {
         headers: {
             "Authorization": `ApeKey ${options.apeKey}`
         }
     });
     json = await res.json();
  } else {
     const res = await fetch(`https://api.monkeytype.com/users/${userName}/profile?isUid=false`);
     json = await res.json();
  }

  // monkeytype returns data for a long period, we only need the last year or so for the grid
  // 53 weeks * 7 days = 371

  // profile: data.testActivity.testsByDays
  // currentTestActivity: data.testsByDays
  const testsByDays: (number | null)[] = json.data?.testsByDays ?? json.data?.testActivity?.testsByDays ?? [];

  let rawDays = testsByDays.slice(-371);
  if (rawDays.length < 371) {
      const padding = new Array(371 - rawDays.length).fill(0);
      rawDays = [...padding, ...rawDays];
  }

  const maxTests = Math.max(...rawDays.map(d => d || 0), 1);
  const today = new Date();

  const cells = rawDays.map((count, index) => {
    const val = count || 0;
    let level = 0;
    if (val > 0) {
      level = Math.ceil((val / maxTests) * 4);
    }

    // Ensure the current day (last cell) always has a minimum level of 1
    // This ensures the snake has a target even if no activity occurred today
    if (index === rawDays.length - 1 && level === 0) {
      level = 1;
    }

    // Calculate date assuming the last element is today
    const diffDays = rawDays.length - 1 - index;
    const date = new Date(today);
    date.setDate(date.getDate() - diffDays);
    const dateStr = date.toISOString().split('T')[0];

    return {
      x: Math.floor(index / 7), // Column (Week)
      y: index % 7,             // Row (Day)
      count: val,
      level: level,             // Required by snk
      date: dateStr
    };
  });

  return cells;
};

export type Res = Awaited<ReturnType<typeof getMonkeytypeUserContribution>>;

export type Cell = Res[number];
