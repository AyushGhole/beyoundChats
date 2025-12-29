import {
  Dialog,
  DialogContent,
  TextField,
  Button,
  IconButton,
  Typography,
  Box,
  Stack,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArticleIcon from "@mui/icons-material/Article";
import axios from "axios";
import { useState } from "react";
import { motion } from "framer-motion";

const BASE_URL = "https://beyoundchats-backend.onrender.com/api";

export default function AddArticleModal({
  open,
  onClose,
  onSuccess,
  setSnack,
}) {
  const [form, setForm] = useState({
    title: "",
    content: "",
    url: "",
  });

  const handleSubmit = async () => {
    console.log("Article form :", form);
    try {
      const res = await axios.post(`${BASE_URL}/create`, form);

      console.log(res);

      setSnack({
        open: true,
        msg: "Article published successfully",
        type: "success",
      });

      onClose();

      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1000);
    } catch (err) {
      setSnack({
        open: true,
        msg: "Failed to publish article",
        type: "error",
      });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: "22px",
          overflow: "hidden",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.95), rgba(245,247,250,0.95))",
          boxShadow: "0 30px 80px rgba(0,0,0,0.25)",
        },
      }}>
      <DialogContent sx={{ p: 0 }}>
        {/*  Animated Container */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: "easeOut" }}>
          {/* HEADER */}
          <Box
            sx={{
              px: 4,
              py: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "linear-gradient(135deg, #6366f1, #4f46e5)",
              color: "#fff",
            }}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <ArticleIcon fontSize="large" />
              <Typography variant="h5" fontWeight={700}>
                Add New Article
              </Typography>
            </Box>

            <IconButton onClick={onClose} sx={{ color: "#fff" }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* FORM */}
          <Box px={4} py={4}>
            <Stack spacing={3}>
              <TextField
                label="Article Title"
                placeholder="Enter a compelling title"
                fullWidth
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />

              <TextField
                label="Article Content"
                placeholder="Write or paste the article content here…"
                fullWidth
                multiline
                minRows={6}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
              />

              <TextField
                label="Original Article URL"
                placeholder="https://example.com/article"
                fullWidth
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
              />

              {/* CTA */}
              <Button
                variant="contained"
                size="large"
                onClick={handleSubmit}
                sx={{
                  mt: 1,
                  py: 1.4,
                  fontSize: "1rem",
                  fontWeight: 600,
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                  boxShadow: "0 12px 30px rgba(79,70,229,0.4)",
                  "&:hover": {
                    transform: "translateY(-1px)",
                    boxShadow: "0 16px 40px rgba(79,70,229,0.55)",
                  },
                }}>
                Publish Article
              </Button>
            </Stack>
          </Box>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
