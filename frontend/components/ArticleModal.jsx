import {
  Dialog,
  DialogContent,
  IconButton,
  Typography,
  Chip,
  Tooltip,
  Box,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CallMadeIcon from "@mui/icons-material/CallMade";
import { motion } from "framer-motion";
import axios from "axios";
import { useState, useEffect } from "react";

export default function ArticleModal({ open, onClose, article, refresh }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [snack, setSnack] = useState({ open: false, msg: "", type: "success" });

  const BASE_URL = "https://beyoundchats-backend.onrender.com/api";

  useEffect(() => {
    if (article) {
      setTitle(article.title);
      setContent(article.content);
      setIsEditing(false);
    }
  }, [article]);

  if (!article) return null;

  console.log(article);

  /* UPDATE */
  const handleUpdate = async () => {
    try {
      await axios.put(`${BASE_URL}/update/${article._id}`, {
        title,
        content,
      });

      setSnack({
        open: true,
        msg: "Article updated successfully",
        type: "success",
      });

      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1000);

      setIsEditing(false);
    } catch (err) {
      setSnack({
        open: true,
        msg: "Update failed",
        type: "error",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${BASE_URL}/delete/${article._id}`);

      // SHOW SNACKBAR FIRST
      setSnack({
        open: true,
        msg: "Article deleted successfully",
        type: "success",
      });

      // CLOSE MODAL AFTER A TICK

      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1000);
    } catch (err) {
      setSnack({
        open: true,
        msg: "Delete failed",
        type: "error",
      });
    }
  };
  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: "22px",
            padding: "1rem",
            position: "relative",
          },
        }}>
        <DialogContent sx={{ pb: 10 }}>
          {/* Close */}
          <IconButton
            onClick={onClose}
            sx={{ position: "absolute", top: 14, right: 14 }}>
            <CloseIcon />
          </IconButton>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}>
            {/* TITLE */}
            {isEditing ? (
              <TextField
                fullWidth
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                variant="standard"
                sx={{ mb: 2 }}
              />
            ) : (
              <Typography variant="h4" fontWeight={800}>
                {article.title}
              </Typography>
            )}

            <div className="flex mt-4 gap-2 mb-4">
              <Chip label="BeyondChats" size="small" />
            </div>

            {/* CONTENT */}
            {isEditing ? (
              <TextField
                multiline
                fullWidth
                minRows={8}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            ) : (
              article.content
                .split("\n")
                .filter(Boolean)
                .map((line, i) => (
                  <Typography key={i} sx={{ mb: 1 }}>
                    {line}
                  </Typography>
                ))
            )}
          </motion.div>

          {/* FLOATING ACTION BAR */}
          <Box
            sx={{
              position: "absolute",
              bottom: 20,
              right: 20,
              display: "flex",
              gap: 1,
              px: 1.5,
              py: 1,
              borderRadius: "18px",
              backdropFilter: "blur(10px)",
              background: "rgba(255,255,255,0.9)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            }}>
            {isEditing ? (
              <Tooltip title="Save Changes">
                <IconButton color="success" onClick={handleUpdate}>
                  <SaveIcon />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Edit Article">
                <IconButton
                  onClick={() => setIsEditing(true)}
                  sx={{
                    color: "yellow",
                  }}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
            )}

            <Tooltip title="Delete Article">
              <IconButton color="error" onClick={handleDelete}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>

            {article.url && (
              <Tooltip title="Open Original Article">
                <IconButton
                  component="a"
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: "blue",
                  }}>
                  <CallMadeIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      {/* SNACKBAR */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert
          onClose={() => setSnack({ ...snack, open: false })}
          severity={snack.type}
          variant="filled"
          sx={{
            borderRadius: "12px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
            fontWeight: 500,
            alignItems: "center",
          }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </>
  );
}
