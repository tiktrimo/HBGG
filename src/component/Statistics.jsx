import { Paper, Typography } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import React, { useEffect, useState } from "react";
import StatisticUtil from "../services/StatisticUtil";

const RANGE_CAP = 2016; // 7days / 5min = 2016
const TICKER_POSITIVE = "#bf0000";
const TICKER_NEGATIVE = "#0c00bf";

const TickerSquare = (props) => {
  return (
    <Paper style={{ backgroundColor: "#F5F5F5", width: 55 }} elevation={0}>
      <Typography
        style={{ fontSize: 10, fontWeight: 1000, color: "#626262" }}
        align="center"
      >
        {props.ticker}
      </Typography>
      <Typography align="center">{props.count}</Typography>
      <Typography
        style={{
          minHeight: 15,
          fontSize: 10,
          color: getIncrementColor(props.count, props.prevCount, props.range),
        }}
        align="center"
      >
        {getIncrement(props.count, props.prevCount, props.range)}
      </Typography>
    </Paper>
  );
};

export default function Statistics(props) {
  const [statisticData, setStatisticData] = useState([]);
  const [prevStatisticData, setPrevStatisticData] = useState([]);

  useEffect(() => {
    const statisticData = StatisticUtil.getStatisticData(
      props.tickerSnapshots,
      props.range
    ).slice(0, 10);
    const prevStatisticData = StatisticUtil.getPrevStatisticData(
      props.tickerSnapshots,
      props.range,
      statisticData
    );

    setStatisticData(statisticData);
    setPrevStatisticData(prevStatisticData);
  }, [props.range, props.tickerSnapshots]);

  return (
    <React.Fragment>
      {statisticData.length === 0 ? (
        <Skeleton width={540} height={54} animation="wave" variant="rect" />
      ) : (
        statisticData.map((statisticDatum, index) => {
          return (
            <TickerSquare
              key={`${statisticDatum.ticker}TickerSquare`}
              ticker={statisticDatum.ticker}
              count={statisticDatum.count}
              prevCount={prevStatisticData[index].count}
              range={props.range}
            />
          );
        })
      )}
    </React.Fragment>
  );
}

function getIncrement(count, prevCount, range) {
  if (range >= RANGE_CAP) return "-";

  return `${count - prevCount >= 0 ? "+" : ""}${count - prevCount}`;
}
function getIncrementColor(count, prevCount, range) {
  if (range >= RANGE_CAP) return "black";

  return count - prevCount >= 0 ? TICKER_POSITIVE : TICKER_NEGATIVE;
}
