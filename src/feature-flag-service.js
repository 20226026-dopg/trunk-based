/**
 * Feature Flag Service - Triển khai đơn giản không phụ thuộc bên ngoài
 *
 * Đây là một service quản lý Feature Flags cơ bản, giúp hiểu nguyên lý
 * hoạt động trước khi chuyển sang dùng GrowthBook.
 */

class FeatureFlagService {
  constructor() {
    // Lưu trữ các feature flags trong memory
    this._flags = new Map();
    // Lưu trữ các rules (điều kiện bật/tắt theo user)
    this._rules = new Map();
  }

  /**
   * Đăng ký một feature flag mới
   * @param {string} key - Tên flag (vd: "new-checkout-page")
   * @param {boolean} defaultValue - Giá trị mặc định (true/false)
   * @param {string} description - Mô tả feature
   */
  register(key, defaultValue = false, description = "") {
    this._flags.set(key, {
      key,
      enabled: defaultValue,
      description,
      createdAt: new Date().toISOString(),
    });
    return this;
  }

  /**
   * Bật một feature flag
   */
  enable(key) {
    const flag = this._flags.get(key);
    if (flag) flag.enabled = true;
    return this;
  }

  /**
   * Tắt một feature flag
   */
  disable(key) {
    const flag = this._flags.get(key);
    if (flag) flag.enabled = false;
    return this;
  }

  /**
   * Kiểm tra feature flag có bật không
   * @param {string} key - Tên flag
   * @param {object} context - Thông tin user (để áp dụng targeting rules)
   */
  isEnabled(key, context = {}) {
    const flag = this._flags.get(key);
    if (!flag) return false;

    // Kiểm tra rules trước (targeting cụ thể)
    const rules = this._rules.get(key) || [];
    for (const rule of rules) {
      const result = rule(context);
      if (result !== undefined) return result;
    }

    // Nếu không có rule nào match, dùng giá trị mặc định
    return flag.enabled;
  }

  /**
   * Thêm targeting rule cho một flag
   * Rule là một function nhận context và trả về true/false/undefined
   *
   * @param {string} key - Tên flag
   * @param {function} ruleFn - Hàm rule
   */
  addRule(key, ruleFn) {
    if (!this._rules.has(key)) {
      this._rules.set(key, []);
    }
    this._rules.get(key).push(ruleFn);
    return this;
  }

  /**
   * Percentage rollout - Bật feature cho X% users
   * @param {string} key - Tên flag
   * @param {number} percentage - Phần trăm (0-100)
   */
  addPercentageRollout(key, percentage) {
    this.addRule(key, (context) => {
      if (!context.userId) return undefined;
      // Dùng hash đơn giản của userId để phân phối đều
      const hash = this._simpleHash(context.userId);
      return (hash % 100) < percentage;
    });
    return this;
  }

  /**
   * Bật feature chỉ cho một nhóm users cụ thể
   * @param {string} key - Tên flag
   * @param {string[]} userIds - Danh sách user IDs
   */
  addUserWhitelist(key, userIds) {
    const allowedSet = new Set(userIds);
    this.addRule(key, (context) => {
      if (!context.userId) return undefined;
      if (allowedSet.has(context.userId)) return true;
      return undefined; // Không match -> fallback
    });
    return this;
  }

  /**
   * Hash đơn giản cho percentage rollout
   */
  _simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Liệt kê tất cả flags
   */
  listFlags() {
    const result = [];
    for (const [, flag] of this._flags) {
      result.push({ ...flag });
    }
    return result;
  }
}

module.exports = { FeatureFlagService };
