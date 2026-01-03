// H:\Brain_api\brain\server\stage3\core\preProcessor.js

module.exports = function preProcessor(text) {
  const cleaned = text.trim().replace(/\s+/g, " ");
  const words = cleaned.toLowerCase().split(" ");

  const keywords = [...new Set(words.filter(w => w.length > 4))];

  return {
    cleanedText: cleaned,
    keywords,
  };
};
