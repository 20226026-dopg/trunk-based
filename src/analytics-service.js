/**
 * Analytics Service - Feature thứ 2, phát triển song song
 *
 * Minh họa: 2 developers cùng làm việc trên trunk
 * - Developer A: Notification Service (đã merge)
 * - Developer B: Analytics Service (đang code)
 *
 * Cả 2 đều ẩn sau feature flags → không xung đột!
 */

class AnalyticsService {
  constructor(featureFlagService) {
    this.flags = featureFlagService;
    this.events = [];
  }

  /**
   * Track một event (chỉ khi feature flag bật)
   */
  track(eventName, properties = {}, userContext = {}) {
    if (!this.flags.isEnabled("user-analytics", userContext)) {
      return { tracked: false, reason: "Feature flag is OFF" };
    }

    const event = {
      event: eventName,
      properties,
      userId: userContext.userId || "anonymous",
      timestamp: new Date().toISOString(),
    };

    this.events.push(event);
    return { tracked: true, event };
  }

  /**
   * Lấy báo cáo đơn giản
   */
  getReport() {
    const summary = {};
    for (const event of this.events) {
      summary[event.event] = (summary[event.event] || 0) + 1;
    }
    return {
      totalEvents: this.events.length,
      eventCounts: summary,
    };
  }
}

module.exports = { AnalyticsService };
