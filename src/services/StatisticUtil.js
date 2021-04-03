import SnapshotUtil from "./SnapshotUtil";

export default class StatisticUtil {
  static getStatisticData(tickerSnapshots, range) {
    const tickerSnapshotEntries = Object.entries(tickerSnapshots);

    const isOverflow = tickerSnapshotEntries.length - range < 0;
    const rangedTickerSnapshots = {};
    tickerSnapshotEntries
      .slice(isOverflow ? 0 : tickerSnapshotEntries.length - range)
      .forEach(([date, tickerSnapshot]) => {
        rangedTickerSnapshots[date] = tickerSnapshot;
      });

    return Object.entries(
      SnapshotUtil.mergeTickerSnapshots(rangedTickerSnapshots)
    )
      .map(([ticker, count]) => ({ ticker, count }))
      .sort((a, b) => b.count - a.count);
  }
  static getPrevStatisticData(tickerSnapshots, range, statisticData) {
    const tickerSnapshotEntries = Object.entries(tickerSnapshots);

    const isOverflow = tickerSnapshotEntries.length - range * 2 < 0;
    const rangedTickerSnapshots = {};
    const tickerSnapshot = {};
    if (!isOverflow) {
      tickerSnapshotEntries
        .slice(
          tickerSnapshotEntries.length - range * 2,
          tickerSnapshotEntries.length - range
        )
        .forEach(([date, tickerSnapshot]) => {
          rangedTickerSnapshots[date] = tickerSnapshot;
        });

      Object.assign(
        tickerSnapshot,
        SnapshotUtil.mergeTickerSnapshots(rangedTickerSnapshots)
      );
    }
    return statisticData.map((datum) => {
      return {
        ticker: datum.ticker,
        count: isOverflow ? 0 : tickerSnapshot[datum.ticker],
      };
    });
  }
}
