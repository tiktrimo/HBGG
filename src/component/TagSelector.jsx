import React from "react";
import { Button, Grid, Typography } from "@material-ui/core";

export default function TagSelector(props) {
  return (
    <Grid container justify="center">
      <Button variant="text">
        <Typography
          style={{
            fontFamily: '"Black Han Sans", sans-serif',
          }}
          align="center"
        >
          해외주식갤러리
        </Typography>
      </Button>
    </Grid>
  );
}
