import { mkdir, writeFile } from "node:fs/promises";

const n = (text, children = []) => ({ text, children });
const categories = [
  { name: "譜面作成", slug: "sheet-music", articles: [
    ["MuseScoreのすすめ", [n("インストール方法"), n("設定、テンプレート、ファイル管理"), n("他人に見せるために使い始めよう")]],
    ["ベース耳コピのコツ", [n("オクターブ拡張機能"), n("Stream Deck Pedalやアプリ")]],
    ["ココナラ販売", [n("販売実績")]],
    ["Piascore販売", [n("必要な手続き"), n("販売実績"), n("曲推薦")]],
  ]},
  { name: "ベース演奏", slug: "bass", articles: [
    ["使用機材", [n("ベース、エフェクター"), n("欲しい機材")]],
    ["弾いてみた動画制作", [n("撮影編集手順、プラグイン紹介"), n("動画の変遷")]],
    ["ベース練習方法", []],
    ["軽音部ライブ履歴", []],
  ]},
  { name: "音楽", slug: "music", articles: [
    ["お気に入りの曲", []],
    ["Studio One", [n("作曲"), n("同期音源制作")]],
  ]},
  { name: "電子工作", slug: "electronics", articles: [
    ["部品庫", [n("ArduinoとOLEDディスプレイ")]],
    ["作ったもの", [n("4PDTスイッチ"), n("扇風琴")]],
    ["アイデア", [n("マルチストンプ改造", [n("中身を入れ替える"), n("外装を変えてスマート化")])]],
    ["PCB設計", [n("Altium", [n("よく使うショートカット")])]],
  ]},
  { name: "プログラミング", slug: "programming", articles: [
    ["ChatGPT Plus", [n("スケジュール", [n("曜日ごとのニュース"), n("曲推薦"), n("権利確認")])]],
    ["OpenAI API", []],
    ["iPhoneショートカット", []],
    ["GitHub公開リポジトリの解説", [n("ルービックキューブ楽器", [n("作った理由")]), n("ローマ字変換アプリ"), n("Blackfinツリー")]],
    ["ベース採譜自動化プロジェクト", [n("Demucs"), n("Librosa"), n("機械学習")]],
    ["大学での研究内容", [n("赤外線通信の多重化"), n("深度推定の敵対的サンプル")]],
    ["Blackfin", [n("OTT")]],
    ["Python", [n("tkinter"), n("venvからuvに移行したい")]],
  ]},
  { name: "ガジェット", slug: "gadgets", articles: [
    ["iPhone Airを買いました", [n("フチがなめらか"), n("機種変更、初期設定の注意点"), n("写真やデータの管理"), n("歴史と原価償却")]],
    ["Vivobook S 16を買いました", [n("Windows初期設定", [n("AHKカスタム、スタートアップ"), n("この機会にアプリを整理"), n("バックアップしておくべきデータ、設定")]), n("Surface Laptop 3の容態、歴史、バッテリーレポート"), n("ローカルAIテスト"), n("ゲーム性能テスト")]],
    ["エレコム", [n("キーボード"), n("マウス")]],
    ["Anker", [n("充電器、ケーブル")]],
    ["4Kモニター", []],
    ["オーディオインターフェース", []],
    ["スピーカー", []],
    ["イヤホン・AirPods Pro 3", []],
    ["スマートホーム", []],
  ]},
  { name: "生活のこだわり", slug: "lifestyle", articles: [
    ["身だしなみ", [n("靴：GUからオニツカへ"), n("G-SHOCK")]],
    ["持ち物", []],
    ["メルカリ", []],
    ["自炊", []],
    ["掃除", []],
    ["洗濯", []],
    ["編み物", []],
    ["人形", []],
    ["財政", [n("楽天家計簿"), n("楽天証券", [n("NISA"), n("株")]), n("ふるさと納税")]],
  ]},
  { name: "ゲーム", slug: "games", articles: [
    ["Steam", [n("実績の達成率")]],
    ["Switch 2", []],
    ["スマホゲーム", [n("原神"), n("Sky"), n("パズドラ")]],
    ["過去にやったゲーム", []],
    ["ゲーム制作", []],
  ]},
  { name: "勉強", slug: "study", articles: [
    ["国語・算数・理科・社会", []],
  ]},
  { name: "充実した休日", slug: "days-off", articles: [
    ["大阪・品川", [n("旅程、写真")]],
    ["まどマギ映画", []],
    ["ストリートスナップと靴磨き", []],
  ]},
  { name: "その他", slug: "misc", articles: [
    ["誕生日プレゼント", []],
    ["クリスマスプレゼント", []],
    ["キリバンゲッター", []],
    ["ChatGPTに予想してもらったプロフィール・MBTI", []],
    ["ミニゲームコーナー", []],
  ]},
];

const toOutline = (notes, depth = 0) => notes.map((note) => `${"  ".repeat(depth)}- ${note.text}\n${toOutline(note.children, depth + 1)}`).join("");
const safeTitle = (value) => value.replaceAll("\n", " ");

await mkdir("articles", { recursive: true });

for (let categoryIndex = 0; categoryIndex < categories.length; categoryIndex += 1) {
  const category = categories[categoryIndex];
  category.articles = category.articles.map(([title, notes], articleIndex) => {
    const file = `articles/${String(categoryIndex + 1).padStart(2, "0")}-${category.slug}-${String(articleIndex + 1).padStart(2, "0")}.md`;
    return { title, notes, file };
  });
}

let contents = `---\ntitle: 全記事目次\n---\n\n# 全記事目次\n\n> 大分類、記事、執筆メモの順に整理しています。\n\n`;
for (const category of categories) {
  contents += `## ${category.name}\n\n`;
  for (const article of category.articles) {
    contents += `- [${article.title}](article.html?path=${article.file})\n`;
    contents += toOutline(article.notes, 1);
  }
  contents += "\n";
}
await writeFile("contents.md", contents, "utf8");

for (const category of categories) {
  for (const article of category.articles) {
    const noteSection = article.notes.length
      ? `## 執筆メモ\n\n${toOutline(article.notes)}`
      : "## 執筆メモ\n\nメモはまだありません。\n";
    const markdown = `---\ntitle: ${safeTitle(article.title)}\ncategory: ${category.name}\n---\n\n# ${article.title}\n\n> [${category.name}の記事一覧へ戻る](./index.html#category-${category.slug})\n\n${noteSection}\n## 本文\n\nここに本文を記述\n`;
    await writeFile(article.file, markdown, "utf8");
  }
}

await writeFile("content-data.js", `window.SITE_CONTENT = ${JSON.stringify({ categories }, null, 2)};\n`, "utf8");
console.log(`${categories.length} categories / ${categories.reduce((sum, category) => sum + category.articles.length, 0)} articles generated.`);
