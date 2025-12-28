import { AppBar, Toolbar, Typography } from "@mui/material";

export default function Navbar() {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: "#1a1827ff",
        borderBottom: "1px solid #eee",
      }}>
      <Toolbar className="px-6 lg:px-16 h-20">
        <Typography variant="h5" fontWeight={800} letterSpacing={0.5}>
          BeyondChats
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
