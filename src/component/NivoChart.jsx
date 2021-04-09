import React, { useEffect, useState } from "react";
import { ResponsiveLine } from "@nivo/line";
import { Paper, Typography } from "@material-ui/core";
import SnapshotUtil from "../services/SnapshotUtil";
import { Skeleton } from "@material-ui/lab";
import ControlledTooltip from "./ControlledTooltip";

const RED_BULE = [
  "#bf0000",
  "#df584c",
  "#f5938e",
  "#ffcdcd",
  "#d1cdff",
  "#9a8fee",
  "#6251d9",
  "#0c00bf",
];

// Custom tooltip
const getSliceTooltip = ({ slice }) => {
  return (
    <Paper elevation={2} style={{ padding: 10 }}>
      <Typography style={{ fontSize: 15, fontWeight: 700 }}>
        {!!slice?.points?.[0]?.data?.x
          ? dateToLocaleISOString(
              new Date(`${slice?.points?.[0]?.data?.x}Z`)
            ).replace("T", " ")
          : "TIME"}
      </Typography>
      {slice.points.map((point) => (
        <Typography
          key={point.id}
          style={{ color: point.serieColor, fontSize: 14 }}
        >
          {`${point.serieId} ${point.data.yFormatted}`}
        </Typography>
      ))}
    </Paper>
  );
};

export default function NivoChart(props) {
  const [highlightID, setHighlightID] = useState(false);

  const [chartDataSet, setChartDataSet] = useState({});
  const [chartData, setChartData] = useState([]);
  const [updateChart, setUpdateChart] = useState(false);

  const [width, setWidth] = useState(0);

  // Mainly focused for mobile enviroment
  useEffect(() => {
    setWidth(window.innerWidth);
    const handleRender = (e) => {
      setWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleRender);
    return () => {
      window.removeEventListener("resize", handleRender);
    };
  }, []);

  // If tickerSnapshots updates, remove already built chart data. change updateChart to signal buildingChart useEffect
  useEffect(() => {
    setChartDataSet({});
    setUpdateChart(!updateChart);
  }, [props.tickerSnapshots]);

  // If there is already built chartData, use it. but if not make one and save it.
  useEffect(() => {
    const preBuiltChartData = chartDataSet[props.range];
    if (!preBuiltChartData || preBuiltChartData?.length === 0) {
      const builtChartData = processChartData(
        props.tickerSnapshots,
        props.range
      );
      chartDataSet[props.range] = builtChartData;
      setChartDataSet(chartDataSet);
      setChartData(builtChartData);
    } else setChartData(preBuiltChartData);
  }, [updateChart, props.range]);

  return chartData.length === 0 ? (
    <Skeleton width="100%" height="100%" animation="wave" variant="rect" />
  ) : (
    <ControlledTooltip
      open={props.showHelp}
      title="범례를 누르면 특정 티커만 표시할 수 있어요"
      placement="bottom-end"
    >
      <div style={{ width: "100%", height: "100%" }}>
        <ResponsiveLine
          data={chartData}
          margin={{ top: 40, right: 80, bottom: 60, left: 40 }}
          xScale={{ type: "point" }}
          yScale={{
            type: "linear",
            min: 0,
            max: "auto",
            stacked: false,
            reverse: false,
          }}
          curve={props.range <= 288 ? "monotoneX" : "linear"}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            orient: "bottom",
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -42,
            legend: "",
            legendOffset: 36,
            legendPosition: "middle",
            format: getXformat(props.range, width),
          }}
          axisLeft={{
            orient: "left",
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "",
            legendOffset: -40,
            legendPosition: "middle",
            format: (value) => {
              return Math.floor(value) === Number(value) ? value : "";
            },
          }}
          colors={highlightColorSelector(chartData, highlightID)}
          enableGridX={false}
          enableGridY={false}
          enablePoints={false}
          pointSize={5}
          pointColor={{ from: "color", modifiers: [] }}
          pointBorderWidth={1}
          pointBorderColor={{ from: "serieColor" }}
          pointLabelYOffset={-12}
          enableSlices="x"
          sliceTooltip={getSliceTooltip}
          useMesh={true}
          legends={[
            {
              anchor: "bottom-right",
              direction: "column",
              justify: false,
              translateX: 80,
              translateY: 0,
              itemsSpacing: 0,
              itemDirection: "left-to-right",
              itemWidth: 65,
              itemHeight: 20,
              itemOpacity: 0.75,
              symbolSize: 12,
              symbolShape: "circle",
              symbolBorderColor: "rgba(0, 0, 0, .5)",
              effects: [
                {
                  on: "hover",
                  style: {
                    itemBackground: "rgba(0, 0, 0, .03)",
                    itemOpacity: 1,
                  },
                },
              ],
              onClick: highlightOnClickHandler(highlightID, setHighlightID),
            },
          ]}
        />
      </div>
    </ControlledTooltip>
  );
}

// get range * 2 scope of data and get highest 8 ticker's data.
const processChartData = (tickerSnapshots, range) => {
  const tickerSnapshotEntries = Object.entries(tickerSnapshots);

  const rangedTickerSnapshots = {};
  tickerSnapshotEntries
    .slice(
      tickerSnapshotEntries.length - range < 0
        ? 0
        : tickerSnapshotEntries.length - range
    )
    .forEach(([date, tickerSnapshot]) => {
      rangedTickerSnapshots[date] = tickerSnapshot;
    });

  const rankedTickers = SnapshotUtil.getRankedTickers(
    rangedTickerSnapshots
  ).slice(0, 8);
  const organized =
    range <= 36
      ? rangedTickerSnapshots
      : SnapshotUtil.organizeTickerSnapshotHour(rangedTickerSnapshots);
  const organizedEntries = Object.entries(organized);
  const chartData = rankedTickers.map((rankedTicker) => {
    const data = organizedEntries.map(([time, tickers]) => {
      return { x: time, y: tickers[rankedTicker] };
    });

    return { id: rankedTicker, data: data };
  });

  return chartData;
};

const getXformat = (range, width) => (value) => {
  const isWidthTight = width <= 1200;
  const kst = dateToLocaleISOString(new Date(`${value.replace(/Z\w+/, "")}Z`));

  const hour = kst.slice(11, 13);
  const min = kst.slice(14, 16);
  const hourMinForm = `${hour}:${min}`;

  // kst.slice(11, 16)  00:00
  if (range <= 36) {
    if (isWidthTight && range >= 12) return min % 30 === 0 ? hourMinForm : "";
    else return hourMinForm;
  }

  // kst.slice(11, 13) 00 (hour)
  if (kst.slice(11, 13) === "00") return kst.slice(5, 16).replace("T", " ");

  // is hour multiple of 3?
  if (isWidthTight && range >= 288) return hour % 12 === 0 ? hourMinForm : "";
  else return hour % 3 === 0 ? hourMinForm : "";
};

//Control color of lines. if there is highlightID make other's color grey
const highlightColorSelector = (chartData, highlightID) => (d) => {
  if (!highlightID)
    return RED_BULE[chartData.findIndex((datum) => datum.id === d.id)];
  if (d.id === highlightID)
    return RED_BULE[chartData.findIndex((datum) => datum.id === d.id)];
  else return "#F5F5F5";
};
const highlightOnClickHandler = (highlightID, setHighlightID) => (d) => {
  if (!!highlightID && d.id === highlightID) setHighlightID(false);
  else setHighlightID(d.id);
};

// change date object to locale ISO'date String'
function dateToLocaleISOString(date) {
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  const msLocal = date.getTime() - offsetMs;
  const dateLocal = new Date(msLocal);
  const iso = dateLocal.toISOString();
  const isoLocal = iso.slice(0, 19);
  return isoLocal;
}
