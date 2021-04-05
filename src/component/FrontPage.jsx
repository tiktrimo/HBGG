import { Grid } from "@material-ui/core";
import React, { useRef, useState } from "react";
import { useEffect } from "react";
import { analytics, database, storage } from "../index";
import NivoChart from "./NivoChart";
import { parse } from "zipson";
import SnapshotUtil from "../services/SnapshotUtil";
import Informations from "./Informations";
import ControlledTooltip from "./ControlledTooltip";

export default function FrontPage(props) {
  const [tickerSnapshotsRaw, setTickerSnapshotsRaw] = useState([]);
  const [tickerSnapshotAdded, setTickerSnapshotAdded] = useState(false);
  const [tickerSnapshots, setTickerSnapshots] = useState([]);
  const [range, setRange] = useState(864);

  const childAddedCallbackRef = useRef(); // save function reference for remove listener at unmount;
  const isCallbackReadyRef = useRef(false); // isCallbackReadyRef is used to ignore tickerSnapshotAdded once. Firebase child_added listener return child at subscription. so first callback need to be ignored

  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    // Fetch tickersnapshotRaw from firebase realtime database
    (async () => {
      const tickerSnapshotsRaw = await fetchTickerSnapshotsRaw();
      setTickerSnapshotsRaw(tickerSnapshotsRaw);
    })();

    // attach listener to database. updated child is set by setTickerSnapshotAdded
    childAddedCallbackRef.current = childAddedCallback(setTickerSnapshotAdded);
    database
      .ref("/archive/tickers")
      .limitToLast(1)
      .on("child_added", childAddedCallbackRef.current);

    return () => {
      database
        .ref("/archive/tickers")
        .off("child_added", childAddedCallbackRef.current);
    };
  }, []);

  // update tickerSnapshotRaw as child added to server
  useEffect(() => {
    if (!!tickerSnapshotAdded && isCallbackReadyRef.current === false) {
      isCallbackReadyRef.current = true;
      return;
    } else if (tickerSnapshotAdded === false) return;

    Object.assign(tickerSnapshotsRaw, tickerSnapshotAdded);
    setTickerSnapshotsRaw({ ...tickerSnapshotsRaw });
    setTickerSnapshotAdded(false);
  }, [tickerSnapshotAdded]);

  // update tickerSnapshot as tickerSnapshotRaw update
  useEffect(() => {
    const tickerSnapshots = SnapshotUtil.processTickerSnapshots(
      tickerSnapshotsRaw
    );
    setTickerSnapshots(tickerSnapshots);
  }, [tickerSnapshotsRaw]);

  return (
    <React.Fragment>
      <ControlledTooltip
        open={showHelp}
        title="범례를 누르면 특정 티커만 표시할 수 있어요"
        placement="bottom-end"
      >
        <Grid style={{ width: "100%", height: "80vh" }}>
          <NivoChart
            tickerSnapshots={tickerSnapshots}
            range={range}
            showHelp={showHelp}
          />
        </Grid>
      </ControlledTooltip>
      <Grid style={{ width: "100%", minHeight: 180 }}>
        <Informations
          tickerSnapshots={tickerSnapshots}
          range={range}
          setRange={setRange}
          showHelp={showHelp}
          setShowHelp={setShowHelp}
        />
      </Grid>
    </React.Fragment>
  );
}

// Use both realtime database and storage. and concat two data.
async function fetchTickerSnapshotsRaw() {
  const last6Days = await getLast6Days(storage);
  const storageTickerSnapshotsSet = await Promise.all(
    last6Days.map(async (date) => {
      return await storage
        .ref(`archive/tickers/${date}`)
        .getDownloadURL()
        .then(async (url) => {
          return await fetch(url)
            .then((data) => data.text())
            .then((data) => parse(data));
        })
        .catch((e) => ({}));
    })
  );

  const databaseTickerSnapshots = await database
    .ref("/archive/tickers")
    .once("value")
    .then((data) => data.val());

  const tickerSnapshots = {};
  storageTickerSnapshotsSet.forEach((storageTickerSnapshots) =>
    Object.assign(tickerSnapshots, storageTickerSnapshots)
  );
  Object.assign(tickerSnapshots, databaseTickerSnapshots);

  return tickerSnapshots;
}

// Takes last 6days to fetch from firebase storage. if there is no data from yesterday ignore it. (orginizing database and passing 00:00 have gap ~6hour)
async function getLast6Days() {
  const dayInMilliseconds = 24 * 60 * 60 * 1000;
  const last7Days = [8, 7, 6, 5, 4, 3, 2, 1].map(
    (daysAgo) =>
      new Date(Date.now() - dayInMilliseconds * daysAgo)
        .toISOString()
        .replace(/\..+/, "")
        .split("T")[0]
  );

  const isYesterdayExistInStorage = await storage
    .ref(`archive/tickers/${last7Days.slice(-1).pop()}`)
    .getDownloadURL()
    .then((url) => true)
    .catch((e) => false);

  return isYesterdayExistInStorage
    ? last7Days.slice(1) // normal
    : last7Days.slice(0, last7Days.length - 1); // ignore yesterday
}

const childAddedCallback = (setTickerSnapshotAdded) => (
  snapshot,
  prevChildKey
) => {
  setTickerSnapshotAdded({ [snapshot.key]: snapshot.val() });
};
