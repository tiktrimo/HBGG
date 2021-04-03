import React from "react";
import {
  Button,
  ButtonGroup,
  Grid,
  Paper,
  Typography,
} from "@material-ui/core";
import GitHubIcon from "@material-ui/icons/GitHub";
import BugReportIcon from "@material-ui/icons/BugReport";
import Statistics from "./Statistics.jsx";
import RangeSelector from "./RangeSelector.jsx";

const LinkButtonGroup = (props) => {
  return (
    <ButtonGroup size="small" variant="text">
      <Button href={"https://hbgg-to-the-moon.firebaseapp.com/"}>
        <Typography style={{ fontSize: 18, fontWeight: 1000 }} align="center">
          HBGG
        </Typography>
      </Button>
      <Button href={"https://github.com/tiktrimo/HBGG"} target="_blank">
        <GitHubIcon />
      </Button>
    </ButtonGroup>
  );
};

const BugReportButton = (props) => {
  return (
    <Button
      style={{ position: "absolute", right: 0, bottom: 0, height: 35 }}
      href={"https://github.com/tiktrimo/HBGG/issues"}
      target="_blank"
    >
      <BugReportIcon fontSize="small" />
    </Button>
  );
};

export default function Informations(props) {
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
        <Statistics
          tickerSnapshots={props.tickerSnapshots}
          range={props.range}
        />
      </Grid>

      <Grid style={{ paddingTop: 15 }} justify="center" container>
        <RangeSelector setRange={props.setRange} />
      </Grid>

      <Grid
        style={{ paddingTop: 20, position: "relative" }}
        justify="center"
        container
      >
        <LinkButtonGroup />
        <BugReportButton />
      </Grid>
    </Paper>
  );
}
