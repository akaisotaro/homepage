(function () {
  "use strict";

  const escapeHtml = (value) => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const renderNotes = (notes) => {
    if (!notes || notes.length === 0) return "";
    return `<ul class="memo-tree">${notes.map((note) => `
      <li>${escapeHtml(note.text)}${note.children?.length ? renderNotes(note.children) : ""}</li>
    `).join("")}</ul>`;
  };

  const renderHome = () => {
    const data = window.SITE_CONTENT;
    if (!data) return;

    const categoryGrid = document.querySelector("#category-grid");
    const directory = document.querySelector("#article-directory");
    const articleCount = data.categories.reduce((sum, category) => sum + category.articles.length, 0);
    document.querySelector("#category-count").textContent = data.categories.length;
    document.querySelector("#article-count").textContent = articleCount;

    categoryGrid.innerHTML = data.categories.map((category, categoryIndex) => `
      <a class="category-card" href="#category-${category.slug}">
        <span class="category-number">${String(categoryIndex + 1).padStart(2, "0")}</span>
        <span class="category-name">${escapeHtml(category.name)}</span>
        <span class="category-meta">${category.articles.length} articles</span>
      </a>
    `).join("");

    directory.innerHTML = data.categories.map((category, categoryIndex) => `
      <section class="category-section" id="category-${category.slug}">
        <div class="category-header">
          <h3>${escapeHtml(category.name)}</h3>
          <span>${String(categoryIndex + 1).padStart(2, "0")} / ${String(category.articles.length).padStart(2, "0")} ARTICLES</span>
        </div>
        <div class="article-grid">
          ${category.articles.map((article, articleIndex) => `
            <a class="article-card" href="article.html?path=${encodeURIComponent(article.file)}">
              <div class="article-card-head">
                <span class="article-index">${String(articleIndex + 1).padStart(2, "0")}</span>
                <h4>${escapeHtml(article.title)}</h4>
                <span class="article-arrow" aria-hidden="true">↗</span>
              </div>
              ${article.notes.length ? renderNotes(article.notes) : '<p class="no-memo">本文準備中</p>'}
            </a>
          `).join("")}
        </div>
      </section>
    `).join("");
  };

  const inlineMarkdown = (value) => escapeHtml(value)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, href) => {
      const safeHref = /^(?:https?:\/\/|\.\.?\/|#|article\.html\?path=)/.test(href) ? href : "#";
      return `<a href="${escapeHtml(safeHref)}">${label}</a>`;
    })
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

  const renderMarkdown = (source) => {
    const withoutFrontMatter = source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");
    const lines = withoutFrontMatter.replaceAll("\r", "").split("\n");
    let html = "";
    let paragraph = [];
    const listDepths = [];

    const flushParagraph = () => {
      if (!paragraph.length) return;
      html += `<p>${inlineMarkdown(paragraph.join(" "))}</p>`;
      paragraph = [];
    };
    const closeLists = (targetDepth = -1) => {
      while (listDepths.length && listDepths[listDepths.length - 1] >= targetDepth) {
        html += "</li></ul>";
        listDepths.pop();
      }
    };

    for (const line of lines) {
      const listMatch = line.match(/^(\s*)-\s+(.+)$/);
      if (listMatch) {
        flushParagraph();
        const depth = Math.floor(listMatch[1].length / 2);
        while (listDepths.length && listDepths[listDepths.length - 1] > depth) {
          html += "</li></ul>";
          listDepths.pop();
        }
        if (!listDepths.length || listDepths[listDepths.length - 1] < depth) {
          html += "<ul><li>";
          listDepths.push(depth);
        } else {
          html += "</li><li>";
        }
        html += inlineMarkdown(listMatch[2]);
        continue;
      }

      closeLists();
      if (!line.trim()) { flushParagraph(); continue; }
      const heading = line.match(/^(#{1,3})\s+(.+)$/);
      if (heading) {
        flushParagraph();
        const level = heading[1].length;
        html += `<h${level}>${inlineMarkdown(heading[2])}</h${level}>`;
      } else if (line.startsWith("> ")) {
        flushParagraph();
        html += `<blockquote><p>${inlineMarkdown(line.slice(2))}</p></blockquote>`;
      } else {
        paragraph.push(line.trim());
      }
    }
    closeLists();
    flushParagraph();
    return html;
  };

  const loadArticle = async () => {
    const output = document.querySelector("#markdown-content");
    if (!output) return;
    const path = new URLSearchParams(window.location.search).get("path") || "contents.md";
    if (!/^(?:contents\.md|articles\/[a-z0-9-]+\.md)$/.test(path)) {
      output.innerHTML = '<p class="error-message">指定された記事を開けませんでした。</p>';
      return;
    }
    try {
      const response = await fetch(path);
      if (!response.ok) throw new Error("not found");
      const markdown = await response.text();
      const title = markdown.match(/^title:\s*(.+)$/m)?.[1] || markdown.match(/^#\s+(.+)$/m)?.[1] || "記事";
      const category = markdown.match(/^category:\s*(.+)$/m)?.[1];
      document.title = `${title} | homepage`;
      output.innerHTML = `${category ? `<p class="article-meta">${escapeHtml(category)}</p>` : ""}${renderMarkdown(markdown)}`;
    } catch (_error) {
      output.innerHTML = '<p class="error-message">記事を読み込めませんでした。ホームからもう一度お試しください。</p>';
    }
  };

  document.addEventListener("DOMContentLoaded", () => {
    renderHome();
    loadArticle();
  });
})();
