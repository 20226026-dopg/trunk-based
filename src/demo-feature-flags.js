/**
 * Demo Feature Flags - Triển khai thuần (không cần GrowthBook)
 *
 * Minh họa cách Feature Flags hoạt động trong Trunk-based Development:
 * - Code mới được merge vào trunk nhưng ẩn sau flag
 * - Có thể bật/tắt feature mà không cần deploy lại
 * - Rollout dần dần cho từng nhóm users
 */

const { FeatureFlagService } = require("./feature-flag-service");

// ═══════════════════════════════════════════════
// KHỞI TẠO FEATURE FLAGS
// ═══════════════════════════════════════════════

const flags = new FeatureFlagService();

// Đăng ký các feature flags
flags
  .register("new-search-engine", false, "Thuật toán search mới (Elasticsearch)")
  .register("dark-mode", true, "Giao diện Dark Mode")
  .register("ai-recommendations", false, "Gợi ý sản phẩm bằng AI")
  .register("one-click-checkout", false, "Thanh toán 1 click");

// ═══════════════════════════════════════════════
// CẤU HÌNH TARGETING RULES
// ═══════════════════════════════════════════════

// AI Recommendations: Chỉ bật cho nhóm beta testers
flags.addUserWhitelist("ai-recommendations", ["user-beta-1", "user-beta-2", "user-beta-3"]);

// New Search: Rollout 30% users
flags.addPercentageRollout("new-search-engine", 30);

// One-click checkout: Chỉ bật cho premium users
flags.addRule("one-click-checkout", (context) => {
  if (context.plan === "premium") return true;
  return undefined; // fallback to default
});

// ═══════════════════════════════════════════════
// SIMULATED APPLICATION CODE
// ═══════════════════════════════════════════════

/**
 * Mô phỏng trang Search - code cũ và mới cùng tồn tại
 * Đây là pattern chính của Feature Flags trong Trunk-based Dev
 */
function handleSearch(query, userContext) {
  // 🔀 Feature Flag quyết định logic nào được chạy
  if (flags.isEnabled("new-search-engine", userContext)) {
    return searchWithElasticsearch(query);
  } else {
    return searchWithSQL(query);
  }
}

function searchWithSQL(query) {
  return `[SQL Search] Tìm "${query}" bằng LIKE query (cũ)`;
}

function searchWithElasticsearch(query) {
  return `[Elasticsearch] Tìm "${query}" bằng full-text search (mới, nhanh hơn 10x)`;
}

/**
 * Mô phỏng trang sản phẩm - có/không có AI recommendations
 */
function renderProductPage(productId, userContext) {
  let page = `📦 Product #${productId}`;

  // ✨ Feature mới ẩn sau flag
  if (flags.isEnabled("ai-recommendations", userContext)) {
    page += ` | 🤖 AI gợi ý: ["Sản phẩm A", "Sản phẩm B", "Sản phẩm C"]`;
  }

  // 🛒 Checkout button phụ thuộc flag
  if (flags.isEnabled("one-click-checkout", userContext)) {
    page += ` | ⚡ [Mua ngay 1-Click]`;
  } else {
    page += ` | 🛒 [Thêm vào giỏ hàng]`;
  }

  return page;
}

/**
 * Mô phỏng theme
 */
function getTheme(userContext) {
  return flags.isEnabled("dark-mode", userContext) ? "🌙 Dark Mode" : "☀️ Light Mode";
}

// ═══════════════════════════════════════════════
// CHẠY DEMO
// ═══════════════════════════════════════════════

function runDemo() {
  console.log("╔══════════════════════════════════════════════════════╗");
  console.log("║     🚩 FEATURE FLAGS DEMO (Trunk-based Dev)        ║");
  console.log("╚══════════════════════════════════════════════════════╝\n");

  // Hiển thị tất cả flags
  console.log("━━━━ Danh sách Feature Flags ━━━━");
  for (const flag of flags.listFlags()) {
    const icon = flag.enabled ? "✅" : "❌";
    console.log(`  ${icon} ${flag.key} - ${flag.description}`);
  }
  console.log();

  // Mô phỏng các loại user khác nhau
  const users = [
    { userId: "user-regular-1", plan: "free",    label: "Regular User (Free)" },
    { userId: "user-beta-2",    plan: "free",    label: "Beta Tester (Free)" },
    { userId: "user-premium-1", plan: "premium", label: "Premium User" },
    { userId: "user-beta-1",    plan: "premium", label: "Beta Tester (Premium)" },
  ];

  for (const user of users) {
    console.log(`━━━━ 👤 ${user.label} (${user.userId}) ━━━━`);

    // Theme
    console.log(`  Theme: ${getTheme(user)}`);

    // Search
    console.log(`  ${handleSearch("laptop gaming", user)}`);

    // Product page
    console.log(`  ${renderProductPage("LAPTOP-001", user)}`);

    console.log();
  }

  // ═══════════════════════════════════════════════
  // DEMO: THAY ĐỔI FLAGS RUNTIME (không cần redeploy!)
  // ═══════════════════════════════════════════════
  console.log("━━━━ 🔄 Thay đổi flags lúc runtime ━━━━");
  console.log("  → Bật 'one-click-checkout' cho tất cả...");
  flags.enable("one-click-checkout");
  console.log("  → Tắt 'dark-mode'...");
  flags.disable("dark-mode");
  console.log();

  const regularUser = { userId: "user-regular-1", plan: "free" };
  console.log(`━━━━ 👤 Regular User SAU KHI thay đổi flags ━━━━`);
  console.log(`  Theme: ${getTheme(regularUser)}`);
  console.log(`  ${renderProductPage("LAPTOP-001", regularUser)}`);
  console.log();

  console.log("✅ Demo hoàn tất! Feature Flags cho phép bật/tắt tính năng");
  console.log("   mà KHÔNG cần deploy lại code.\n");
}

runDemo();
