import { useEffect, useState } from "react";
import { fetchArticles } from "../api/articles";
import ArticleCard from "../components/ArticleCard";
import { CircularProgress, Snackbar, Alert } from "@mui/material";
import { motion } from "framer-motion";
import ArticleModal from "../components/ArticleModal";
import AddArticleModal from "../components/AddArticleModal";
import AddArticleButton from "../components/AddArticleButton";

export default function Articles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [openAdd, setOpenAdd] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: "", type: "success" });

  useEffect(() => {
    fetchArticles()
      .then((res) => {
        setArticles(res.data.articles);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleAddSuccess = (newArticle) => {
    setArticles((prev) => [newArticle, ...prev]);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <CircularProgress size={60} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-6 lg:px-16 py-10">
      {/* Page Header */}
      <div className="mb-10 flex items-start justify-between gap-6">
        {/* Left Content */}
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            Articles Overview
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            Original and updated articles powered by BeyondChats
          </p>
        </div>

        {/* Right Button */}
        <AddArticleButton onClick={() => setOpenAdd(true)} />
      </div>

      {/* Cards Grid */}
      <div className="grid gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {articles.map((article, index) => (
          <motion.div
            key={article._id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}>
            <ArticleCard
              article={article}
              key={article._id}
              onClick={() => setSelectedArticle(article)}
            />
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      {/* <ArticleModal
        open={Boolean(selectedArticle)}
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
        sx={{
          backdropFilter: "blur(6px)",
          backgroundColor: "rgba(0,0,0,0.3)",
        }}
      /> */}
      <ArticleModal
        open={open}
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
        onEdit={(article) => console.log("Edit:", article)}
        onDelete={(id) => console.log("Delete:", id)}
      />

      <AddArticleModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSuccess={handleAddSuccess}
        setSnack={setSnack}
      />

      {/* 🔔 SNACKBAR */}
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
    </motion.div>
  );
}
