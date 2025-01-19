export const metadata = {
  title: "3D Flood WebGIS Jakarta",
  description: "Explore Flood Scenarios in Jakarta",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ width: "100vw", height: "100vh", position: "absolute", display: "flex", padding: "0px", margin: "0px" }}>
        {children}
      </body>
    </html>
  );
}
