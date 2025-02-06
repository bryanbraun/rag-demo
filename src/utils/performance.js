/**
 * Simple performance measurement utility
 */
class PerformanceMonitor {
  constructor() {
    this.startTime = process.hrtime();
    this.startUsage = process.memoryUsage();
  }

  getMetrics() {
    const elapsedTime = process.hrtime(this.startTime);
    const elapsedMs = (elapsedTime[0] * 1000) + (elapsedTime[1] / 1000000);
    const currentUsage = process.memoryUsage();
    
    return {
      timeMs: elapsedMs.toFixed(2),
      memoryMB: ((currentUsage.heapUsed - this.startUsage.heapUsed) / 1024 / 1024).toFixed(2)
    };
  }
}

module.exports = PerformanceMonitor; 