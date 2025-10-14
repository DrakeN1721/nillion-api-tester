/**
 * AuthManager - Factory for Nil AI Authentication Providers
 *
 * Supports two authentication methods:
 * 1. SDK (Recommended) - Official Nillion SDK with NUC token generation
 * 2. Bearer Token (Deprecated/Testing) - Raw HTTP with Bearer token
 *
 * Usage:
 *   const auth = AuthManager.create('sdk', { apiKey: 'your-key' });
 *   const result = await auth.testConnection();
 */

import { SDKAuthProvider } from './SDKAuthProvider.js';
import { BearerTokenAuthProvider } from './BearerTokenAuthProvider.js';

export const AuthMode = {
  SDK: 'sdk',
  BEARER: 'bearer'
};

export class AuthManager {
  /**
   * Create an authentication provider
   * @param {string} mode - 'sdk' or 'bearer'
   * @param {object} config - Configuration object
   * @param {string} config.apiKey - API key for SDK mode
   * @param {string} config.bearerToken - Bearer token for bearer mode
   * @param {string} config.model - Model to use (optional)
   * @param {string} config.baseURL - Base URL (optional)
   * @returns {SDKAuthProvider|BearerTokenAuthProvider}
   */
  static create(mode, config) {
    // Validate mode
    if (!Object.values(AuthMode).includes(mode)) {
      throw new Error(`Invalid authentication mode: ${mode}. Must be 'sdk' or 'bearer'.`);
    }

    // Warn if using deprecated bearer token mode
    if (mode === AuthMode.BEARER) {
      console.warn('\n⚠️  WARNING: Bearer Token Authentication is DEPRECATED');
      console.warn('   This mode is provided for testing purposes only.');
      console.warn('   The official Nillion SDK (mode: "sdk") is the recommended method.');
      console.warn('   Bearer token authentication may not work and will likely return 401 errors.\n');
    }

    // Create appropriate provider
    switch (mode) {
      case AuthMode.SDK:
        if (!config.apiKey) {
          throw new Error('SDK authentication requires an apiKey');
        }
        return new SDKAuthProvider(config);

      case AuthMode.BEARER:
        if (!config.bearerToken) {
          throw new Error('Bearer token authentication requires a bearerToken');
        }
        return new BearerTokenAuthProvider(config);

      default:
        throw new Error(`Unsupported authentication mode: ${mode}`);
    }
  }

  /**
   * Get information about available authentication modes
   * @returns {object} Information about each mode
   */
  static getAuthModes() {
    return {
      sdk: {
        name: 'SDK Authentication',
        status: 'Recommended',
        description: 'Official Nillion SDK with automatic NUC token generation',
        requiresSDK: true,
        deprecated: false,
        expectedToWork: true
      },
      bearer: {
        name: 'Bearer Token Authentication',
        status: 'Deprecated - Testing Only',
        description: 'Raw HTTP requests with Authorization: Bearer header',
        requiresSDK: false,
        deprecated: true,
        expectedToWork: false,
        warning: 'This method is deprecated and will likely fail with 401 Unauthorized'
      }
    };
  }

  /**
   * Validate authentication configuration
   * @param {string} mode - Authentication mode
   * @param {object} config - Configuration object
   * @returns {object} Validation result
   */
  static validateConfig(mode, config) {
    const errors = [];

    if (!mode) {
      errors.push('Authentication mode is required');
    } else if (!Object.values(AuthMode).includes(mode)) {
      errors.push(`Invalid mode: ${mode}`);
    }

    if (mode === AuthMode.SDK && !config.apiKey) {
      errors.push('SDK mode requires apiKey');
    }

    if (mode === AuthMode.BEARER && !config.bearerToken) {
      errors.push('Bearer mode requires bearerToken');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Compare both authentication methods side-by-side
   * @param {object} config - Configuration with both apiKey and bearerToken
   * @returns {Promise<object>} Comparison results
   */
  static async compareAuthMethods(config) {
    const results = {
      timestamp: new Date().toISOString(),
      comparison: {},
      recommendation: null
    };

    try {
      // Test SDK authentication
      console.log('\n🔍 Testing SDK Authentication...');
      const sdkProvider = AuthManager.create(AuthMode.SDK, {
        apiKey: config.apiKey,
        model: config.model,
        baseURL: config.baseURL
      });
      const sdkResult = await sdkProvider.testConnection();
      results.comparison.sdk = {
        mode: 'SDK',
        ...sdkResult,
        expectedToWork: true
      };

      // Test Bearer token authentication
      console.log('\n🔍 Testing Bearer Token Authentication...');
      const bearerProvider = AuthManager.create(AuthMode.BEARER, {
        bearerToken: config.bearerToken,
        model: config.model,
        baseURL: config.baseURL
      });
      const bearerResult = await bearerProvider.testConnection();
      results.comparison.bearer = {
        mode: 'Bearer Token',
        ...bearerResult,
        expectedToWork: false
      };

      // Generate recommendation
      if (results.comparison.sdk.success && !results.comparison.bearer.success) {
        results.recommendation = 'Use SDK authentication (as expected - bearer token is deprecated)';
      } else if (!results.comparison.sdk.success && results.comparison.bearer.success) {
        results.recommendation = 'Unexpected: Bearer token works but SDK fails - investigate SDK configuration';
      } else if (results.comparison.sdk.success && results.comparison.bearer.success) {
        results.recommendation = 'Both methods work, but SDK is still recommended';
      } else {
        results.recommendation = 'Both methods failed - check credentials and network';
      }

      return results;

    } catch (error) {
      results.error = error.message;
      results.recommendation = 'Comparison failed - check configuration';
      return results;
    }
  }
}
