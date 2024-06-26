import {Box, CircularProgress, CircularProgressProps, LinearProgress, LinearProgressProps, Typography} from "@mui/joy";

export const FileProgress = (props: CircularProgressProps & { value: number }) => {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress variant="outlined" {...props} />
      {/*<Box*/}
      {/*  sx={{*/}
      {/*    top: 0,*/}
      {/*    left: 0,*/}
      {/*    bottom: 0,*/}
      {/*    right: 0,*/}
      {/*    position: 'absolute',*/}
      {/*    display: 'flex',*/}
      {/*    alignItems: 'center',*/}
      {/*    justifyContent: 'center',*/}
      {/*  }}*/}
      {/*>*/}
      {/*  <Typography component="div">{`${Math.round(props.value)}%`}</Typography>*/}
      {/*</Box>*/}
    </Box>
  );
}