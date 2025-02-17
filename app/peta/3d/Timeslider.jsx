import * as React from "react";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import Typography from "@mui/material/Typography";

const VAL7 = 280;
const VAL6 = 240;
const VAL5 = 200;
const VAL4 = 160;
const VAL3 = 120;
const VAL2 = 80;
const VAL1 = 40;
const marks = [
  {
    value: VAL1,
    label: "",
  },
  {
    value: VAL2,
    label: "",
  },
  {
    value: VAL3,
    label: "",
  },
  {
    value: VAL4,
    label: "",
  },
  {
    value: VAL5,
    label: "",
  },
  {
    value: VAL6,
    label: "",
  },
  {
    value: VAL7,
    label: "",
  },
];

export default function CustomMarks() {
  const [val, setVal] = React.useState(VAL1);
  const handleChange = (_, newValue) => {
    setVal(newValue);
  };

  return (
    <Box sx={{ width: 400, background: "white", p: 2, borderRadius: 2 }}>
      <Slider
        marks={marks}
        step={1}
        value={val}
        valueLabelDisplay="auto"
        min={VAL1}
        max={VAL7}
        onChange={handleChange}
      />
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography
          variant="body2"
          onClick={() => setVal(VAL1)}
          sx={{ cursor: "pointer" }}
        >
          {VAL1}
        </Typography>
        <Typography
          variant="body2"
          onClick={() => setVal(VAL2)}
          sx={{ cursor: "pointer" }}
        >
          {VAL2}
        </Typography>
        <Typography
          variant="body2"
          onClick={() => setVal(VAL3)}
          sx={{ cursor: "pointer" }}
        >
          {VAL3}
        </Typography>
        <Typography
          variant="body2"
          onClick={() => setVal(VAL4)}
          sx={{ cursor: "pointer" }}
        >
          {VAL4}
        </Typography>
        <Typography
          variant="body2"
          onClick={() => setVal(VAL5)}
          sx={{ cursor: "pointer" }}
        >
          {VAL5}
        </Typography>
        <Typography
          variant="body2"
          onClick={() => setVal(VAL6)}
          sx={{ cursor: "pointer" }}
        >
          {VAL6}
        </Typography>
        <Typography
          variant="body2"
          onClick={() => setVal(VAL7)}
          sx={{ cursor: "pointer" }}
        >
          {VAL7}
        </Typography>
      </Box>
    </Box>
  );
}
