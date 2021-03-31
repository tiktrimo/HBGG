import React, { useState } from "react";
import { ResponsiveLine } from "@nivo/line";
import { Paper, Typography } from "@material-ui/core";

const redToBlueColorSet = [
  "#bf0000",
  "#df584c",
  "#f5938e",
  "#ffcdcd",
  "#d1cdff",
  "#9a8fee",
  "#6251d9",
  "#0c00bf",
];

const NivoLineChart = ({ data }) => {
  const [highlightColors, setHighlightColors] = useState(false);
  const [highlightID, setHighlightID] = useState(false);

  return (
    <ResponsiveLine
      data={data}
      margin={{ top: 60, right: 100, bottom: 60, left: 60 }}
      xScale={{ type: "point" }}
      yScale={{
        type: "linear",
        min: "auto",
        max: "auto",
        stacked: false,
        reverse: false,
      }}
      curve="catmullRom"
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
        format: (value) => {
          //Delete date, +9 because data is in UTC.
          if (value.split("T")[1] !== "15") {
            const hourInUTC9 = Number(value.split("T")[1]) + 9;
            return hourInUTC9 % 3 === 0 ? `${hourInUTC9 % 24}:00` : "";
          } //if it present 24:00 return with date
          else
            return `${value.split("T")[0].split("-")[1]}-${
              Number(value.split("T")[0].split("-")[2]) + 1
            }T0:00`;
        },
      }}
      axisLeft={{
        orient: "left",
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "",
        legendOffset: -40,
        legendPosition: "middle",
      }}
      colors={highlightColors || redToBlueColorSet}
      enablePoints={false}
      enableGridX={false}
      pointSize={10}
      pointColor={{ theme: "background" }}
      pointBorderWidth={2}
      pointBorderColor={{ from: "serieColor" }}
      pointLabelYOffset={-12}
      enableSlices="x"
      sliceTooltip={({ slice }) => {
        return (
          <Paper elevation={2} style={{ padding: 10 }}>
            <Typography style={{ fontSize: 15, fontWeight: 700 }}>
              {slice?.points?.[0]?.data?.xFormatted || "TIME"}
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
      }}
      useMesh={true}
      legends={[
        {
          anchor: "bottom-right",
          direction: "column",
          justify: false,
          translateX: 100,
          translateY: 0,
          itemsSpacing: 0,
          itemDirection: "left-to-right",
          itemWidth: 80,
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
          onClick: (d) => {
            if (!!highlightColors) {
              if (d.id === highlightID) {
                setHighlightColors(false);
                setHighlightID(false);
              } else {
                setHighlightColors(
                  data.map((series, index) =>
                    series.id === d.id ? redToBlueColorSet[index] : "#F5F5F5"
                  )
                );
                setHighlightID(d.id);
              }
            } else {
              setHighlightColors(
                data.map((series) => (series.id === d.id ? d.color : "#F5F5F5"))
              );
              setHighlightID(d.id);
            }
          },
        },
      ]}
    />
  );
};

export default function NivoChart(props) {
  return <NivoLineChart data={props.data} />;
}
