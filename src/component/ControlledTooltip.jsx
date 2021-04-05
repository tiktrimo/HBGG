import { Tooltip } from "@material-ui/core";
import React from "react";

export default function ControlledTooltip(props) {
  return (
    <Tooltip
      title={props.title}
      open={props.open}
      placement={props.placement}
      disableFocusListener
      disableHoverListener
      disableTouchListener
      arrow={props.arrow}
    >
      {props.children}
    </Tooltip>
  );
}
