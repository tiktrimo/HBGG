import {
  Button,
  ButtonGroup,
  Grid,
  Paper,
  Typography,
} from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { mergeTickerSnapshots } from "./FrontPage";
import GitHubIcon from "@material-ui/icons/GitHub";

const BUTTON_SELECTED_COLOR = "#dedede";
const BUTTON_DEFAULT_COLOR = "#F5F5F5";
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
          fontSize: 10,
          color:
            props.count - props.prevCount >= 0
              ? TICKER_POSITIVE
              : TICKER_NEGATIVE,
        }}
        align="center"
      >{`${props.count - props.prevCount >= 0 ? "+" : ""}${
        props.count - props.prevCount
      }`}</Typography>
    </Paper>
  );
};

function TickerButtonGroup(props) {
  return (
    <ButtonGroup size="small" variant="text">
      {[1, 3, 6, 12, 36, 72, 144, 288, 864].map((time) => {
        return (
          <Button
            key={`${time}TickerButton`}
            style={{
              backgroundColor:
                props.range === time
                  ? BUTTON_SELECTED_COLOR
                  : BUTTON_DEFAULT_COLOR,
            }}
            onClick={() => {
              props.setRange(time);
            }}
          >
            {getTimeTxt(time)}
          </Button>
        );
      })}
    </ButtonGroup>
  );
}

const LinkButtonGroup = (props) => {
  return (
    <ButtonGroup size="small" variant="text">
      <Button href={"https://hbgg-to-the-moon.firebaseapp.com/"}>
        <Typography style={{ fontSize: 18, fontWeight: 1000 }} align="center">
          HBGG
        </Typography>
      </Button>
      <Button
        href={"https://github.com/tiktrimo/EVE-Fitting.js"}
        target="_blank"
      >
        <GitHubIcon />
      </Button>
    </ButtonGroup>
  );
};

export default function Statistics(props) {
  const [statisticData, setStatisticData] = useState([]);
  const [prevStatisticData, setPrevStatisticData] = useState([]);
  const [range, setRange] = useState(12);

  useEffect(() => {
    const statisticData = getStatisticData(
      props.initilizedTickerSnapshots,
      range
    ).slice(0, 10);
    const prevStatisticData = getPrevStatisticData(
      props.initilizedTickerSnapshots,
      range,
      statisticData
    );

    setStatisticData(statisticData);
    setPrevStatisticData(prevStatisticData);
  }, [range, props.initilizedTickerSnapshots]);

  return (
    <Paper
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#F5F5F5",
        boxShadow: "inset 0px 20px 40px -40px grey",
      }}
      elevation={0}
      square
    >
      <Grid style={{ paddingTop: 30 }} justify="center" container>
        {statisticData.map((statisticDatum, index) => {
          return (
            <TickerSquare
              key={`${statisticDatum.ticker}TickerSquare`}
              ticker={statisticDatum.ticker}
              count={statisticDatum.count}
              prevCount={prevStatisticData[index].count}
            />
          );
        })}
      </Grid>

      <Grid style={{ paddingTop: 15 }} justify="center" container>
        <TickerButtonGroup setRange={setRange} range={range} />
      </Grid>

      <Grid style={{ paddingTop: 20 }} justify="center" container>
        <LinkButtonGroup />
      </Grid>
    </Paper>
  );
}

function getStatisticData(tickerSnapshots, range) {
  const tickerSnapshotEntries = Object.entries(tickerSnapshots);

  const rangedTickerSnapshots = {};
  tickerSnapshotEntries
    .slice(tickerSnapshotEntries.length - range)
    .forEach(([date, tickerSnapshot]) => {
      rangedTickerSnapshots[date] = tickerSnapshot;
    });

  return Object.entries(mergeTickerSnapshots(rangedTickerSnapshots))
    .map(([ticker, count]) => ({ ticker, count }))
    .sort((a, b) => b.count - a.count);
}
function getPrevStatisticData(tickerSnapshots, range, statisticData) {
  const tickerSnapshotEntries = Object.entries(tickerSnapshots);

  const rangedTickerSnapshots = {};
  tickerSnapshotEntries
    .slice(
      tickerSnapshotEntries.length - range * 2 < 0
        ? 0
        : tickerSnapshotEntries.length - range * 2,
      tickerSnapshotEntries.length - range
    )
    .forEach(([date, tickerSnapshot]) => {
      rangedTickerSnapshots[date] = tickerSnapshot;
    });
  console.log();

  const tickerSnapshot = mergeTickerSnapshots(rangedTickerSnapshots);
  return statisticData.map((datum) => {
    return {
      ticker: datum.ticker,
      count: tickerSnapshot[datum.ticker],
    };
  });
}

function getTimeTxt(time) {
  switch (time) {
    case 1:
      return "5M";
    case 3:
      return "15M";
    case 6:
      return "30M";
    case 12:
      return "1H";
    case 36:
      return "3H";
    case 72:
      return "6H";
    case 144:
      return "12H";
    case 288:
      return "1D";
    case 864:
      return "3D";
    default:
      return "?";
  }
}
