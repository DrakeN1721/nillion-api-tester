/**
 * BearerTokenService - Browser-Compatible Bearer Token Authentication
 *
 * This service provides bearer token authentication for the Electron/React app.
 * Uses the "Nillion2025" token for testing and comparison against API key authentication.
 *
 * Key Features:
 * - Browser-compatible (uses fetch, no Node.js dependencies)
 * - Tests bearer token functionality
 * - Provides comparison data against SDK authentication
 * - Identifies which authentication method works
 */

export class BearerTokenService {
  constructor(config = {}) {
    this.bearerToken = config.bearerToken || 'Nillion2025';
    this.baseURL = (config.baseURL || 'https://nilai-a779.nillion.network/v1').replace(/\/$/, '');
    this.model = config.model || 'google/gemma-3-27b-it';
  }

  /**
   * Test bearer token authentication by fetching models
   * @returns {Promise<object>} Test result
   */
  async testConnection() {
    try {
      const startTime = Date.now();

      const response = await fetch(`${this.baseURL}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
          'Accept': 'application/json'
        }
      });

      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        return {
          success: false,
          status: response.status,
          error: `HTTP ${response.status}: ${response.statusText}`,
          responseTime
        };
      }

      const data = await response.json();

      return {
        success: true,
        status: response.status,
        models: data,
        modelCount: data.length,
        modelNames: data.map(m => m.id || m.name),
        responseTime,
        timestamp: new Date().toISOString(),
        note: 'Bearer token works for read-only operations (models, health, usage)'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        errorType: error.name || 'NetworkError'
      };
    }
  }

  /**
   * Get service health status
   * @returns {Promise<object>} Health check result
   */
  async checkHealth() {
    try {
      const startTime = Date.now();

      // Health endpoint doesn't need /v1 prefix
      const healthURL = this.baseURL.replace('/v1', '') + '/health';

      const response = await fetch(healthURL, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
          'Accept': 'application/json'
        }
      });

      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        return {
          success: false,
          status: response.status,
          error: `HTTP ${response.status}: ${response.statusText}`,
          responseTime
        };
      }

      const data = await response.json();

      return {
        success: true,
        status: response.status,
        health: data,
        serviceStatus: data.status,
        uptime: data.uptime,
        responseTime,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        errorType: error.name || 'NetworkError'
      };
    }
  }

  /**
   * Get usage statistics
   * @returns {Promise<object>} Usage stats result
   */
  async getUsageStats() {
    try {
      const startTime = Date.now();

      // Usage endpoint doesn't need /v1 prefix
      const usageURL = this.baseURL.replace('/v1', '') + '/usage';

      const response = await fetch(usageURL, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
          'Accept': 'application/json'
        }
      });

      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        return {
          success: false,
          status: response.status,
          error: `HTTP ${response.status}: ${response.statusText}`,
          responseTime
        };
      }

      const data = await response.json();

      return {
        success: true,
        status: response.status,
        usage: data,
        queries: data.queries,
        totalTokens: data.total_tokens,
        completionTokens: data.completion_tokens,
        promptTokens: data.prompt_tokens,
        responseTime,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        errorType: error.name || 'NetworkError'
      };
    }
  }

  /**
   * Test chat completions (expected to fail with 500 error for Nillion2025 token)
   * @param {string} message - Test message
   * @returns {Promise<object>} Chat result
   */
  async testChatCompletions(message = 'Test') {
    try {
      const startTime = Date.now();

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: message }],
          max_tokens: 50,
          temperature: 0.7
        })
      });

      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          status: response.status,
          error: errorText || `HTTP ${response.status}: ${response.statusText}`,
          responseTime,
          expectedFailure: response.status === 500,
          note: response.status === 500 ? 'Expected failure - bearer token is read-only' : undefined
        };
      }

      const data = await response.json();

      return {
        success: true,
        status: response.status,
        response: data.choices?.[0]?.message?.content,
        usage: data.usage,
        responseTime,
        timestamp: new Date().toISOString(),
        note: 'Unexpected success - bearer token typically cannot perform chat completions'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        errorType: error.name || 'NetworkError'
      };
    }
  }

  /**
   * Send a chat message with conversation history
   * @param {string} message - User message
   * @param {Array} history - Chat history
   * @returns {Promise<object>} Chat response
   */
  async sendChatMessage(message, history = []) {
    try {
      const startTime = Date.now();

      // Build messages array from history (last 10 messages for context)
      const messages = [...history.slice(-10), { role: 'user', content: message }];

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

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: errorText || `HTTP ${response.status}: ${response.statusText}`,
          responseTime
        };
      }

      const data = await response.json();

      return {
        success: true,
        response: data.choices?.[0]?.message?.content,
        usage: data.usage,
        responseTime,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        errorType: error.name || 'NetworkError'
      };
    }
  }

  /**
   * Run comprehensive bearer token tests
   * @returns {Promise<object>} Complete test results
   */
  async runFullTest() {
    const results = {
      bearerToken: this.bearerToken.substring(0, 8) + '...',
      baseURL: this.baseURL,
      model: this.model,
      timestamp: new Date().toISOString(),
      tests: {}
    };

    // Test 1: Models endpoint
    results.tests.models = await this.testConnection();

    // Test 2: Health check
    results.tests.health = await this.checkHealth();

    // Test 3: Usage statistics
    results.tests.usage = await this.getUsageStats();

    // Test 4: Chat completions (expected to fail)
    results.tests.chat = await this.testChatCompletions();

    // Summary
    results.summary = {
      modelsWork: results.tests.models.success,
      healthWorks: results.tests.health.success,
      usageWorks: results.tests.usage.success,
      chatWorks: results.tests.chat.success,
      overallStatus: results.tests.models.success ? 'partial' : 'failed',
      note: 'Bearer token "Nillion2025" works for read-only operations but not chat completions'
    };

    return results;
  }

  /**
   * Compare bearer token results against API key results
   * @param {object} apiKeyResults - Results from SDK authentication
   * @returns {Promise<object>} Comparison results
   */
  async compareWithAPIKey(apiKeyResults) {
    const bearerResults = await this.runFullTest();

    return {
      timestamp: new Date().toISOString(),
      comparison: {
        apiKey: {
          works: apiKeyResults?.success || false,
          status: apiKeyResults?.success ? 'working' : 'failed',
          error: apiKeyResults?.error
        },
        bearerToken: {
          works: bearerResults.tests.models.success,
          status: bearerResults.tests.models.success ? 'partial' : 'failed',
          limitations: 'Read-only operations only'
        }
      },
      diagnosis: this._generateDiagnosis(apiKeyResults, bearerResults),
      recommendations: this._generateRecommendations(apiKeyResults, bearerResults),
      details: {
        apiKey: apiKeyResults,
        bearerToken: bearerResults
      }
    };
  }

  /**
   * Generate diagnosis based on test results
   * @private
   */
  _generateDiagnosis(apiKeyResults, bearerResults) {
    const apiWorks = apiKeyResults?.success || false;
    const bearerWorks = bearerResults.tests.models.success;

    if (apiWorks && bearerWorks) {
      return {
        scenario: 'ALL_WORKING',
        severity: 'success',
        message: 'Both API key and bearer token authentication are working',
        icon: '✅'
      };
    } else if (apiWorks && !bearerWorks) {
      return {
        scenario: 'API_KEY_ONLY',
        severity: 'info',
        message: 'API key works (expected). Bearer token limitations are normal.',
        icon: '✅'
      };
    } else if (!apiWorks && bearerWorks) {
      return {
        scenario: 'BEARER_ONLY',
        severity: 'warning',
        message: 'API key failed but bearer token works. Check your API key or subscription.',
        icon: '⚠️'
      };
    } else {
      return {
        scenario: 'BOTH_FAILED',
        severity: 'error',
        message: 'Both authentication methods failed. Service may be down or credentials invalid.',
        icon: '❌'
      };
    }
  }

  /**
   * Generate actionable recommendations
   * @private
   */
  _generateRecommendations(apiKeyResults, bearerResults) {
    const recommendations = [];
    const apiWorks = apiKeyResults?.success || false;
    const bearerWorks = bearerResults.tests.models.success;

    if (!apiWorks && !bearerWorks) {
      recommendations.push({
        priority: 'high',
        title: 'Service may be down',
        description: 'Both authentication methods failed. Check service status.',
        action: 'Visit https://status.nillion.com or try again later'
      });
    } else if (!apiWorks && bearerWorks) {
      recommendations.push({
        priority: 'high',
        title: 'API key issue detected',
        description: 'Bearer token works but API key fails. This suggests an API key or subscription problem.',
        action: 'Verify your API key at https://subscription.nillion.com'
      });
      recommendations.push({
        priority: 'medium',
        title: 'Check key format',
        description: 'Ensure your API key is exactly 64 hexadecimal characters',
        action: 'Re-copy your API key from the subscription portal'
      });
    } else if (apiWorks) {
      recommendations.push({
        priority: 'info',
        title: 'All systems working',
        description: 'Your API key is valid and working correctly',
        action: 'Continue using the SDK for full functionality'
      });
    }

    return recommendations;
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
      token: this.bearerToken.substring(0, 8) + '...',
      baseURL: this.baseURL,
      model: this.model,
      limitations: [
        'Read-only operations only',
        'Cannot perform chat completions',
        'Limited to: /models, /health, /usage, /attestation'
      ],
      warning: 'Use official SDK for full functionality'
    };
  }
}

export default BearerTokenService;
