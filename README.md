# Trunk-based Development, Feature Flags & GrowthBook

## 📚 Giới thiệu

Dự án này là **hướng dẫn thực hành** về 3 khái niệm quan trọng trong phát triển phần mềm hiện đại:

| Khái niệm | Mô tả |
|---|---|
| **Trunk-based Development** | Chiến lược quản lý source code: mọi developer commit vào **1 branch chính** (trunk/main) |
| **Feature Flags** | Kỹ thuật bật/tắt tính năng bằng cấu hình thay vì deploy code mới |
| **GrowthBook** | Nền tảng mã nguồn mở cho Feature Flags & A/B Testing |

---

## 🚀 Cách chạy

```bash
# 1. Install dependencies
npm install

# 2. Chạy tất cả demos
npm start

# 3. Hoặc chạy từng phần
npm run demo:trunk       # Trunk-based workflow
npm run demo:flags       # Feature Flags cơ bản
npm run demo:growthbook  # GrowthBook SDK
```

---

## 🌳 Phần 1: Trunk-based Development

### Trunk-based Development là gì?

Là chiến lược quản lý code trong đó **tất cả developers** merge code vào **một branch duy nhất** (main/trunk) thường xuyên, thay vì giữ các branch dài ngày.

### Nguyên tắc cốt lõi

```
1. Chỉ có 1 branch chính: main (trunk)
2. Short-lived branches: tồn tại < 1 ngày
3. Merge thường xuyên: ít nhất 1 lần/ngày
4. Code mới ẩn sau Feature Flags
5. CI/CD luôn xanh trên trunk
```

### Workflow chuẩn

```
main ──●──●──●──●──●──●──●──●──●──●── (luôn deployable)
        \   /  \   /      \   /
         ●─●    ●─●        ●─●
        feat/A  feat/B    feat/C
       (vài giờ) (vài giờ) (vài giờ)
```

### So sánh với Git Flow

```
┌──────────────────────┬─────────────────┬──────────────────┐
│                      │ Trunk-based     │ Git Flow         │
├──────────────────────┼─────────────────┼──────────────────┤
│ Branch lifetime      │ Vài giờ         │ Vài tuần         │
│ Merge conflicts      │ Hiếm            │ Thường xuyên     │
│ Release frequency    │ Hàng ngày       │ Vài tuần         │
│ Rollback speed       │ Tức thì (flag)  │ Revert commit    │
│ Code review size     │ Nhỏ, nhanh      │ Lớn, lâu         │
│ CI/CD                │ Luôn xanh       │ Merge mới chạy   │
└──────────────────────┴─────────────────┴──────────────────┘
```

### Ví dụ thực tế

```
Developer A muốn thêm tính năng "Search bằng Elasticsearch":

1. git checkout -b feat/elasticsearch-search    (tạo branch)
2. Viết code, bọc trong feature flag            (code ẩn)
3. git push → Tạo Pull Request                  (code review nhỏ)
4. Merge vào main trong ngày                    (trunk luôn up-to-date)
5. Feature flag = OFF → Users không thấy gì      (an toàn)
6. Bật dần: 5% → 25% → 50% → 100%              (gradual rollout)
7. Xóa feature flag khi ổn định                 (cleanup)
```

---

## 🚩 Phần 2: Feature Flags

### Feature Flags là gì?

Feature Flags (hay Feature Toggles) cho phép **bật/tắt một tính năng** mà **không cần deploy lại code**. Code cũ và mới cùng tồn tại, flag quyết định logic nào chạy.

### Các loại Feature Flags

| Loại | Mục đích | Ví dụ |
|---|---|---|
| **Release Flag** | Ẩn feature chưa hoàn thiện | `new-checkout-page: OFF` |
| **Experiment Flag** | A/B testing | `button-color: "blue" vs "green"` |
| **Ops Flag** | Tắt nhanh khi có sự cố | `enable-external-api: ON/OFF` |
| **Permission Flag** | Bật cho nhóm user cụ thể | `beta-feature: chỉ premium users` |

### Pattern cơ bản

```javascript
// ❌ KHÔNG dùng Feature Flag:
function getSearchResults(query) {
  return elasticsearchQuery(query); // Deploy = bật cho TẤT CẢ
}

// ✅ CÓ dùng Feature Flag:
function getSearchResults(query) {
  if (featureFlags.isEnabled("new-search-engine")) {
    return elasticsearchQuery(query);   // Code MỚI (ẩn)
  } else {
    return sqlLikeQuery(query);         // Code CŨ (đang chạy)
  }
}
```

### Targeting & Rollout

```javascript
const flags = new FeatureFlagService();

// 1. Bật/tắt đơn giản
flags.register("dark-mode", false);
flags.enable("dark-mode");

// 2. Percentage rollout (bật cho 30% users)
flags.addPercentageRollout("new-search", 30);

// 3. Whitelist (chỉ cho nhóm cụ thể)
flags.addUserWhitelist("beta-feature", ["user-1", "user-2"]);

// 4. Conditional (theo thuộc tính user)
flags.addRule("premium-feature", (ctx) => {
  return ctx.plan === "premium" ? true : undefined;
});
```

### Vòng đời Feature Flag

```
Tạo flag (OFF) → Merge code → Test nội bộ → Rollout dần → 100% → Xóa flag
     ↑                                          ↓
     └── Nếu lỗi ← Tắt flag ngay (rollback tức thì)
```

---

## 🧪 Phần 3: GrowthBook

### GrowthBook là gì?

[GrowthBook](https://www.growthbook.io/) là nền tảng **mã nguồn mở** cho:
- **Feature Flags**: Quản lý bật/tắt tính năng
- **A/B Testing**: Chạy experiments, đo kết quả
- **Remote Config**: Thay đổi config không cần deploy

### Cài đặt

```bash
npm install @growthbook/growthbook
```

### Sử dụng cơ bản

```javascript
const { GrowthBook } = require("@growthbook/growthbook");

// Tạo instance với user attributes
const gb = new GrowthBook({
  apiHost: "https://cdn.growthbook.io",
  clientKey: "sdk-abc123",
  attributes: {
    id: "user-123",
    country: "VN",
    plan: "premium",
  },
  trackingCallback: (experiment, result) => {
    // Gửi tracking event (Google Analytics, Mixpanel, v.v.)
    analytics.track("Experiment Viewed", {
      experimentId: experiment.key,
      variationId: result.key,
    });
  },
});

// Feature Flag đơn giản
if (gb.isOn("new-feature")) {
  showNewFeature();
}

// Feature Flag với giá trị
const color = gb.getFeatureValue("button-color", "blue");

// Remote Config (JSON)
const banner = gb.getFeatureValue("promo-banner", { show: false });

// Cleanup
gb.destroy();
```

### Các tính năng GrowthBook

#### 1. Percentage Rollout
```javascript
// Trong GrowthBook dashboard hoặc config:
features: {
  "new-pricing": {
    defaultValue: false,
    rules: [{ coverage: 0.2 }]  // Bật cho 20% users
  }
}
```

#### 2. A/B Testing
```javascript
features: {
  "checkout-button": {
    defaultValue: "blue",
    rules: [{
      variations: ["blue", "green", "red"],
      weights: [0.34, 0.33, 0.33]  // Chia đều 3 variations
    }]
  }
}
```

#### 3. Targeting theo điều kiện
```javascript
features: {
  "beta-feature": {
    defaultValue: false,
    rules: [{
      condition: { country: "VN", plan: "premium" },
      force: true  // Bật cho VN + Premium users
    }]
  }
}
```

#### 4. Remote Config
```javascript
features: {
  "homepage-banner": {
    defaultValue: { show: false },
    rules: [{
      condition: { country: "VN" },
      force: {
        show: true,
        title: "Khuyến mãi đặc biệt!",
        message: "Giảm 50% hôm nay"
      }
    }]
  }
}
```

### Self-hosted vs Cloud

| | Self-hosted | GrowthBook Cloud |
|---|---|---|
| **Giá** | Miễn phí | Free tier + trả phí |
| **Setup** | Docker compose | Không cần setup |
| **Data** | Lưu trên server bạn | Lưu trên GrowthBook |
| **Dashboard** | Tự host | growthbook.io |

```bash
# Self-hosted với Docker:
docker pull growthbook/growthbook:latest
docker run -d -p 3100:3100 -p 3200:3200 growthbook/growthbook
# → Dashboard: http://localhost:3100
# → API:       http://localhost:3200
```

---

## 🔗 Kết hợp cả 3: Quy trình hoàn chỉnh

```
┌──────────────────────────────────────────────────────────┐
│                   DEVELOPMENT WORKFLOW                    │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  1. PLAN: Tạo Feature Flag trên GrowthBook dashboard     │
│     └─ "new-search-engine" = OFF                         │
│                                                          │
│  2. CODE: Developer tạo short-lived branch               │
│     └─ git checkout -b feat/new-search                   │
│     └─ Viết code bọc trong gb.isOn("new-search-engine")  │
│     └─ Viết tests                                        │
│                                                          │
│  3. MERGE: Pull Request → Code Review → Merge vào main   │
│     └─ CI/CD chạy tests → Deploy (feature vẫn OFF)       │
│                                                          │
│  4. ROLLOUT: Bật dần trên GrowthBook dashboard           │
│     └─ 5% internal → 20% beta → 50% → 100%              │
│     └─ Monitor metrics, nếu lỗi → tắt flag              │
│                                                          │
│  5. CLEANUP: Xóa Feature Flag và code cũ                 │
│     └─ git checkout -b chore/remove-search-flag           │
│     └─ Xóa if/else, giữ code mới                         │
│     └─ Merge → Done!                                      │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 📁 Cấu trúc dự án

```
trunk-based/
├── package.json
├── README.md
├── src/
│   ├── index.js                  # Entry point - chạy tất cả demos
│   ├── feature-flag-service.js   # Feature Flag service (tự triển khai)
│   ├── demo-trunk-workflow.js    # Demo quy trình Trunk-based
│   ├── demo-feature-flags.js     # Demo Feature Flags
│   └── demo-growthbook.js        # Demo GrowthBook SDK
└── .gitignore
```

---

## 📖 Tài liệu tham khảo

- [Trunk-based Development](https://trunkbaseddevelopment.com/) - Trang chính thức
- [GrowthBook Docs](https://docs.growthbook.io/) - Tài liệu GrowthBook
- [Martin Fowler - Feature Toggles](https://martinfowler.com/articles/feature-toggles.html) - Bài viết kinh điển
- [Google - Trunk-based Development](https://cloud.google.com/architecture/devops/devops-tech-trunk-based-development) - Best practices từ Google
