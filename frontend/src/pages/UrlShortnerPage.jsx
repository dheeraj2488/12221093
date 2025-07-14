import React, { useState } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  Typography,
  Container,
  Box,
} from "@mui/material";


function App() {
  const [urls, setUrls] = useState([
    { url: "", shortcode: "", validity: "" },
  ]);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  const handleChange = (index, field, value) => {
    const updated = [...urls];
    updated[index][field] = value;
    setUrls(updated);
  };

  const addField = () => {
    if (urls.length < 5) {
      setUrls([...urls, { url: "", shortcode: "", validity: "" }]);
    }
  };

  const handleSubmit = async () => {

    setError("");
    setResults([]);
    setUrls([{ url: "", shortcode: "", validity: "" }]);

    console.log("Submitting URLs:", urls);
    
    const requests = urls.map((entry) =>
      axios.post("http://localhost:5050/shorturls", {
        url: entry.url,
        shortcode: entry.shortcode || undefined,
        validity: entry.validity ? parseInt(entry.validity) : undefined,
      })
    );

    try {
      const responses = await Promise.all(requests);
      setResults(
        responses.map((res, i) => ({
          originalUrl: urls[i].url,
          shortUrl: res.data.shortUrl,
          expiry: res.data.validity,
        }))
      );
    } catch (err) {
        console.error("Error shortening URLs:", err);
        if (err.response && err.response.status === 409) {
            setError("Shortcode already in use. Please use unique shortcodes.");
          } else {
            setError("Some URLs failed. Check inputs.");
          }
      
    }
  };

  return (
    <Container maxWidth="md" className="container">
      <Typography variant="h4" align="center" gutterBottom>
        Simple URL Shortener
      </Typography>

      {urls.map((entry, index) => (
        <Box key={index} className="url-box">
          <TextField
            label="Original URL"
            value={entry.url}
            onChange={(e) => handleChange(index, "url", e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Custom Shortcode (optional)"
            value={entry.shortcode}
            onChange={(e) => handleChange(index, "shortcode", e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Validity (minutes, optional)"
            type="number"
            value={entry.validity}
            onChange={(e) => handleChange(index, "validity", e.target.value)}
            fullWidth
            margin="normal"
          />
        </Box>
      ))}

      {urls.length < 5 && (
        <Button variant="outlined" onClick={addField} style={{ marginTop: "10px" }}>
          + Add Another URL
        </Button>
      )}

      <Box mt={3}>
        <Button variant="contained" onClick={handleSubmit}>
          Shorten URLs
        </Button>
      </Box>

      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

    </Container>
  );
}

export default App;
