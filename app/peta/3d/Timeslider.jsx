import * as React from "react";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import Typography from "@mui/material/Typography";

const TIMES = ["15:30", "17:30", "18:30", "19:30", "20:30"];
const marks = TIMES.map((_, index) => ({
  value: index, // Hanya gunakan value untuk posisi tanda, tanpa label
}));

export default function TimeSlider({ onTimeChange }) {
  const [selectedTime, setSelectedTime] = React.useState(TIMES[0]);

  const handleChange = (_, newValue) => {
    const newTime = TIMES[newValue];
    setSelectedTime(newTime);
    if (onTimeChange) {
      onTimeChange(newTime); // Kirim waktu yang dipilih ke komponen induk
    }
  };

  return (
    <Box sx={{ width: 400, background: "white", p: 2, borderRadius: 2 }}>
      <Slider
        marks={marks}
        step={1}
        value={TIMES.indexOf(selectedTime)}
        min={0}
        max={TIMES.length - 1}
        onChange={handleChange}
      />
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        {TIMES.map((time) => (
          <Typography
            key={time}
            variant="body2"
            onClick={() => {
              setSelectedTime(time);
              if (onTimeChange) {
                onTimeChange(time);
              }
            }}
            sx={{ cursor: "pointer" }}
          >
            {time}
          </Typography>
        ))}
      </Box>
    </Box>
  );
}
