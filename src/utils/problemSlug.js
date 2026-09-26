export const slugFromLink = (link) => {
  if (!link || typeof link !== "string") return "";
  try {
    const m = link.match(/\/problems\/([^\/?#]+)/i);
    if (m && m[1]) return m[1].toLowerCase();
    const parts = link.split("/").filter(Boolean);
    const last = (parts[parts.length - 1] || "").toLowerCase();
    if (
      ["description", "solution", "solutions", "submissions", "discussion"].includes(
        last
      )
    ) {
      return (parts[parts.length - 2] || "").toLowerCase();
    }
    return last;
  } catch {
    return "";
  }
};

export const slugifyTitle = (title) =>
  (title || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const getProblemSlug = (problem) => {
  const fromLink = slugFromLink(problem?.link);
  if (fromLink) return fromLink;
  const t = problem?.title || "";
  if (!t) return "";
  return t.includes("-") || t === t.toLowerCase() ? t.toLowerCase() : slugifyTitle(t);
};
