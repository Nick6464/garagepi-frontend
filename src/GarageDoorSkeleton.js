import React from 'react';
import { Skeleton, Grid } from '@mui/material';

const GarageDoorSkeleton = ({ count }) => {
  return (
    <Grid
      container
      spacing={2}
      sx={{ mt: 1 }}
      alignItems="center"
      justifyContent="center"
    >
      {Array.from({ length: count }).map((_, index) => (
        <Grid item key={index}>
          <Skeleton variant="rounded" width={400} height={136} />
        </Grid>
      ))}
    </Grid>
  );
};

export default GarageDoorSkeleton;
