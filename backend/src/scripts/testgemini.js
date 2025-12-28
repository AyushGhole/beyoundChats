const axios = require("axios");

async function testGemini() {
  try {
    const res = await axios.post(
      "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=" +
        process.env.GEMINI_API_KEY,
      {
        contents: [
          {
            parts: [{ text: "Say hello in one sentence" }],
          },
        ],
      }
    );

    console.log(res.data.candidates[0].content.parts[0].text);
  } catch (err) {
    console.error("ERROR:", err.response?.data || err.message);
  }
}

testGemini();
