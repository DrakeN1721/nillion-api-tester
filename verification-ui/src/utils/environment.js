/**
 * Environment detection utilities for security and safety checks
 */

export class EnvironmentDetector {
  /**
   * Check if the application is running on localhost
   * @returns {boolean} True if running on localhost/127.0.0.1
   */
  static isLocalhost() {
    if (typeof window === 'undefined') return false;

    const hostname = window.location.hostname;
    const localhostPatterns = [
      'localhost',
      '127.0.0.1',
      '::1',
      '0.0.0.0'
    ];

    return localhostPatterns.includes(hostname);
  }

  /**
   * Check if running in development mode
   * @returns {boolean} True if in development
   */
  static isDevelopment() {
    return process.env.NODE_ENV === 'development';
  }

  /**
   * Check if the environment is safe for API key testing
   * @returns {object} Safety check results
   */
  static getSafetyCheck() {
    const isLocalhost = this.isLocalhost();
    const isDev = this.isDevelopment();
    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'unknown';
    const protocol = typeof window !== 'undefined' ? window.location.protocol : 'unknown';

    return {
      isLocalhost,
      isDevelopment: isDev,
      hostname,
      protocol,
      isSafe: isLocalhost && isDev,
      warnings: this.getWarnings(isLocalhost, isDev, hostname, protocol)
    };
  }

  /**
   * Get warning messages based on environment
   * @param {boolean} isLocalhost
   * @param {boolean} isDev
   * @param {string} hostname
   * @param {string} protocol
   * @returns {array} Array of warning messages
   */
  static getWarnings(isLocalhost, isDev, hostname, protocol) {
    const warnings = [];

    if (!isLocalhost) {
      warnings.push(`⚠️ NOT RUNNING ON LOCALHOST: Current hostname is '${hostname}'. This feature should only be used on localhost for security.`);
    }

    if (!isDev) {
      warnings.push(`⚠️ NOT IN DEVELOPMENT MODE: Running in production mode. API key testing should only be done in development.`);
    }

    if (protocol === 'http:' && !isLocalhost) {
      warnings.push(`⚠️ INSECURE CONNECTION: Using HTTP on non-localhost. API keys could be intercepted.`);
    }

    if (typeof window !== 'undefined' && window.location.port !== '3000' && window.location.port !== '3001' && window.location.port !== '') {
      warnings.push(`⚠️ UNUSUAL PORT: Running on port ${window.location.port}. Typically local dev runs on 3000 or 3001.`);
    }

    return warnings;
  }

  /**
   * Generate a security assessment report
   * @returns {object} Detailed security report
   */
  static getSecurityReport() {
    const safetyCheck = this.getSafetyCheck();

    return {
      timestamp: new Date().toISOString(),
      environment: {
        hostname: safetyCheck.hostname,
        protocol: safetyCheck.protocol,
        port: typeof window !== 'undefined' ? window.location.port : 'unknown',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
      },
      safety: {
        isLocalhost: safetyCheck.isLocalhost,
        isDevelopment: safetyCheck.isDevelopment,
        isSafe: safetyCheck.isSafe,
        riskLevel: this.getRiskLevel(safetyCheck)
      },
      warnings: safetyCheck.warnings,
      recommendations: this.getRecommendations(safetyCheck)
    };
  }

  /**
   * Get risk level based on environment
   * @param {object} safetyCheck
   * @returns {string} Risk level
   */
  static getRiskLevel(safetyCheck) {
    if (safetyCheck.isSafe) return 'LOW';
    if (safetyCheck.isLocalhost) return 'MEDIUM';
    return 'HIGH';
  }

  /**
   * Get security recommendations
   * @param {object} safetyCheck
   * @returns {array} Array of recommendations
   */
  static getRecommendations(safetyCheck) {
    const recommendations = [];

    if (!safetyCheck.isSafe) {
      recommendations.push('🔒 Only use this feature on localhost during development');
      recommendations.push('🚫 Never deploy applications with API keys exposed in the browser');
      recommendations.push('🔐 Use environment variables and server-side API calls in production');
    }

    if (safetyCheck.isLocalhost && safetyCheck.isDevelopment) {
      recommendations.push('✅ Environment appears safe for local API key testing');
      recommendations.push('💡 Remember to remove or secure API keys before deployment');
    }

    return recommendations;
  }
}

/**
 * Session storage key for security settings
 */
export const SECURITY_SETTINGS_KEY = 'nil-ai-security-settings';

/**
 * Security settings manager
 */
export class SecuritySettingsManager {
  /**
   * Get current security settings
   * @returns {object} Current settings
   */
  static getSettings() {
    try {
      const stored = sessionStorage.getItem(SECURITY_SETTINGS_KEY);
      return stored ? JSON.parse(stored) : this.getDefaultSettings();
    } catch (error) {
      console.warn('Failed to load security settings:', error);
      return this.getDefaultSettings();
    }
  }

  /**
   * Get default security settings
   * @returns {object} Default settings
   */
  static getDefaultSettings() {
    const safetyCheck = EnvironmentDetector.getSafetyCheck();

    return {
      allowBrowserApiKeys: safetyCheck.isSafe, // Auto-enable if safe
      acknowledgedRisks: safetyCheck.isSafe,   // Auto-acknowledge if safe
      sessionId: Date.now(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Update security settings
   * @param {object} settings New settings
   */
  static updateSettings(settings) {
    const current = this.getSettings();
    const updated = {
      ...current,
      ...settings,
      timestamp: new Date().toISOString()
    };

    sessionStorage.setItem(SECURITY_SETTINGS_KEY, JSON.stringify(updated));

    // Log security setting change for audit trail
    console.log('Security settings updated:', {
      allowBrowserApiKeys: updated.allowBrowserApiKeys,
      acknowledgedRisks: updated.acknowledgedRisks,
      timestamp: updated.timestamp,
      environment: EnvironmentDetector.getSafetyCheck()
    });
  }

  /**
   * Reset security settings
   */
  static resetSettings() {
    sessionStorage.removeItem(SECURITY_SETTINGS_KEY);
  }

  /**
   * Check if API key testing is allowed
   * @returns {boolean} True if allowed
   */
  static isApiKeyTestingAllowed() {
    const settings = this.getSettings();
    const safetyCheck = EnvironmentDetector.getSafetyCheck();

    return settings.allowBrowserApiKeys &&
           settings.acknowledgedRisks &&
           safetyCheck.isSafe;
  }
}