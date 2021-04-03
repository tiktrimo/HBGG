export default class SnapshotUtil {
  // By descending order return tickers
  static getRankedTickers(tickerSnapshots) {
    const merged = this.mergeTickerSnapshots(tickerSnapshots);
    const sortedTickerSnapshots = Object.entries(merged)
      .map(([ticker, count]) => ({
        ticker,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    return sortedTickerSnapshots.map((d) => d.ticker);
  }

  // If ticker mentioned at least once, dont leave them undefined in other tickerSnapshot.
  static processTickerSnapshots(tickerSnapshotsRaw) {
    const tickerSnapshots = JSON.parse(JSON.stringify(tickerSnapshotsRaw));

    const baseTickers = Object.entries(tickerSnapshots).reduce(
      (acc, [time, tickers]) => {
        Object.keys(tickers).forEach((ticker) => {
          if (acc[ticker] === undefined) acc[ticker] = 0;
        });

        return acc;
      },
      {}
    );

    Object.entries(tickerSnapshots).forEach(([time, tickers]) => {
      tickers["isEmpty"] = undefined;
      tickerSnapshots[time] = { ...baseTickers, ...tickers };
    });

    return tickerSnapshots;
  }
  //TimeFormat: 2021-03-21T11:12:31
  static organizeTickerSnapshot(tickerSnapshot) {
    const organized = {};
    const groupedByDay = this.groupTickerSnapshotsByDay(tickerSnapshot);
    Object.entries(groupedByDay).forEach(([date, tickerSnapshotDay]) => {
      organized[date] = {};
      const groupedByHour = this.groupTickerSnapshotsByHour(tickerSnapshotDay);
      Object.entries(groupedByHour).forEach(([hour, tickerSnapshotHour]) => {
        organized[date][hour] = this.mergeTickerSnapshots(tickerSnapshotHour);
      });
    });

    return organized;
  }
  static organizeTickerSnapshotHour(tickerSnapshot) {
    const organized = {};
    const groupedByDay = this.groupTickerSnapshotsByDay(tickerSnapshot);
    Object.entries(groupedByDay).forEach(([date, tickerSnapshotDay]) => {
      const groupedByHour = this.groupTickerSnapshotsByHour(tickerSnapshotDay);
      Object.entries(groupedByHour).forEach(([hour, tickerSnapshotHour]) => {
        // Rollback e.g) hour 1 to 01, which is converted in groupTickerSnapshotsByHour for sorting purpose
        const foramttedHour = String(hour).padStart(2, 0);
        organized[`${date}T${foramttedHour}:00:00`] = this.mergeTickerSnapshots(
          tickerSnapshotHour
        );
      });
    });

    return organized;
  }

  static groupTickerSnapshotsByDay(tickerSnapshots) {
    const groupedByDay = {};
    Object.keys(tickerSnapshots).forEach((time) => {
      const date = time.split("T")[0];
      if (groupedByDay[date] === undefined) groupedByDay[date] = {};
      groupedByDay[date][time] = { ...tickerSnapshots[time] };
    });

    return groupedByDay;
  }
  static groupTickerSnapshotsByHour(tickerSnapshots) {
    const groupedByHour = {};
    Object.keys(tickerSnapshots).forEach((time) => {
      // Use Number constructor to convert e.g) 01 to 1. if you dont use Number to convert 01 to 1, sorting need again (10 goes first than 01)
      const hour = Number(time.split("T")[1].split(":")[0]);
      if (groupedByHour[hour] === undefined) groupedByHour[hour] = {};
      groupedByHour[hour][time] = { ...tickerSnapshots[time] };
    });

    return groupedByHour;
  }
  static mergeTickerSnapshots(tickerSnapshots) {
    const merged = {};
    Object.keys(tickerSnapshots).forEach((time) => {
      Object.entries(tickerSnapshots[time]).forEach(([ticker, count]) => {
        if (merged[ticker] === undefined) merged[ticker] = count;
        else merged[ticker] += count;
      });
    });

    return merged;
  }
}
