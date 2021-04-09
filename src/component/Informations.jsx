import React, { useRef, useState } from "react";
import {
  Button,
  ButtonGroup,
  ClickAwayListener,
  Grid,
  Paper,
  Popper,
  Typography,
} from "@material-ui/core";
import GitHubIcon from "@material-ui/icons/GitHub";
import BugReportIcon from "@material-ui/icons/BugReport";
import HelpIcon from "@material-ui/icons/Help";
import Statistics from "./Statistics.jsx";
import RangeSelector from "./RangeSelector.jsx";
import ControlledTooltip from "./ControlledTooltip.jsx";
import TagSelector from "./TagSelector.jsx";

const LinkButtonGroup = (props) => {
  const [tagsOpen, setTagsOpen] = useState(false);

  const anchorEl = useRef(undefined);

  return (
    <React.Fragment>
      <ButtonGroup size="small" variant="text">
        <Button
          ref={anchorEl}
          style={{ paddingBottom: 0, paddingTop: 5 }}
          variant="text"
        >
          <Typography
            style={{
              fontSize: "1.09rem",
              fontFamily: '"Black Han Sans", sans-serif',
            }}
            align="center"
          >
            해외주식갤러리
          </Typography>
        </Button>
        <Button href={"https://hbgg-to-the-moon.firebaseapp.com/"}>
          <Typography
            style={{ fontSize: "1.1rem", fontWeight: 1000 }}
            align="center"
          >
            HBGG
          </Typography>
        </Button>
        <ControlledTooltip
          title="쓸만하셨다면 별 한번 눌러주세요 ㅎㅎ"
          open={props.showHelp}
          placement="top-end"
          arrow
        >
          <Button href={"https://github.com/tiktrimo/HBGG"} target="_blank">
            <GitHubIcon />
          </Button>
        </ControlledTooltip>
      </ButtonGroup>

      <Popper
        open={tagsOpen}
        anchorEl={anchorEl.current}
        placement="bottom-start"
      ></Popper>
    </React.Fragment>
  );
};

const HelpButton = (props) => {
  return (
    <ClickAwayListener
      onClickAway={() => {
        props.setShowHelp(false);
      }}
    >
      <Button
        style={{ position: "absolute", left: 0, bottom: 0, height: 35 }}
        onClick={() => {
          props.setShowHelp(true);
        }}
      >
        <HelpIcon fontSize="small" />
      </Button>
    </ClickAwayListener>
  );
};

const BugReportButton = (props) => {
  return (
    <ControlledTooltip
      title="건의하실 사항이나 이상한 점이 있다면 자유롭게 적어주세요"
      open={props.showHelp}
      placement="left"
      arrow
    >
      <Button
        style={{ position: "absolute", right: 0, bottom: 0, height: 35 }}
        href={"https://github.com/tiktrimo/HBGG/issues"}
        target="_blank"
      >
        <BugReportIcon fontSize="small" />
      </Button>
    </ControlledTooltip>
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
          showHelp={props.showHelp}
        />
      </Grid>

      <Grid style={{ paddingTop: 15 }} justify="center" container>
        <RangeSelector setRange={props.setRange} showHelp={props.showHelp} />
      </Grid>

      <Grid
        style={{ paddingTop: 20, position: "relative" }}
        justify="center"
        container
      >
        <HelpButton setShowHelp={props.setShowHelp} />
        <LinkButtonGroup showHelp={props.showHelp} />
        <BugReportButton showHelp={props.showHelp} />
      </Grid>
    </Paper>
  );
}
