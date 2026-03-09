/**
 * Notification Service - Feature mới được thêm qua trunk-based workflow
 *
 * Feature này được bọc trong feature flag "user-notifications"
 * → Merge vào main nhưng chưa hiển thị cho users
 * → Bật dần dần khi sẵn sàng
 */

class NotificationService {
  constructor(featureFlagService) {
    this.flags = featureFlagService;
    this.notifications = new Map(); // userId -> notifications[]
  }

  /**
   * Gửi notification cho user (chỉ hoạt động khi flag bật)
   */
  send(userId, message, type = "info") {
    const userContext = { userId };

    if (!this.flags.isEnabled("user-notifications", userContext)) {
      // Feature flag OFF → không làm gì
      return { sent: false, reason: "Feature flag is OFF" };
    }

    if (!this.notifications.has(userId)) {
      this.notifications.set(userId, []);
    }

    const notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      message,
      type, // "info", "warning", "success", "error"
      timestamp: new Date().toISOString(),
      read: false,
    };

    this.notifications.get(userId).push(notification);
    return { sent: true, notification };
  }

  /**
   * Lấy danh sách notifications của user
   */
  getNotifications(userId) {
    const userContext = { userId };

    if (!this.flags.isEnabled("user-notifications", userContext)) {
      return []; // Feature flag OFF → trả về rỗng
    }

    return this.notifications.get(userId) || [];
  }

  /**
   * Đếm notifications chưa đọc
   */
  getUnreadCount(userId) {
    return this.getNotifications(userId).filter(n => !n.read).length;
  }

  /**
   * Đánh dấu đã đọc
   */
  markAsRead(userId, notificationId) {
    const notifications = this.notifications.get(userId) || [];
    const notif = notifications.find(n => n.id === notificationId);
    if (notif) notif.read = true;
    return notif;
  }
}

module.exports = { NotificationService };
