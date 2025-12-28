import { Card, CardContent, Chip, Typography } from "@mui/material";
import { motion } from "framer-motion";

export default function ArticleCard({ article }) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300 }}>
      <Card
        className="h-full rounded-3xl"
        sx={{
          minHeight: 280,
          padding: 2,
          boxShadow: "0px 20px 40px rgba(0, 0, 0, 0.08)",
        }}>
        <CardContent className="flex flex-col gap-4">
          <Typography variant="h5" fontWeight={700} lineHeight={1.3}>
            {article.title}
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ flexGrow: 1 }}>
            {article.content?.slice(0, 220)}...
          </Typography>

          <div className="flex justify-between items-center">
            <Typography variant="caption" color="text.secondary">
              BeyondChats
            </Typography>

            {article.updated && (
              <Chip label="Updated" color="success" sx={{ fontWeight: 600 }} />
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
