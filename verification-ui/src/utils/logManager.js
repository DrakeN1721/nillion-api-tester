export class LogManager {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000; // Prevent memory overflow
  }

  addLog(logEntry) {
    const log = {
      id: Date.now() + Math.random(), // Unique ID
      timestamp: new Date().toISOString(),
      type: logEntry.type || 'info', // info, success, warning, error
      category: logEntry.category || 'general', // auth, validation, chat, system, etc.
      message: logEntry.message || '',
      details: logEntry.details || {},
      level: this.getLogLevel(logEntry.type)
    };

    this.logs.unshift(log); // Add to beginning for newest first

    // Trim logs if we exceed max
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    return log;
  }

  getLogLevel(type) {
    const levels = {
      error: 4,
      warning: 3,
      success: 2,
      info: 1
    };
    return levels[type] || 1;
  }

  getAllLogs() {
    return [...this.logs];
  }

  getLogsByType(type) {
    return this.logs.filter(log => log.type === type);
  }

  getLogsByCategory(category) {
    return this.logs.filter(log => log.category === category);
  }

  getLogsAfter(timestamp) {
    return this.logs.filter(log => new Date(log.timestamp) > new Date(timestamp));
  }

  clearLogs() {
    this.logs = [];
  }

  // Export logs in various formats
  exportToJSON(filter = null) {
    const logsToExport = filter ? this.logs.filter(filter) : this.logs;
    return JSON.stringify({
      exportTimestamp: new Date().toISOString(),
      totalLogs: logsToExport.length,
      logs: logsToExport
    }, null, 2);
  }

  exportToCSV(filter = null) {
    const logsToExport = filter ? this.logs.filter(filter) : this.logs;

    if (logsToExport.length === 0) {
      return 'No logs to export';
    }

    const headers = ['Timestamp', 'Type', 'Category', 'Message', 'Details'];
    const csvRows = [headers.join(',')];

    logsToExport.forEach(log => {
      const row = [
        `"${log.timestamp}"`,
        `"${log.type}"`,
        `"${log.category}"`,
        `"${log.message.replace(/"/g, '""')}"`, // Escape quotes
        `"${JSON.stringify(log.details).replace(/"/g, '""')}"`
      ];
      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  }

  exportToText(filter = null) {
    const logsToExport = filter ? this.logs.filter(filter) : this.logs;

    if (logsToExport.length === 0) {
      return 'No logs to export';
    }

    const lines = [`Nil AI Key Verification Logs - Exported: ${new Date().toISOString()}`, ''];

    logsToExport.forEach(log => {
      lines.push(`[${log.timestamp}] ${log.type.toUpperCase()} (${log.category}): ${log.message}`);

      if (Object.keys(log.details).length > 0) {
        lines.push(`  Details: ${JSON.stringify(log.details, null, 2)}`);
      }

      lines.push(''); // Empty line between logs
    });

    return lines.join('\n');
  }

  // Generate comprehensive session report
  generateSessionReport() {
    const now = new Date();
    const logs = this.getAllLogs();

    // Calculate statistics
    const stats = {
      totalLogs: logs.length,
      errorCount: logs.filter(l => l.type === 'error').length,
      warningCount: logs.filter(l => l.type === 'warning').length,
      successCount: logs.filter(l => l.type === 'success').length,
      infoCount: logs.filter(l => l.type === 'info').length,
      categories: {}
    };

    // Count logs by category
    logs.forEach(log => {
      stats.categories[log.category] = (stats.categories[log.category] || 0) + 1;
    });

    // Find first and last log timestamps
    const firstLog = logs[logs.length - 1];
    const lastLog = logs[0];

    const sessionDuration = firstLog && lastLog
      ? Math.round((new Date(lastLog.timestamp) - new Date(firstLog.timestamp)) / 1000)
      : 0;

    return {
      reportGeneratedAt: now.toISOString(),
      sessionDuration: sessionDuration > 0 ? `${sessionDuration} seconds` : 'N/A',
      statistics: stats,
      firstLogAt: firstLog?.timestamp || 'N/A',
      lastLogAt: lastLog?.timestamp || 'N/A',
      logs: logs
    };
  }

  // Search logs
  searchLogs(query, options = {}) {
    const {
      caseSensitive = false,
      searchInDetails = true,
      type = null,
      category = null
    } = options;

    const searchTerm = caseSensitive ? query : query.toLowerCase();

    return this.logs.filter(log => {
      // Filter by type if specified
      if (type && log.type !== type) return false;

      // Filter by category if specified
      if (category && log.category !== category) return false;

      // Search in message
      const message = caseSensitive ? log.message : log.message.toLowerCase();
      if (message.includes(searchTerm)) return true;

      // Search in details if enabled
      if (searchInDetails) {
        const detailsString = caseSensitive
          ? JSON.stringify(log.details)
          : JSON.stringify(log.details).toLowerCase();

        if (detailsString.includes(searchTerm)) return true;
      }

      return false;
    });
  }

  // Get performance metrics from logs
  getPerformanceMetrics() {
    const chatLogs = this.getLogsByCategory('chat').filter(log =>
      log.details.responseTime && log.type === 'success'
    );

    if (chatLogs.length === 0) {
      return {
        totalRequests: 0,
        averageResponseTime: 0,
        minResponseTime: 0,
        maxResponseTime: 0
      };
    }

    const responseTimes = chatLogs.map(log => {
      const timeStr = log.details.responseTime;
      return parseInt(timeStr.replace('ms', '')) || 0;
    });

    return {
      totalRequests: chatLogs.length,
      averageResponseTime: Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length),
      minResponseTime: Math.min(...responseTimes),
      maxResponseTime: Math.max(...responseTimes)
    };
  }

  // Get error analysis
  getErrorAnalysis() {
    const errorLogs = this.getLogsByType('error');
    const errorTypes = {};
    const errorCategories = {};

    errorLogs.forEach(log => {
      const errorType = log.details.errorType || 'Unknown';
      errorTypes[errorType] = (errorTypes[errorType] || 0) + 1;

      errorCategories[log.category] = (errorCategories[log.category] || 0) + 1;
    });

    return {
      totalErrors: errorLogs.length,
      errorTypes,
      errorCategories,
      recentErrors: errorLogs.slice(0, 5) // Last 5 errors
    };
  }
}