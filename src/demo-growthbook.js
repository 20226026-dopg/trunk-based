/**
 * GrowthBook Integration - Hướng dẫn tích hợp GrowthBook
 *
 * GrowthBook là nền tảng Feature Flag & A/B Testing mã nguồn mở.
 * File này demo cách sử dụng GrowthBook SDK trong Node.js.
 */

const { GrowthBook } = require("@growthbook/growthbook");

/**
 * Tạo GrowthBook instance với cấu hình
 *
 * Trong production, bạn sẽ kết nối tới GrowthBook server/cloud.
 * Ở đây ta dùng features inline để demo.
 */
function createGrowthBookInstance(userAttributes = {}) {
  const gb = new GrowthBook({
    // ===== CẤU HÌNH CƠ BẢN =====

    // API Host - URL của GrowthBook server
    // apiHost: "https://cdn.growthbook.io",

    // Client Key - lấy từ GrowthBook dashboard
    // clientKey: "sdk-abc123",

    // ===== FEATURES ĐỊNH NGHĨA INLINE (cho demo) =====
    features: {
      // Feature Flag đơn giản: bật/tắt
      "dark-mode": {
        defaultValue: false,
      },

      // Feature Flag với rules (targeting)
      "new-pricing-page": {
        defaultValue: false,
        rules: [
          {
            // Bật cho 20% users (percentage rollout)
            coverage: 0.2,
            hashAttribute: "id",
            hashVersion: 2,
          },
        ],
      },

      // Feature Flag với giá trị string (remote config)
      "checkout-button-color": {
        defaultValue: "blue",
        rules: [
          {
            // A/B test: 50% xanh, 50% đỏ
            variations: ["blue", "green"],
            weights: [0.5, 0.5],
            hashAttribute: "id",
            hashVersion: 2,
          },
        ],
      },

      // Feature Flag chỉ bật cho nhóm beta testers
      "beta-dashboard": {
        defaultValue: false,
        rules: [
          {
            condition: { country: "VN", plan: "premium" },
            force: true,
          },
        ],
      },

      // Feature Flag với JSON value (remote config phức tạp)
      "homepage-banner": {
        defaultValue: {
          show: false,
          title: "",
          message: "",
        },
        rules: [
          {
            force: {
              show: true,
              title: "🎉 Tết Sale!",
              message: "Giảm giá 50% tất cả gói Premium",
            },
            condition: { country: "VN" },
          },
        ],
      },
    },

    // ===== TRACKING CALLBACK =====
    // Gọi khi user tham gia một experiment (A/B test)
    trackingCallback: (experiment, result) => {
      console.log("📊 Experiment Tracked:", {
        experimentId: experiment.key,
        variationId: result.key,
        value: result.value,
      });
    },

    // ===== USER ATTRIBUTES =====
    attributes: userAttributes,
  });

  return gb;
}

/**
 * Demo: Sử dụng Feature Flags với GrowthBook
 */
async function demoGrowthBook() {
  console.log("╔══════════════════════════════════════════════════════╗");
  console.log("║        🧪 GROWTHBOOK - FEATURE FLAGS DEMO          ║");
  console.log("╚══════════════════════════════════════════════════════╝\n");

  // ----- Demo 1: Feature Flag đơn giản -----
  console.log("━━━━ 1. Feature Flag Đơn Giản (Boolean) ━━━━");

  const gb1 = createGrowthBookInstance({ id: "user-001" });

  const isDarkMode = gb1.isOn("dark-mode");
  console.log(`  Dark Mode enabled: ${isDarkMode}`);
  console.log(`  → Feature "dark-mode" mặc định là OFF`);
  console.log();

  gb1.destroy();

  // ----- Demo 2: Percentage Rollout -----
  console.log("━━━━ 2. Percentage Rollout (20% users) ━━━━");

  const users = ["alice", "bob", "charlie", "dave", "eve",
                 "frank", "grace", "henry", "ivy", "jack"];

  for (const userId of users) {
    const gb = createGrowthBookInstance({ id: userId });
    const hasNewPricing = gb.isOn("new-pricing-page");
    console.log(`  User "${userId}": new-pricing-page = ${hasNewPricing ? "✅ ON" : "❌ OFF"}`);
    gb.destroy();
  }
  console.log(`  → Khoảng 20% users sẽ thấy trang pricing mới\n`);

  // ----- Demo 3: A/B Test -----
  console.log("━━━━ 3. A/B Testing (Checkout Button Color) ━━━━");

  for (const userId of users.slice(0, 5)) {
    const gb = createGrowthBookInstance({ id: userId });
    const buttonColor = gb.getFeatureValue("checkout-button-color", "blue");
    console.log(`  User "${userId}": button color = ${buttonColor === "blue" ? "🔵 blue" : "🟢 green"}`);
    gb.destroy();
  }
  console.log(`  → 50/50 split giữa blue và green\n`);

  // ----- Demo 4: Conditional Targeting -----
  console.log("━━━━ 4. Conditional Targeting (Beta Dashboard) ━━━━");

  const userProfiles = [
    { id: "vn-premium-1", country: "VN", plan: "premium" },
    { id: "vn-free-1",    country: "VN", plan: "free" },
    { id: "us-premium-1", country: "US", plan: "premium" },
    { id: "us-free-1",    country: "US", plan: "free" },
  ];

  for (const profile of userProfiles) {
    const gb = createGrowthBookInstance(profile);
    const hasBeta = gb.isOn("beta-dashboard");
    console.log(`  User [${profile.country}/${profile.plan}]: beta-dashboard = ${hasBeta ? "✅ ON" : "❌ OFF"}`);
    gb.destroy();
  }
  console.log(`  → Chỉ users VN + Premium mới thấy beta dashboard\n`);

  // ----- Demo 5: Remote Config (JSON value) -----
  console.log("━━━━ 5. Remote Config (Homepage Banner) ━━━━");

  const vnUser = createGrowthBookInstance({ id: "vn-user", country: "VN" });
  const usUser = createGrowthBookInstance({ id: "us-user", country: "US" });

  const vnBanner = vnUser.getFeatureValue("homepage-banner", { show: false });
  const usBanner = usUser.getFeatureValue("homepage-banner", { show: false });

  console.log(`  VN User banner:`, vnBanner);
  console.log(`  US User banner:`, usBanner);
  console.log(`  → Banner chỉ hiển thị cho users ở Việt Nam\n`);

  vnUser.destroy();
  usUser.destroy();
}

// Chạy demo
demoGrowthBook().catch(console.error);

module.exports = { createGrowthBookInstance };
