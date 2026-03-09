/**
 * Demo thực tế: Trunk-based workflow với Notification feature
 *
 * Mô phỏng quá trình:
 * 1. Feature mới (Notification) được code trên short-lived branch
 * 2. Bọc trong feature flag → merge vào main
 * 3. Flag OFF → users không thấy gì
 * 4. Bật flag → feature hoạt động
 * 5. Rollout dần dần
 */

const { FeatureFlagService } = require("./feature-flag-service");
const { NotificationService } = require("./notification-service");

function runDemo() {
  console.log("╔══════════════════════════════════════════════════════╗");
  console.log("║  🔔 DEMO THỰC TẾ: Notification Feature             ║");
  console.log("║     (Trunk-based + Feature Flag workflow)           ║");
  console.log("╚══════════════════════════════════════════════════════╝\n");

  // ── Setup Feature Flags ──
  const flags = new FeatureFlagService();
  flags.register("user-notifications", false, "Hệ thống thông báo cho users");

  const notifService = new NotificationService(flags);

  // ═══════════════════════════════════════
  // GIAI ĐOẠN 1: Feature vừa merge, flag = OFF
  // ═══════════════════════════════════════
  console.log("━━━━ Giai đoạn 1: Code đã trên main, Flag = OFF ━━━━");
  console.log('  Feature flag "user-notifications" = OFF\n');

  const result1 = notifService.send("user-001", "Chào mừng bạn!");
  console.log("  Gửi notification:", result1);

  const notifs1 = notifService.getNotifications("user-001");
  console.log("  Notifications của user:", notifs1);
  console.log("  → Users KHÔNG thấy feature mới dù code đã trên production!\n");

  // ═══════════════════════════════════════
  // GIAI ĐOẠN 2: Bật flag cho internal team
  // ═══════════════════════════════════════
  console.log("━━━━ Giai đoạn 2: Bật cho Internal Team (whitelist) ━━━━");
  flags.addUserWhitelist("user-notifications", ["dev-alice", "dev-bob", "qa-charlie"]);

  // Internal user
  const r2a = notifService.send("dev-alice", "Bạn có 3 đơn hàng mới", "success");
  console.log("  dev-alice (internal):", r2a.sent ? "✅ Nhận được" : "❌ Không nhận");

  // Regular user
  const r2b = notifService.send("user-001", "Đơn hàng đã giao", "info");
  console.log("  user-001 (regular): ", r2b.sent ? "✅ Nhận được" : "❌ Không nhận");
  console.log("  → Chỉ team nội bộ thấy, users bình thường không bị ảnh hưởng\n");

  // ═══════════════════════════════════════
  // GIAI ĐOẠN 3: Rollout 30% users
  // ═══════════════════════════════════════
  console.log("━━━━ Giai đoạn 3: Rollout 30% users ━━━━");
  flags.addPercentageRollout("user-notifications", 30);

  const testUsers = [
    "user-alpha", "user-bravo", "user-charlie", "user-delta",
    "user-echo", "user-foxtrot", "user-golf", "user-hotel",
    "user-india", "user-juliet",
  ];

  let enabledCount = 0;
  for (const userId of testUsers) {
    const result = notifService.send(userId, "Khuyến mãi đặc biệt!", "info");
    if (result.sent) enabledCount++;
    const icon = result.sent ? "✅" : "❌";
    console.log(`  ${icon} ${userId}`);
  }
  console.log(`  → ${enabledCount}/${testUsers.length} users nhận được (target: ~30%)\n`);

  // ═══════════════════════════════════════
  // GIAI ĐOẠN 4: Full rollout
  // ═══════════════════════════════════════
  console.log("━━━━ Giai đoạn 4: Full Rollout (100%) ━━━━");
  flags.enable("user-notifications");

  // Tất cả users đều nhận được
  const users = ["user-001", "user-002", "user-003"];
  for (const userId of users) {
    notifService.send(userId, "🎉 Tính năng thông báo đã sẵn sàng!", "success");
    notifService.send(userId, "📦 Đơn hàng #12345 đang giao", "info");
  }

  console.log("  Kiểm tra notifications:\n");
  for (const userId of users) {
    const notifs = notifService.getNotifications(userId);
    const unread = notifService.getUnreadCount(userId);
    console.log(`  👤 ${userId}: ${notifs.length} notifications (${unread} chưa đọc)`);
    for (const n of notifs) {
      console.log(`     ${n.read ? "📭" : "📬"} [${n.type}] ${n.message}`);
    }
  }

  // ═══════════════════════════════════════
  // GIAI ĐOẠN 5: Feature ổn định → Cleanup
  // ═══════════════════════════════════════
  console.log("\n━━━━ Giai đoạn 5: Cleanup ━━━━");
  console.log("  Feature ổn định sau 2 tuần → Tạo PR xóa feature flag");
  console.log("  TRƯỚC: if (flags.isEnabled('user-notifications')) { send... }");
  console.log("  SAU:   send...  // Xóa if/else, giữ code mới");
  console.log("  → Merge cleanup PR vào main → Done! ✅\n");

  // ═══════════════════════════════════════
  // TỔNG KẾT
  // ═══════════════════════════════════════
  console.log("━━━━ 📋 Tổng kết quy trình ━━━━");
  console.log(`
  Git workflow thực tế đã thực hiện:

  1. git checkout -b feat/user-notification     ← Tạo branch
  2. Code NotificationService + feature flag    ← Viết code
  3. git add . && git commit                    ← Commit
  4. git push → Pull Request → Code Review      ← Review
  5. Merge vào main (flag=OFF)                  ← An toàn
  6. Bật flag: internal → 30% → 100%           ← Rollout dần
  7. git checkout -b chore/remove-notif-flag    ← Cleanup
  8. Xóa feature flag code → merge             ← Hoàn tất
  `);
}

runDemo();
