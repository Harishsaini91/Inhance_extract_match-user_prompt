// H:\Brain_api\brain\server\stage3\enhancers\freeEnhancer.js

module.exports = async function freeEnhancer(input) {
  const text = input.cleanedText || "";

  const keywords = text
    .toLowerCase()
    .split(/\W+/)
    .filter(w => w.length > 4)
    .slice(0, 5);

  return {
    enhancedText: text,
    keywords,
    category: "general",
  };
};
