/**
 * Demo Trunk-based Development Workflow
 *
 * Mô phỏng quy trình làm việc Trunk-based Development:
 * 1. Developer tạo short-lived branch từ trunk (main)
 * 2. Code feature mới, ẩn sau Feature Flag
 * 3. Merge vào trunk nhanh (< 1 ngày)
 * 4. Bật Feature Flag khi sẵn sàng
 * 5. Xóa Feature Flag khi feature ổn định
 */

// ═══════════════════════════════════════════════
// MÔ PHỎNG GIT WORKFLOW
// ═══════════════════════════════════════════════

class TrunkBasedWorkflowSimulator {
  constructor() {
    this.branches = new Map();
    this.trunk = []; // commit history on main
    this.currentBranch = "main";
    this.step = 0;
  }

  log(message) {
    this.step++;
    console.log(`  [Step ${this.step}] ${message}`);
  }

  createBranch(name) {
    this.branches.set(name, [...this.trunk]);
    this.currentBranch = name;
    this.log(`🌿 git checkout -b ${name}  (tạo branch từ main)`);
  }

  commit(message) {
    const entry = { message, branch: this.currentBranch, time: new Date().toISOString() };
    if (this.currentBranch === "main") {
      this.trunk.push(entry);
    } else {
      this.branches.get(this.currentBranch).push(entry);
    }
    this.log(`📝 git commit -m "${message}"  (trên ${this.currentBranch})`);
  }

  mergeTrunk(branchName) {
    const branchCommits = this.branches.get(branchName) || [];
    const newCommits = branchCommits.slice(this.trunk.length);
    this.trunk.push(...newCommits);
    this.currentBranch = "main";
    this.log(`🔀 git checkout main && git merge ${branchName}  (merge vào trunk)`);
    this.log(`🗑️  git branch -d ${branchName}  (xóa branch ngắn hạn)`);
    this.branches.delete(branchName);
  }

  showHistory() {
    console.log("\n  📜 Trunk (main) commit history:");
    for (let i = 0; i < this.trunk.length; i++) {
      console.log(`     ${i + 1}. ${this.trunk[i].message}`);
    }
  }
}

// ═══════════════════════════════════════════════
// CHẠY MÔ PHỎNG
// ═══════════════════════════════════════════════

function runWorkflowDemo() {
  console.log("╔══════════════════════════════════════════════════════╗");
  console.log("║   🌳 TRUNK-BASED DEVELOPMENT WORKFLOW DEMO         ║");
  console.log("╚══════════════════════════════════════════════════════╝\n");

  const git = new TrunkBasedWorkflowSimulator();

  // ──────────────────────────────────────────────
  // BƯỚC 1: Codebase ban đầu
  // ──────────────────────────────────────────────
  console.log("━━━━ Phase 1: Codebase hiện tại ━━━━");
  git.commit("Initial commit - E-commerce app");
  git.commit("Add product listing page");
  git.commit("Add basic search (SQL LIKE)");
  console.log();

  // ──────────────────────────────────────────────
  // BƯỚC 2: Developer A - Thêm Elasticsearch search
  // ──────────────────────────────────────────────
  console.log("━━━━ Phase 2: Developer A - Search mới (Feature Flag) ━━━━");

  git.createBranch("feat/elasticsearch-search");

  git.commit("Add feature flag: new-search-engine = OFF");
  console.log("     📄 Code:");
  console.log('     if (featureFlags.isEnabled("new-search-engine")) {');
  console.log("       return elasticsearchQuery(query);  // Code MỚI");
  console.log("     } else {");
  console.log("       return sqlLikeQuery(query);         // Code CŨ (vẫn chạy)");
  console.log("     }");
  console.log();

  git.commit("Implement Elasticsearch service");
  git.commit("Add unit tests for new search");

  console.log("\n  ⏱️  Branch chỉ tồn tại vài giờ → merge ngay vào trunk!");
  git.mergeTrunk("feat/elasticsearch-search");
  console.log("  ✅ Code đã trên trunk nhưng feature flag = OFF → users không thấy gì");
  console.log();

  // ──────────────────────────────────────────────
  // BƯỚC 3: Developer B - Đồng thời thêm Dark Mode
  // ──────────────────────────────────────────────
  console.log("━━━━ Phase 3: Developer B - Dark Mode (song song) ━━━━");

  git.createBranch("feat/dark-mode");
  git.commit("Add dark-mode feature flag");
  git.commit("Implement dark mode CSS & toggle");
  git.mergeTrunk("feat/dark-mode");
  console.log("  ✅ 2 features khác nhau merge mà KHÔNG conflict!");
  console.log();

  // ──────────────────────────────────────────────
  // BƯỚC 4: Rollout dần
  // ──────────────────────────────────────────────
  console.log("━━━━ Phase 4: Gradual Rollout ━━━━");
  console.log("  🚀 Quy trình bật feature flag cho Search mới:");
  console.log();

  const rolloutSteps = [
    { percent: "5%",   desc: "Internal team testing", action: "Chỉ team nội bộ" },
    { percent: "10%",  desc: "Beta users",            action: "Nhóm beta testers" },
    { percent: "25%",  desc: "Early adopters",         action: "1/4 users" },
    { percent: "50%",  desc: "Half users",             action: "Nửa users" },
    { percent: "100%", desc: "Full rollout",           action: "TẤT CẢ users" },
  ];

  for (let i = 0; i < rolloutSteps.length; i++) {
    const step = rolloutSteps[i];
    const bar = "█".repeat(i + 1) + "░".repeat(4 - i);
    console.log(`  ${bar} ${step.percent.padEnd(5)} → ${step.action}`);
    console.log(`         Nếu có lỗi → tắt flag ngay, rollback tức thì!`);
  }
  console.log();

  // ──────────────────────────────────────────────
  // BƯỚC 5: Cleanup
  // ──────────────────────────────────────────────
  console.log("━━━━ Phase 5: Cleanup (sau khi feature ổn định) ━━━━");

  git.createBranch("chore/remove-search-flag");
  git.commit("Remove new-search-engine flag, keep only Elasticsearch code");
  console.log("     📄 Code SAU cleanup:");
  console.log("     // Không còn if/else, chỉ giữ code mới");
  console.log("     return elasticsearchQuery(query);");
  console.log();
  git.mergeTrunk("chore/remove-search-flag");

  git.showHistory();

  // ──────────────────────────────────────────────
  // SO SÁNH
  // ──────────────────────────────────────────────
  console.log("\n━━━━ So sánh: Trunk-based vs Git Flow ━━━━\n");

  console.log("  ┌──────────────────────┬──────────────────────────────┐");
  console.log("  │                      │ Trunk-based   │ Git Flow     │");
  console.log("  ├──────────────────────┼──────────────────────────────┤");
  console.log("  │ Branch lifetime      │ Vài giờ       │ Vài tuần     │");
  console.log("  │ Merge conflicts      │ Hiếm          │ Thường xuyên │");
  console.log("  │ Release frequency    │ Hàng ngày     │ Vài tuần     │");
  console.log("  │ Rollback speed       │ Tức thì (flag)│ Revert commit│");
  console.log("  │ Code review          │ Nhỏ, nhanh    │ Lớn, lâu     │");
  console.log("  │ CI/CD               │ Luôn xanh     │ Merge mới chạy│");
  console.log("  └──────────────────────┴──────────────────────────────┘");
  console.log();
}

runWorkflowDemo();
