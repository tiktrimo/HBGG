import { Grid } from "@material-ui/core";
import React, { useState } from "react";
import { useEffect } from "react";
import { database } from "../index";
import NivoChart from "./NivoChart";
import Statistics from "./Statistics";

export default function FrontPage(props) {
  const [initilizedTickerSnapshots, setInitilizedTickerSnapshots] = useState(
    []
  );
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    database
      .ref("/archive/tickers")
      .once("value")
      .then((data) => data.val())
      .then((tickerSnapshots) => {
        const rankedTickers = getRankedTickers(tickerSnapshots);
        const topRankedTickers = rankedTickers.slice(0, 8);

        const initilizedTickerSnapshots = initializeTickerSnapshots(
          tickerSnapshots
        );
        const organized = organizeTickerSnapshotHour(initilizedTickerSnapshots);
        setInitilizedTickerSnapshots(initilizedTickerSnapshots);

        const chartData = topRankedTickers.map((rankedTicker, index) => {
          const data = Object.entries(organized).map(([time, tickers]) => {
            return { x: time, y: tickers[rankedTicker] };
          });

          return {
            id: rankedTicker,
            data: data,
          };
        });

        setChartData(chartData);
      });
  }, []);

  return (
    <React.Fragment>
      <Grid style={{ width: "100%", height: "80vh" }}>
        <NivoChart data={chartData} />
      </Grid>
      <Grid style={{ width: "100%", height: "20vh" }}>
        <Statistics initilizedTickerSnapshots={initilizedTickerSnapshots} />
      </Grid>
    </React.Fragment>
  );
}

function getRankedTickers(tickerSnapshot) {
  const merged = mergeTickerSnapshots(tickerSnapshot);
  const rankedTickersRaws = Object.entries(merged)
    .map(([ticker, count]) => ({
      ticker,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  return rankedTickersRaws.map((rankedTickersRaw) => rankedTickersRaw.ticker);
}

// If ticker mentioned at least once, create ticker: 0 in other time
function initializeTickerSnapshots(tickerSnapshots) {
  const _tickerSnapshots = JSON.parse(JSON.stringify(tickerSnapshots));

  const baseTickers = Object.entries(_tickerSnapshots).reduce(
    (acc, [time, tickers]) => {
      Object.keys(tickers).forEach((ticker) => {
        if (acc[ticker] === undefined) acc[ticker] = 0;
      });

      return acc;
    },
    {}
  );

  Object.entries(_tickerSnapshots).forEach(([time, tickers]) => {
    _tickerSnapshots[time] = { ...baseTickers, ...tickers };
  });

  return _tickerSnapshots;
}

//TimeFormat: 2021-03-21T11:12:31
/* function organizeTickerSnapshot(tickerSnapshot) {
  const organized = {};
  const groupedByDay = groupTickerSnapshotsByDay(tickerSnapshot);
  Object.entries(groupedByDay).forEach(([date, tickerSnapshotDay]) => {
    organized[date] = {};
    const groupedByHour = groupTickerSnapshotsByHour(tickerSnapshotDay);
    Object.entries(groupedByHour).forEach(([hour, tickerSnapshotHour]) => {
      organized[date][hour] = mergeTickerSnapshots(tickerSnapshotHour);
    });
  });

  return organized;
} */
function organizeTickerSnapshotHour(tickerSnapshot) {
  const organized = {};
  const groupedByDay = groupTickerSnapshotsByDay(tickerSnapshot);
  Object.entries(groupedByDay).forEach(([date, tickerSnapshotDay]) => {
    const groupedByHour = groupTickerSnapshotsByHour(tickerSnapshotDay);
    Object.entries(groupedByHour).forEach(([hour, tickerSnapshotHour]) => {
      organized[`${date}T${hour}`] = mergeTickerSnapshots(tickerSnapshotHour);
    });
  });

  return organized;
}

function groupTickerSnapshotsByDay(tickerSnapshots) {
  const groupedByDay = {};
  Object.keys(tickerSnapshots).forEach((time) => {
    const date = time.split("T")[0];
    if (groupedByDay[date] === undefined) groupedByDay[date] = {};
    groupedByDay[date][time] = { ...tickerSnapshots[time] };
  });

  return groupedByDay;
}
function groupTickerSnapshotsByHour(tickerSnapshots) {
  const groupedByHour = {};
  Object.keys(tickerSnapshots).forEach((time) => {
    const hour = Number(time.split("T")[1].split(":")[0]);
    if (groupedByHour[hour] === undefined) groupedByHour[hour] = {};
    groupedByHour[hour][time] = { ...tickerSnapshots[time] };
  });

  return groupedByHour;
}
export function mergeTickerSnapshots(tickerSnapshots) {
  const merged = {};
  Object.keys(tickerSnapshots).forEach((time) => {
    Object.entries(tickerSnapshots[time]).forEach(([ticker, count]) => {
      if (merged[ticker] === undefined) merged[ticker] = count;
      else merged[ticker] += count;
    });
  });

  return merged;
}
