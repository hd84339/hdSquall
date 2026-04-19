import * as React from "react";
import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  Paper,
  Box,
  Grid,
  Typography,
  Snackbar,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

const theme = createTheme();

export default function Authentication() {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [formState, setFormState] = React.useState(0);
  const [open, setOpen] = React.useState(false);

  const navigate = useNavigate();
  const { handleRegister, handleLogin } = React.useContext(AuthContext);

  const handleAuth = async () => {
    try {
      if (formState === 0) {
        await handleLogin(username, password);
        navigate("/home");
      } else {
        const msg = await handleRegister(name, username, password);
        setMessage(msg);
        setOpen(true);
        setFormState(0);
      }
    } catch (err) {
      setError(err.response?.data || err.message);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Grid container component="main" sx={{ height: "100vh" }}>
        <CssBaseline />

        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage:
              "url(https://source.unsplash.com/1600x900/?technology)",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={8} square>
          <Box
            sx={{
              my: 10,
              mx: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Avatar sx={{ mb: 2, bgcolor: "primary.main" }}>
              <LockOutlinedIcon />
            </Avatar>

            <Typography variant="h5" fontWeight={600}>
              Welcome Back
            </Typography>

            <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
              <Button
                variant={formState === 0 ? "contained" : "outlined"}
                size="small"
                onClick={() => setFormState(0)}
              >
                Sign In
              </Button>
              <Button
                variant={formState === 1 ? "contained" : "outlined"}
                size="small"
                onClick={() => setFormState(1)}
              >
                Sign Up
              </Button>
            </Box>

            <Box sx={{ width: "100%" }}>
              {formState === 1 && (
                <TextField
                  fullWidth
                  label="Full Name"
                  margin="normal"
                  onChange={(e) => setName(e.target.value)}
                />
              )}

              <TextField
                fullWidth
                label="Username"
                margin="normal"
                onChange={(e) => setUsername(e.target.value)}
              />

              <TextField
                fullWidth
                label="Password"
                type="password"
                margin="normal"
                onChange={(e) => setPassword(e.target.value)}
              />

              {error && <Typography color="error">{error}</Typography>}

              <Button
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 3 }}
                onClick={handleAuth}
              >
                {formState === 0 ? "Sign In" : "Sign Up"}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>

      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={() => setOpen(false)}
        message={message}
      />
    </ThemeProvider>
  );
}
