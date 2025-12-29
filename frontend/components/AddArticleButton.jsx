import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

export default function AddArticleButton({ onClick }) {
  return (
    <div className="flex justify-end mb-6">
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={onClick}
        sx={{
          borderRadius: "30px",
          padding: "10px 22px",
          fontWeight: 600,
        }}>
        Add Article
      </Button>
    </div>
  );
}
