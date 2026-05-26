const fs = require("fs");
const path = require("path");
const pdf2json = require("pdf2json");
const XLSX = require("xlsx");
require("dotenv/config");
const Anthropic = require("@anthropic-ai/sdk");

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const DOCS_DIR = "./docs/input";
const OUTPUT_FILE = "./openapi/generated.yaml";

async function readFile(filePath, fileName) {
  const ext = path.extname(fileName).toLowerCase();
  if (ext === ".pdf") {
    return new Promise((resolve, reject) => {
      const parser = new pdf2json();
      parser.on("pdfParser_dataReady", (data) => {
        const text = data.Pages.flatMap((page) => page.Texts)
          .map((t) => {
            try {
              return decodeURIComponent(t.R.map((r) => r.T).join(""));
            } catch {
              return t.R.map((r) => r.T).join("");
            }
          })
          .join(" ");
        resolve(text);
      });
      parser.on("pdfParser_dataError", reject);
      parser.loadPDF(filePath);
    });
  }
  if (ext === ".xlsx" || ext === ".xls") {
    const workbook = XLSX.readFile(filePath);
    let content = "";
    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      content += `\n--- Sheet: ${sheetName} ---\n`;
      content += XLSX.utils.sheet_to_csv(sheet);
    }
    return content;
  }
  return fs.readFileSync(filePath, "utf-8");
}

async function readDocs() {
  const files = fs.readdirSync(DOCS_DIR);
  if (files.length === 0) {
    throw new Error(`Không có file nào trong ${DOCS_DIR}`);
  }
  const results = [];
  for (const file of files) {
    const filePath = path.join(DOCS_DIR, file);
    console.log(`📄 Đang đọc: ${file}`);
    const content = await readFile(filePath, file);
    results.push({ name: file, content });
  }
  return results;
}

async function generateOpenAPI(docs) {
  const docsText = docs
    .map((d) => `=== ${d.name} ===\n${d.content}`)
    .join("\n\n");

  const prompt = `Dựa vào tài liệu sau, hãy render ra file OpenAPI 3.1 YAML.
Chỉ trả về YAML thuần túy, không giải thích, không markdown backticks.
Yêu cầu:
- Đúng chuẩn OpenAPI 3.1
- operationId dùng camelCase (vd: listUsers, createOrder)
- Mọi schema field phải có description
- Server fields (id, created_at, updated_at) phải có readOnly: true
- Enum phải có description giải thích từng giá trị
- Mọi private endpoint phải có response 401 và 403
- Tách schema ra components/schemas, dùng $ref
Tài liệu:
${docsText}`;

  console.log("⏳ Đang generate, có thể mất 1-2 phút...\n");

  let fullText = "";
  const stream = anthropic.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 32000,
    messages: [{ role: "user", content: prompt }],
  });

  stream.on("text", (text) => {
    process.stdout.write(".");
    fullText += text;
  });

  const final = await stream.finalMessage();
  console.log(
    `\n📊 Tokens: input=${final.usage.input_tokens}, output=${final.usage.output_tokens}`,
  );

  if (final.stop_reason === "max_tokens") {
    console.warn("⚠️  Output bị cắt do max_tokens! Hãy tăng max_tokens lên.");
  }

  let yaml = fullText.trim();
  if (yaml.startsWith("```")) {
    yaml = yaml
      .replace(/^```[a-z]*\n?/, "")
      .replace(/```$/, "")
      .trim();
  }
  return yaml;
}

async function main() {
  console.log("🚀 Bắt đầu generate OpenAPI...\n");
  const docs = await readDocs();
  console.log(`\n✅ Đọc xong ${docs.length} file. Đang gọi AI...\n`);
  const yaml = await generateOpenAPI(docs);
  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, yaml);
  console.log(`\n✅ Đã tạo: ${OUTPUT_FILE}`);
  console.log("👉 Chạy tiếp: npm run bundle:api");
}

main().catch((err) => {
  console.error("❌ Lỗi:", err.message);
  process.exit(1);
});
