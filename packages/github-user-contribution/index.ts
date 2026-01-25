/**
 * get the contribution grid from a github user page
 *
 * use options.from=YYYY-MM-DD options.to=YYYY-MM-DD to get the contribution grid for a specific time range
 * or year=2019 as an alias for from=2019-01-01 to=2019-12-31
 *
 * otherwise return use the time range from today minus one year to today ( as seen in github profile page )
 *
 * @param userName github user name
 * @param options
 *
 * @example
 *  getGithubUserContribution("platane", { from: "2019-01-01", to: "2019-12-31" })
 *  getGithubUserContribution("platane", { year: 2019 })
 *
 */
export const getGithubUserContribution = async (
  userName: string,
  o: { githubToken: string },
) => {
  const res = await fetch(`https://api.monkeytype.com/users/${userName}/profile?isUid=false`);
  const json = await res.json();
  const testsByDays: (number | null)[] = json.data?.testActivity?.testsByDays ?? [];
  const rawDays = testsByDays.slice(-371); 
  const maxTests = Math.max(...rawDays.map(d => d || 0), 1);
  const cells = rawDays.map((count, index) => {
    const val = count || 0;
    let level = 0;
    if (val > 0) {
      level = Math.ceil((val / maxTests) * 4);
    }

    return {
      x: Math.floor(index / 7), // Column (Week)
      y: index % 7,             // Row (Day)
      count: val,
      level: level,             // Required by snk
    };
  });

  return cells;
};

export type Res = Awaited<ReturnType<typeof getGithubUserContribution>>;

export type Cell = Res[number];
