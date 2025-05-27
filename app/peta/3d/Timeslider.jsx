import * as React from "react";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import Typography from "@mui/material/Typography";

export default function TimeSlider({ onTimeChange, times = [] }) {
  const [selectedTime, setSelectedTime] = React.useState(null);

  React.useEffect(() => {
    if (times.length > 0 && !times.includes(selectedTime)) {
      setSelectedTime(times[0]);
      if (onTimeChange) {
        onTimeChange(times[0]);
      }
    }
  }, [times, onTimeChange]);

  const marks = times.map((_, index) => ({
    value: index,
  }));

  const handleChange = (_, newValue) => {
    const newTime = times[newValue];
    setSelectedTime(newTime);
    if (onTimeChange) {
      onTimeChange(newTime);
    }
  };

  if (times.length === 0) {
    return (
      <Box sx={{ width: 400, background: "white", p: 2, borderRadius: 2 }}>
        <Typography variant="body2">Tidak ada data waktu genangan</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: 400, background: "white", p: 2, borderRadius: 2 }}>
      <Slider
        marks={marks}
        step={1}
        value={times.indexOf(selectedTime)}
        min={0}
        max={times.length - 1}
        onChange={handleChange}
      />
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        {times.map((time) => (
          <Typography
            key={time}
            variant="body2"
            onClick={() => {
              setSelectedTime(time);
              if (onTimeChange) {
                onTimeChange(time);
              }
            }}
            sx={{
              cursor: "pointer",
              fontWeight: time === selectedTime ? "bold" : "normal",
              color: time === selectedTime ? "primary.main" : "text.primary",
            }}
          >
            {time}
          </Typography>
        ))}
      </Box>
    </Box>
  );
}
