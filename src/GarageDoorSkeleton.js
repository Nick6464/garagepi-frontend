import React from 'react';
import { Skeleton, Grid, Paper } from '@mui/material';

const GarageDoorSkeleton = ({ count }) => {
  return (
    <Grid container spacing={2} alignItems="center" justifyContent="center">
      {Array.from({ length: count }).map((_, index) => (
        <Grid item key={index}>
          <Paper>
            <Skeleton variant="rectangular" width={400} height={130} />
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default GarageDoorSkeleton;
