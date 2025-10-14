/**
 * BearerTokenAuthProvider - Raw HTTP Bearer Token Authentication
 *
 * ⚠️ DEPRECATED - TESTING ONLY ⚠️
 *
 * This authentication method uses raw HTTP requests with Bearer token headers.
 * According to Nillion documentation, this approach is DEPRECATED and will likely
 * fail with 401 Unauthorized errors.
 *
 * This implementation is provided for:
 * - Testing legacy authentication methods
 * - Demonstrating why SDK is required
 * - Educational purposes
 * - Verifying that deprecated tokens (like "Nillion2025") no longer work
 *
 * Expected Result: 401 Unauthorized (Authentication Failed)
 * Recommended: Use SDKAuthProvider instead
 */

export class BearerTokenAuthProvider {
  constructor(config) {
    this.mode = 'bearer';
    this.bearerToken = config.bearerToken;
    this.baseURL = config.baseURL || 'https://nilai-a779.nillion.network/v1';
    this.model = config.model || 'google/gemma-3-27b-it';

    // Validate configuration
    if (!this.bearerToken) {
      throw new Error('Bearer token is required for bearer token authentication');
    }

    // Note: No trailing slash required for raw HTTP endpoints
    // (different from SDK which requires trailing slash)

    // Log deprecation warning
    console.warn('⚠️  Bearer Token Authentication is DEPRECATED and likely to fail');
  }

  /**
   * Test API connection using raw HTTP with Bearer token
   * Tests the /models endpoint (which works) instead of /chat/completions
   * @returns {Promise<object>} Test result
   */
  async testConnection() {
    try {
      const startTime = Date.now();

      // Test with /models endpoint which works with bearer tokens
      const response = await fetch(`${this.baseURL}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
          'Accept': 'application/json'
        }
      });

      const responseTime = Date.now() - startTime;
      const contentType = response.headers.get('content-type');
      let responseData;

      // Try to parse response
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      // Check if request was successful
      if (response.ok && Array.isArray(responseData) && responseData.length > 0) {
        // Successfully got models list
        const modelsList = responseData.map(m => m.id || m.name).join(', ');
        return {
          success: true,
          mode: 'Bearer Token',
          method: 'Raw HTTP with Authorization: Bearer header',
          status: response.status,
          response: `Bearer token authentication works! Found ${responseData.length} model(s): ${modelsList}`,
          model: 'N/A (tested /models endpoint)',
          models: responseData,
          responseTime,
          timestamp: new Date().toISOString(),
          note: 'Bearer token is functional for read-only operations (models, health, usage)',
          warning: 'Chat completions not supported with this token - returns 500 error',
          details: {
            baseURL: this.baseURL,
            endpoint: '/models',
            bearerToken: `${this.bearerToken.substring(0, Math.min(8, this.bearerToken.length))}...`,
            httpStatus: response.status,
            modelsFound: responseData.length
          }
        };
      } else {
        // Expected failure case
        return {
          success: false,
          mode: 'Bearer Token',
          method: 'Raw HTTP with Authorization: Bearer header',
          status: response.status,
          error: responseData.error?.message || responseData.message || responseData || 'Authentication failed',
          expectedFailure: true,
          note: 'This is expected - bearer token authentication is deprecated',
          responseTime,
          timestamp: new Date().toISOString(),
          details: {
            baseURL: this.baseURL,
            bearerToken: `${this.bearerToken.substring(0, 8)}...`,
            httpStatus: response.status,
            responseBody: typeof responseData === 'string' ? responseData.substring(0, 200) : JSON.stringify(responseData).substring(0, 200)
          }
        };
      }
    } catch (error) {
      return {
        success: false,
        mode: 'Bearer Token',
        method: 'Raw HTTP with Authorization: Bearer header',
        error: error.message,
        errorType: error.name || 'NetworkError',
        expectedFailure: true,
        note: 'This is expected - bearer token authentication is deprecated',
        timestamp: new Date().toISOString(),
        details: {
          baseURL: this.baseURL,
          bearerToken: `${this.bearerToken.substring(0, 8)}...`
        }
      };
    }
  }

  /**
   * Send a chat message using Bearer token
   * @param {string} message - User message
   * @param {array} chatHistory - Previous messages for context
   * @returns {Promise<object>} Chat response
   */
  async sendMessage(message, chatHistory = []) {
    try {
      const startTime = Date.now();

      // Prepare messages with context (keep last 10 messages)
      const contextMessages = chatHistory.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Add the new user message
      const messages = [...contextMessages, { role: 'user', content: message }];

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          max_tokens: 500,
          temperature: 0.7
        })
      });

      const responseTime = Date.now() - startTime;
      const contentType = response.headers.get('content-type');
      let responseData;

      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      if (response.ok && responseData.choices && responseData.choices[0]) {
        return {
          success: true,
          mode: 'Bearer Token',
          status: response.status,
          response: responseData.choices[0].message.content,
          model: responseData.model || this.model,
          usage: responseData.usage,
          responseTime,
          timestamp: new Date().toISOString(),
          warning: 'Unexpected success - bearer token method should be deprecated'
        };
      } else {
        return {
          success: false,
          mode: 'Bearer Token',
          status: response.status,
          error: responseData.error?.message || responseData.message || responseData || 'Authentication failed',
          expectedFailure: true,
          responseTime,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      return {
        success: false,
        mode: 'Bearer Token',
        error: error.message,
        errorType: error.name || 'NetworkError',
        expectedFailure: true,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * List available models using Bearer token
   * @returns {Promise<object>} Models list or error
   */
  async listModels() {
    try {
      const response = await fetch(`${this.baseURL}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
          'Accept': 'application/json'
        }
      });

      const contentType = response.headers.get('content-type');
      let responseData;

      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      if (response.ok && responseData.data) {
        return {
          success: true,
          mode: 'Bearer Token',
          status: response.status,
          models: responseData.data,
          timestamp: new Date().toISOString(),
          warning: 'Unexpected success - bearer token method should be deprecated'
        };
      } else {
        return {
          success: false,
          mode: 'Bearer Token',
          status: response.status,
          error: responseData.error?.message || responseData.message || responseData || 'Failed to list models',
          expectedFailure: true,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      return {
        success: false,
        mode: 'Bearer Token',
        error: error.message,
        expectedFailure: true,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get provider information
   * @returns {object} Provider details
   */
  getInfo() {
    return {
      mode: 'Bearer Token',
      name: 'Bearer Token Authentication',
      description: 'Raw HTTP with Authorization: Bearer header',
      status: 'Deprecated - Testing Only',
      deprecated: true,
      expectedToWork: false,
      warning: 'This method is deprecated and will likely fail with 401 Unauthorized',
      config: {
        baseURL: this.baseURL,
        model: this.model,
        bearerToken: `${this.bearerToken.substring(0, 8)}...`
      }
    };
  }

  /**
   * Set the model to use
   * @param {string} model - Model identifier
   */
  setModel(model) {
    this.model = model;
  }

  /**
   * Get the current model
   * @returns {string} Current model
   */
  getModel() {
    return this.model;
  }
}
