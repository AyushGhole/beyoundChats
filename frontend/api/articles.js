import axios from "axios";

const API = axios.create({
  baseURL: "https://beyoundchats-backend.onrender.com/api",
});

export const fetchArticles = () => API.get("/fetch/articles");
