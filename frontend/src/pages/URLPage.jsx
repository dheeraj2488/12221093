import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Container,
  Typography,
  Paper,
  CircularProgress,
} from "@mui/material";

const URLPage = () => {
  const [urls, setUrls] = useState([]);

  const fetchStats = async () => {
    try {
      const res = await axios.get("http://localhost:5050/urls");
        console.log("Fetched URLs:", res.data);
      setUrls(res.data);
    } catch (err) {
      console.error("Failed to load statistics:", err);
    } 
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        URL Statistics
      </Typography>

      {urls.length === 0 ? (
        <Typography>No URLs found.</Typography>
      ) : (
        urls.map((url, index) => (
          <Paper key={index} sx={{ p: 2, mb: 3 }} elevation={2}>
            <Typography><strong>Original URL:</strong> {url.url}</Typography>
            <Typography>
              <strong>Short URL:</strong>{" "}
              <a href={url.shortUrl} target="_blank" rel="noreferrer">
                {url.shortUrl}
              </a>
            </Typography>
            <Typography>
              <strong>Created:</strong> {new Date(url.createdAt).toLocaleString()}
            </Typography>
            <Typography>
              <strong>Expires:</strong> {new Date(url.validity).toLocaleString()}
            </Typography>
            <Typography>
              <strong>Total Clicks:</strong> {url.clicks.length}
            </Typography>

            <Box mt={2}>
              <Typography variant="subtitle1">Click Details:</Typography>
              {url.clicks.length === 0 ? (
                <Typography fontSize={14} color="text.secondary">No clicks yet.</Typography>
              ) : (
                url.clicks.map((click, i) => (
                  <Box key={i} className="click-box">
                    <Typography fontSize={14}>
                      • {new Date(click.timestamp).toLocaleString()}
                      {" "}from <strong>{click.referrer || "Direct"}</strong>
                    </Typography>
                  </Box>
                ))
              )}
            </Box>
          </Paper>
        ))
      )}
    </Container>
  );
};

export default URLPage;
