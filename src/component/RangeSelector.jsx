import React, { useState } from "react";
import { Button, ButtonGroup } from "@material-ui/core";
import { analytics } from "..";

const BUTTON_SELECTED_COLOR = "#dedede";
const BUTTON_DEFAULT_COLOR = "#F5F5F5";

export default function RangeSelector(props) {
  const [range, setRange] = useState(864);

  return (
    <ButtonGroup size="small" variant="text">
      {[2, 6, 12, 36, 72, 144, 288, 864, 2016].map((time) => {
        return (
          <Button
            key={`${time}TickerButton`}
            style={{
              backgroundColor:
                range === time ? BUTTON_SELECTED_COLOR : BUTTON_DEFAULT_COLOR,
            }}
            onClick={() => {
              analytics.logEvent(`custom_range_click${time}`);
              setRange(time);
              props?.setRange(time);
            }}
          >
            {getTimeTxt(time)}
          </Button>
        );
      })}
    </ButtonGroup>
  );
}

function getTimeTxt(time) {
  switch (time) {
    case 2:
      return "10M";
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
    case 2016:
      return "1W";
    default:
      return "?";
  }
}
