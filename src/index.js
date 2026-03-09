/**
 * Trunk-based Development + Feature Flags + GrowthBook
 * ═══════════════════════════════════════════════════
 *
 * Chương trình tổng hợp - chạy tất cả demos.
 *
 * Cách chạy:
 *   npm start                  → Chạy tất cả demos
 *   npm run demo:trunk         → Demo workflow trunk-based
 *   npm run demo:flags         → Demo feature flags thuần
 *   npm run demo:growthbook    → Demo GrowthBook SDK
 */

const DIVIDER = "\n" + "═".repeat(60) + "\n";

async function main() {
  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║                                                        ║");
  console.log("║   📚 HƯỚNG DẪN: Trunk-based Development               ║");
  console.log("║      Feature Flags & GrowthBook                        ║");
  console.log("║                                                        ║");
  console.log("╚══════════════════════════════════════════════════════════╝");

  console.log(`
  Chương trình này gồm 3 phần:

  1️⃣  Trunk-based Development Workflow
      → Hiểu quy trình làm việc, cách merge code vào trunk

  2️⃣  Feature Flags (tự triển khai)
      → Hiểu cơ chế bật/tắt tính năng, targeting, rollout

  3️⃣  GrowthBook SDK Integration
      → Sử dụng GrowthBook cho Feature Flags & A/B Testing

  Chạy từng phần riêng:
    npm run demo:trunk       → Phần 1
    npm run demo:flags       → Phần 2
    npm run demo:growthbook  → Phần 3
  `);

  // PART 1: Trunk-based Workflow
  console.log(DIVIDER);
  console.log("  📖 PHẦN 1: TRUNK-BASED DEVELOPMENT WORKFLOW");
  console.log(DIVIDER);
  require("./demo-trunk-workflow");

  // PART 2: Feature Flags
  console.log(DIVIDER);
  console.log("  📖 PHẦN 2: FEATURE FLAGS (Tự triển khai)");
  console.log(DIVIDER);
  require("./demo-feature-flags");

  // PART 3: GrowthBook (chỉ chạy nếu đã install)
  console.log(DIVIDER);
  console.log("  📖 PHẦN 3: GROWTHBOOK SDK");
  console.log(DIVIDER);
  try {
    require("./demo-growthbook");
  } catch (err) {
    console.log("  ⚠️  Chưa install GrowthBook SDK.");
    console.log("  Chạy: npm install");
    console.log(`  Lỗi: ${err.message}\n`);
  }
}

main().catch(console.error);
