# BÁO CÁO: Trunk-based Development, Feature Flags & GrowthBook

> **Sinh viên:** 20226026  
> **Repository:** https://github.com/20226026-dopg/trunk-based.git  
> **Ngày:** 09/03/2026

---

## 1. Trunk-based Development

### 1.1 Khái niệm

Trunk-based Development (TBD) là chiến lược quản lý source code trong đó **tất cả developers commit vào một branch duy nhất** gọi là trunk (thường là `main`). Các feature branch chỉ tồn tại **ngắn hạn** (vài giờ đến tối đa 1 ngày) rồi được merge ngay vào trunk.

### 1.2 Nguyên tắc cốt lõi

| # | Nguyên tắc | Giải thích |
|---|---|---|
| 1 | **Single trunk** | Chỉ có 1 branch chính (`main`), không có `develop`, `release`, `hotfix` |
| 2 | **Short-lived branches** | Feature branch tồn tại < 1 ngày, merge sớm nhất có thể |
| 3 | **Merge thường xuyên** | Mỗi developer merge ít nhất 1 lần/ngày để tránh conflict |
| 4 | **Code ẩn sau Feature Flags** | Code mới được bọc trong flag, merge an toàn dù chưa hoàn thiện |
| 5 | **CI/CD luôn xanh** | Trunk luôn ở trạng thái deployable, test tự động chạy liên tục |

### 1.3 So sánh với Git Flow

| Tiêu chí | Trunk-based | Git Flow |
|---|---|---|
| Thời gian sống của branch | Vài giờ | Vài tuần |
| Merge conflict | Hiếm khi xảy ra | Thường xuyên |
| Tần suất release | Hàng ngày | Vài tuần/tháng |
| Tốc độ rollback | Tức thì (tắt flag) | Phải revert commit |
| Kích thước code review | Nhỏ, review nhanh | Lớn, review lâu |
| CI/CD | Luôn xanh trên trunk | Chỉ chạy khi merge |

### 1.4 Workflow thực tế

```
main ──●──●──●──●──●──●──●── (luôn deployable)
        \   /  \   /
         ●─●    ●─●
       feat/A  feat/B       ← short-lived (vài giờ)
```

**Quy trình 7 bước:**

1. `git checkout -b feat/new-feature` — Tạo branch ngắn hạn
2. Viết code, bọc trong feature flag — Code ẩn, an toàn
3. `git push` → Tạo Pull Request — Code review nhỏ gọn
4. Merge vào `main` trong ngày — Trunk luôn up-to-date
5. Feature flag = OFF — Users không thấy gì
6. Bật dần: 5% → 25% → 50% → 100% — Gradual rollout
7. Xóa feature flag khi ổn định — Cleanup code

---

## 2. Feature Flags

### 2.1 Khái niệm

Feature Flags (Feature Toggles) là kỹ thuật cho phép **bật/tắt một tính năng bằng cấu hình** mà không cần deploy lại code. Code cũ và mới cùng tồn tại trong codebase, flag quyết định phần nào được thực thi.

### 2.2 Phân loại Feature Flags

| Loại | Mục đích | Thời gian tồn tại | Ví dụ |
|---|---|---|---|
| **Release Flag** | Ẩn feature chưa hoàn thiện | Ngắn (vài ngày → vài tuần) | `new-checkout-page: OFF` |
| **Experiment Flag** | A/B testing | Trung bình (vài tuần) | `button-color: "blue" vs "green"` |
| **Ops Flag** | Kill switch khi có sự cố | Dài hạn | `enable-external-api: ON/OFF` |
| **Permission Flag** | Bật cho nhóm user cụ thể | Dài hạn | `beta-feature: chỉ premium users` |

### 2.3 Cách hoạt động

```javascript
// KHÔNG dùng Feature Flag → deploy = bật cho TẤT CẢ users
function search(query) {
  return elasticsearchQuery(query);
}

// CÓ dùng Feature Flag → kiểm soát ai thấy feature nào
function search(query) {
  if (featureFlags.isEnabled("new-search")) {
    return elasticsearchQuery(query);   // Code MỚI (ẩn)
  } else {
    return sqlQuery(query);             // Code CŨ (đang chạy)
  }
}
```

### 2.4 Các chiến lược Targeting

| Chiến lược | Mô tả |
|---|---|
| **Boolean toggle** | Bật/tắt đơn giản cho tất cả |
| **Percentage rollout** | Bật cho X% users (ví dụ: 10% → 50% → 100%) |
| **User whitelist** | Bật cho danh sách users cụ thể (team nội bộ, beta testers) |
| **Conditional** | Bật theo thuộc tính user (country, plan, device...) |

### 2.5 Vòng đời Feature Flag

```
Tạo flag (OFF) → Merge code → Test nội bộ → Rollout dần → 100% → Xóa flag
                                                ↓
                               Nếu lỗi → Tắt flag ngay (rollback tức thì)
```

> **Quan trọng:** Feature flags phải được **cleanup** (xóa) sau khi feature ổn định để tránh technical debt.

---

## 3. GrowthBook

### 3.1 Khái niệm

[GrowthBook](https://www.growthbook.io/) là nền tảng **mã nguồn mở** (open-source) cung cấp:

- **Feature Flags** — Quản lý bật/tắt tính năng với UI dashboard
- **A/B Testing** — Chạy experiments, đo lường kết quả thống kê
- **Remote Config** — Thay đổi cấu hình ứng dụng không cần deploy

### 3.2 Kiến trúc

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────┐
│  GrowthBook     │     │   GrowthBook     │     │   Ứng dụng  │
│  Dashboard      │────▶│   API / CDN      │────▶│   (SDK)     │
│  (Quản lý)      │     │  (Phân phối)     │     │  (Sử dụng)  │
└─────────────────┘     └──────────────────┘     └─────────────┘
     Tạo flag,            Cung cấp config         gb.isOn()
     set rules            cho SDK                 gb.getFeatureValue()
```

### 3.3 Cài đặt & Sử dụng cơ bản

```bash
npm install @growthbook/growthbook
```

```javascript
const { GrowthBook } = require("@growthbook/growthbook");

const gb = new GrowthBook({
  apiHost: "https://cdn.growthbook.io",
  clientKey: "sdk-abc123",
  attributes: {                    // Thông tin user
    id: "user-123",
    country: "VN",
    plan: "premium",
  },
  trackingCallback: (experiment, result) => {
    analytics.track("Experiment Viewed", {
      experimentId: experiment.key,
      variationId: result.key,
    });
  },
});

// Feature Flag boolean
if (gb.isOn("new-feature")) {
  showNewFeature();
}

// Feature Flag với giá trị
const color = gb.getFeatureValue("button-color", "blue");

// Remote Config (JSON)
const banner = gb.getFeatureValue("promo-banner", { show: false });

gb.destroy(); // Cleanup
```

### 3.4 Các tính năng chính

| Tính năng | Config | Ý nghĩa |
|---|---|---|
| **Percentage Rollout** | `rules: [{ coverage: 0.2 }]` | Bật cho 20% users |
| **A/B Testing** | `variations: ["blue","green"], weights: [0.5, 0.5]` | Chia đều 2 nhóm |
| **Targeting** | `condition: { country: "VN", plan: "premium" }` | Chỉ VN + Premium |
| **Remote Config** | `force: { title: "Sale!", discount: 50 }` | Cấu hình động |

### 3.5 Triển khai

| | Self-hosted (Docker) | GrowthBook Cloud |
|---|---|---|
| **Chi phí** | Miễn phí | Free tier + trả phí theo scale |
| **Setup** | `docker run growthbook/growthbook` | Đăng ký tại growthbook.io |
| **Dữ liệu** | Lưu trên server riêng | Lưu trên GrowthBook cloud |
| **Phù hợp** | Team muốn kiểm soát data | Team muốn nhanh, ít vận hành |

---

## 4. Kết hợp cả 3: Quy trình hoàn chỉnh

```
┌────────────────────────────────────────────────────────────┐
│                    QUY TRÌNH PHÁT TRIỂN                     │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  PLAN    → Tạo Feature Flag trên GrowthBook (OFF)          │
│                                                            │
│  CODE    → git checkout -b feat/xxx                        │
│            Viết code bọc trong gb.isOn("flag-name")        │
│            Viết unit tests                                  │
│                                                            │
│  MERGE   → Push → Pull Request → Code Review               │
│            CI/CD chạy tests → Merge vào main                │
│            Feature vẫn OFF → Users không bị ảnh hưởng       │
│                                                            │
│  ROLLOUT → Bật dần trên GrowthBook dashboard               │
│            5% team → 20% beta → 50% → 100%                 │
│            Monitor metrics → Nếu lỗi: tắt flag ngay        │
│                                                            │
│  CLEANUP → Xóa feature flag code (if/else)                 │
│            Giữ lại code mới → Merge → Done!                 │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 5. Demo thực hành

### 5.1 Repository

- **URL:** https://github.com/20226026-dopg/trunk-based.git
- **Ngôn ngữ:** JavaScript (Node.js)
- **SDK:** `@growthbook/growthbook`

### 5.2 Git History thực tế

```
* docs: update README with GitHub repo link
*   Merge feat/user-analytics into main - PR #2
|\
| * feat: add analytics service behind feature flag
|/
*   Merge feat/user-notification into main - PR #1
|\
| * feat: add notification service behind feature flag
|/
* Initial commit - Trunk-based Dev guide
```

→ Đúng mô hình trunk-based: **short-lived branches** merge nhanh vào `main`, trunk luôn sạch.

### 5.3 Cấu trúc dự án

```
trunk-based/
├── src/
│   ├── feature-flag-service.js   ← Feature Flag service tự triển khai
│   ├── notification-service.js   ← Feature mới (demo trunk-based)
│   ├── analytics-service.js      ← Feature song song (demo 2 devs)
│   ├── demo-trunk-workflow.js    ← Demo mô phỏng Git workflow
│   ├── demo-feature-flags.js     ← Demo bật/tắt, targeting, rollout
│   ├── demo-growthbook.js        ← Demo GrowthBook SDK
│   └── demo-real-workflow.js     ← Demo gradual rollout thực tế
├── package.json
└── README.md
```

### 5.4 Cách chạy

```bash
git clone https://github.com/20226026-dopg/trunk-based.git
cd trunk-based
npm install
npm start              # Chạy tất cả demos
npm run demo:real      # Demo thực tế gradual rollout
```

---

## 6. Kết luận

| Vấn đề | Giải pháp |
|---|---|
| Branch sống lâu gây conflict | **Trunk-based Dev:** merge trong ngày |
| Deploy feature chưa xong gây lỗi | **Feature Flags:** ẩn code sau flag |
| Rollback chậm khi có sự cố | **Feature Flags:** tắt flag tức thì |
| Cần A/B test nhưng phức tạp | **GrowthBook:** SDK + Dashboard sẵn có |
| Muốn rollout dần để giảm rủi ro | **GrowthBook:** percentage rollout + targeting |

**Trunk-based Development + Feature Flags + GrowthBook** tạo thành một quy trình phát triển hiện đại, cho phép team **release nhanh, an toàn, và có kiểm soát**.
