/**
 * DiagnosticService - Comprehensive API Key Failure Investigation
 *
 * This service provides automated testing and diagnosis to identify:
 * 1. Whether API key works with SDK
 * 2. Whether bearer token works as fallback
 * 3. Subscription status verification
 * 4. Detailed failure analysis and recommendations
 *
 * Use Case: When API key fails, run full diagnostic to determine root cause
 */

import { AuthManager, AuthMode } from './AuthManager.js';

export class DiagnosticService {
  constructor(config = {}) {
    this.config = {
      apiKey: config.apiKey,
      bearerToken: config.bearerToken || 'Nillion2025',
      model: config.model || 'google/gemma-3-27b-it',
      baseURL: config.baseURL || 'https://nilai-a779.nillion.network/v1',
      verbose: config.verbose !== false
    };

    this.results = {
      timestamp: new Date().toISOString(),
      config: {
        apiKey: this.config.apiKey,
        bearerToken: this.config.bearerToken,
        model: this.config.model,
        baseURL: this.config.baseURL
      },
      tests: {},
      diagnosis: null,
      recommendations: []
    };
  }

  /**
   * Run comprehensive diagnostic suite
   * @returns {Promise<object>} Complete diagnostic report
   */
  async runFullDiagnostic() {
    this.log('\n🔍 NILLION API COMPREHENSIVE DIAGNOSTIC');
    this.log('========================================\n');

    // Phase 1: API Key Testing (if provided)
    if (this.config.apiKey) {
      await this.testSDKAuthentication();
    } else {
      this.results.tests.sdk = {
        skipped: true,
        reason: 'No API key provided'
      };
      this.log('⚠️  Phase 1: SDK Testing - SKIPPED (no API key provided)\n');
    }

    // Phase 2: Bearer Token Testing
    await this.testBearerTokenAuthentication();

    // Phase 3: Endpoint Availability
    await this.testEndpointAvailability();

    // Phase 4: Service Health
    await this.testServiceHealth();

    // Phase 5: Usage Statistics (if bearer token works)
    if (this.results.tests.bearer?.models?.success) {
      await this.testUsageStatistics();
    }

    // Phase 6: Generate Diagnosis
    this.generateDiagnosis();

    // Phase 7: Generate Recommendations
    this.generateRecommendations();

    // Phase 8: Subscription Verification (optional)
    if (this.config.apiKey) {
      await this.verifySubscriptionStatus();
    }

    return this.results;
  }

  /**
   * Test SDK authentication with API key
   */
  async testSDKAuthentication() {
    this.log('📋 Phase 1: Testing SDK Authentication');
    this.log('--------------------------------------');

    try {
      const provider = AuthManager.create(AuthMode.SDK, {
        apiKey: this.config.apiKey,
        model: this.config.model,
        baseURL: this.config.baseURL
      });

      this.log('Testing connection with SDK...');
      const result = await provider.testConnection();

      this.results.tests.sdk = {
        success: result.success,
        method: 'SDK with NUC tokens',
        result: result,
        timestamp: new Date().toISOString()
      };

      if (result.success) {
        this.log(`✅ SDK authentication WORKS`);
        this.log(`   Response: ${result.response}`);
        this.log(`   Response time: ${result.responseTime}ms`);
      } else {
        this.log(`❌ SDK authentication FAILED`);
        this.log(`   Error: ${result.error}`);
      }
    } catch (error) {
      this.results.tests.sdk = {
        success: false,
        error: error.message,
        errorType: error.name,
        timestamp: new Date().toISOString()
      };
      this.log(`❌ SDK test error: ${error.message}`);
    }

    this.log('');
  }

  /**
   * Test bearer token authentication
   */
  async testBearerTokenAuthentication() {
    this.log('📋 Phase 2: Testing Bearer Token Authentication');
    this.log('-----------------------------------------------');

    try {
      const provider = AuthManager.create(AuthMode.BEARER, {
        bearerToken: this.config.bearerToken,
        model: this.config.model,
        baseURL: this.config.baseURL
      });

      // Test 1: Models endpoint
      this.log('Testing /models endpoint with bearer token...');
      const modelsResult = await provider.testConnection();

      this.results.tests.bearer = {
        models: {
          success: modelsResult.success,
          result: modelsResult,
          timestamp: new Date().toISOString()
        }
      };

      if (modelsResult.success) {
        this.log(`✅ Bearer token /models endpoint WORKS`);
        this.log(`   Found models: ${modelsResult.models?.map(m => m.id).join(', ')}`);
      } else {
        this.log(`❌ Bearer token /models endpoint FAILED`);
        this.log(`   Error: ${modelsResult.error}`);
      }

      // Test 2: Chat completions (expected to fail)
      this.log('\nTesting /chat/completions with bearer token...');
      const chatResult = await provider.sendMessage('Test message');

      this.results.tests.bearer.chatCompletions = {
        success: chatResult.success,
        result: chatResult,
        expectedFailure: true,
        timestamp: new Date().toISOString()
      };

      if (chatResult.success) {
        this.log(`⚠️  Bearer token chat completions WORKS (unexpected!)`);
      } else {
        this.log(`✓ Bearer token chat completions FAILED (expected - read-only token)`);
      }

    } catch (error) {
      this.results.tests.bearer = {
        error: error.message,
        timestamp: new Date().toISOString()
      };
      this.log(`❌ Bearer token test error: ${error.message}`);
    }

    this.log('');
  }

  /**
   * Test endpoint availability
   */
  async testEndpointAvailability() {
    this.log('📋 Phase 3: Testing Endpoint Availability');
    this.log('-----------------------------------------');

    const endpoints = [
      { path: '/models', method: 'GET', needsAuth: true },
      { path: '/health', method: 'GET', needsAuth: false },
      { path: '/chat/completions', method: 'POST', needsAuth: true }
    ];

    this.results.tests.endpoints = {};

    for (const endpoint of endpoints) {
      try {
        const headers = {};
        if (endpoint.needsAuth) {
          headers['Authorization'] = `Bearer ${this.config.bearerToken}`;
        }

        let url = this.config.baseURL;
        if (!url.endsWith('/')) url += '/';
        url = url.replace('/v1/', '') + endpoint.path;

        const options = { method: endpoint.method, headers };

        if (endpoint.method === 'POST') {
          headers['Content-Type'] = 'application/json';
          options.body = JSON.stringify({
            model: this.config.model,
            messages: [{ role: 'user', content: 'test' }]
          });
        }

        const response = await fetch(url, options);

        this.results.tests.endpoints[endpoint.path] = {
          method: endpoint.method,
          status: response.status,
          ok: response.ok,
          available: response.status !== 404
        };

        const statusSymbol = response.ok ? '✅' : response.status === 404 ? '❌' : '⚠️';
        this.log(`${statusSymbol} ${endpoint.method} ${endpoint.path} → ${response.status}`);

      } catch (error) {
        this.results.tests.endpoints[endpoint.path] = {
          method: endpoint.method,
          error: error.message,
          available: false
        };
        this.log(`❌ ${endpoint.method} ${endpoint.path} → Error: ${error.message}`);
      }
    }

    this.log('');
  }

  /**
   * Test service health
   */
  async testServiceHealth() {
    this.log('📋 Phase 4: Testing Service Health');
    this.log('----------------------------------');

    try {
      let url = this.config.baseURL;
      if (!url.endsWith('/')) url += '/';
      url = url.replace('/v1/', '') + '/health';

      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        this.results.tests.health = {
          success: true,
          status: data.status,
          uptime: data.uptime,
          timestamp: new Date().toISOString()
        };

        this.log(`✅ Service is healthy`);
        this.log(`   Status: ${data.status}`);
        this.log(`   Uptime: ${data.uptime}`);
      } else {
        this.results.tests.health = {
          success: false,
          status: response.status
        };
        this.log(`⚠️  Service health check returned: ${response.status}`);
      }
    } catch (error) {
      this.results.tests.health = {
        success: false,
        error: error.message
      };
      this.log(`❌ Service health check failed: ${error.message}`);
    }

    this.log('');
  }

  /**
   * Test usage statistics
   */
  async testUsageStatistics() {
    this.log('📋 Phase 5: Checking Usage Statistics');
    this.log('-------------------------------------');

    try {
      let url = this.config.baseURL;
      if (!url.endsWith('/')) url += '/';
      url = url.replace('/v1/', '') + '/usage';

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${this.config.bearerToken}` }
      });

      if (response.ok) {
        const data = await response.json();
        this.results.tests.usage = {
          success: true,
          data: data,
          timestamp: new Date().toISOString()
        };

        this.log(`✅ Usage statistics retrieved`);
        this.log(`   Total queries: ${data.queries}`);
        this.log(`   Total tokens: ${data.total_tokens}`);
        this.log(`   Completion tokens: ${data.completion_tokens}`);
        this.log(`   Prompt tokens: ${data.prompt_tokens}`);
      } else {
        this.results.tests.usage = {
          success: false,
          status: response.status
        };
        this.log(`⚠️  Usage statistics unavailable: ${response.status}`);
      }
    } catch (error) {
      this.results.tests.usage = {
        success: false,
        error: error.message
      };
      this.log(`❌ Usage check failed: ${error.message}`);
    }

    this.log('');
  }

  /**
   * Verify subscription status (attempts to check nilPay)
   */
  async verifySubscriptionStatus() {
    this.log('📋 Phase 6: Verifying Subscription Status');
    this.log('-----------------------------------------');

    // Note: This is a placeholder - actual nilPay verification would require
    // additional authentication or API endpoints
    this.results.tests.subscription = {
      note: 'Subscription verification requires nilPay portal access',
      recommendation: 'Visit https://subscription.nillion.com to check subscription status',
      apiKeyProvided: !!this.config.apiKey,
      apiKeyFormat: this.config.apiKey ?
        (this.config.apiKey.length === 64 ? 'Valid (64 chars)' : `Invalid (${this.config.apiKey.length} chars)`) :
        'Not provided'
    };

    this.log(`ℹ️  Subscription verification requires nilPay portal access`);
    this.log(`   Visit: https://subscription.nillion.com`);
    this.log(`   API Key format: ${this.results.tests.subscription.apiKeyFormat}`);
    this.log('');
  }

  /**
   * Generate diagnosis based on test results
   */
  generateDiagnosis() {
    this.log('📊 DIAGNOSIS');
    this.log('============\n');

    const sdk = this.results.tests.sdk;
    const bearer = this.results.tests.bearer;
    const health = this.results.tests.health;

    // Scenario 1: Everything works
    if (sdk?.success && bearer?.models?.success) {
      this.results.diagnosis = {
        scenario: 'ALL_WORKING',
        code: 'ALL_WORKING',
        severity: 'success',
        title: 'All Systems Operational',
        description: 'Both SDK and bearer token authentication are working correctly.'
      };
      this.log('✅ STATUS: All Systems Operational');
      this.log('   Both SDK and bearer token authentication work correctly.\n');
    }
    // Scenario 2: SDK works, bearer doesn't
    else if (sdk?.success && !bearer?.models?.success) {
      this.results.diagnosis = {
        scenario: 'SDK_ONLY',
        code: 'SDK_ONLY',
        severity: 'info',
        title: 'SDK Authentication Working',
        description: 'SDK authentication works. Bearer token limitations are expected.'
      };
      this.log('✅ STATUS: SDK Authentication Working');
      this.log('   Your API key works correctly with the official SDK.\n');
    }
    // Scenario 3: Bearer works, SDK doesn't (or SDK skipped)
    else if ((sdk?.skipped || !sdk?.success) && bearer?.models?.success) {
      this.results.diagnosis = {
        scenario: 'API_KEY_ISSUE',
        code: 'API_KEY_ISSUE',
        severity: 'error',
        title: 'API Key Authentication Failed',
        description: 'Bearer token works but API key fails. This indicates an issue with your API key or subscription.'
      };
      this.log('❌ STATUS: API Key Authentication Failed');
      this.log('   Bearer token works, but your API key does not.');
      this.log('   This suggests an API key or subscription issue.\n');
    }
    // Scenario 4: Neither works but service is healthy
    else if (!sdk?.success && !bearer?.models?.success && health?.success) {
      this.results.diagnosis = {
        scenario: 'AUTHENTICATION_FAILURE',
        code: 'AUTHENTICATION_FAILURE',
        severity: 'error',
        title: 'Complete Authentication Failure',
        description: 'Service is healthy but all authentication methods fail.'
      };
      this.log('❌ STATUS: Complete Authentication Failure');
      this.log('   Service is running but both authentication methods fail.\n');
    }
    // Scenario 5: Service is down
    else if (!health?.success) {
      this.results.diagnosis = {
        scenario: 'SERVICE_DOWN',
        code: 'SERVICE_DOWN',
        severity: 'critical',
        title: 'Service Unavailable',
        description: 'The Nillion API service appears to be down or unreachable.'
      };
      this.log('🔴 STATUS: Service Unavailable');
      this.log('   The API service is not responding to health checks.\n');
    }
    // Scenario 6: SDK skipped (only if bearer also failed)
    else if (sdk?.skipped && !bearer?.models?.success) {
      this.results.diagnosis = {
        scenario: 'NO_API_KEY',
        code: 'NO_API_KEY',
        severity: 'warning',
        title: 'No API Key Provided',
        description: 'Cannot test SDK authentication without an API key. Bearer token test only.'
      };
      this.log('⚠️  STATUS: Incomplete Testing');
      this.log('   No API key provided - only bearer token tested.\n');
    }
    // Scenario 7: Unknown
    else {
      this.results.diagnosis = {
        scenario: 'UNKNOWN',
        code: 'UNKNOWN',
        severity: 'warning',
        title: 'Inconclusive Results',
        description: 'Unable to determine exact issue. Review detailed test results.'
      };
      this.log('⚠️  STATUS: Inconclusive');
      this.log('   Unable to determine exact issue.\n');
    }
  }

  /**
   * Generate actionable recommendations
   */
  generateRecommendations() {
    this.log('💡 RECOMMENDATIONS');
    this.log('==================\n');

    const code = this.results.diagnosis?.code;
    const recommendations = [];

    switch (code) {
      case 'ALL_WORKING':
        recommendations.push({
          priority: 'info',
          action: 'No action required',
          description: 'Your setup is working correctly.'
        });
        this.log('✓ No action required - your setup is working correctly.\n');
        break;

      case 'SDK_ONLY':
        recommendations.push({
          priority: 'info',
          action: 'Continue using SDK authentication',
          description: 'SDK is the recommended method for production use.'
        });
        this.log('✓ Continue using SDK authentication for production.\n');
        break;

      case 'API_KEY_ISSUE':
        recommendations.push(
          {
            priority: 'high',
            action: 'Verify API key format',
            description: 'Ensure your API key is exactly 64 hexadecimal characters.',
            check: this.config.apiKey?.length === 64 ? '✓ Length correct' : '✗ Length incorrect'
          },
          {
            priority: 'high',
            action: 'Check subscription status',
            description: 'Visit https://subscription.nillion.com to verify your subscription is active.',
            url: 'https://subscription.nillion.com'
          },
          {
            priority: 'medium',
            action: 'Verify API key source',
            description: 'Ensure you copied the key correctly from the subscription portal.'
          },
          {
            priority: 'medium',
            action: 'Check SDK installation',
            description: 'Run: npm install @nillion/nilai-ts',
            command: 'npm install @nillion/nilai-ts'
          }
        );

        this.log('1. Verify API key format (should be 64 hexadecimal characters)');
        this.log(`   Your key length: ${this.config.apiKey?.length || 0} characters`);
        this.log('');
        this.log('2. Check subscription status at: https://subscription.nillion.com');
        this.log('');
        this.log('3. Verify you copied the API key correctly');
        this.log('');
        this.log('4. Ensure SDK is installed: npm install @nillion/nilai-ts');
        this.log('');
        break;

      case 'AUTHENTICATION_FAILURE':
        recommendations.push(
          {
            priority: 'high',
            action: 'Check network connectivity',
            description: 'Verify you can reach nilai-a779.nillion.network'
          },
          {
            priority: 'high',
            action: 'Verify base URL',
            description: 'Ensure using correct endpoint: https://nilai-a779.nillion.network/v1/'
          },
          {
            priority: 'medium',
            action: 'Check for service announcements',
            description: 'Visit Nillion status page or community channels'
          }
        );

        this.log('1. Check network connectivity to nilai-a779.nillion.network');
        this.log('2. Verify base URL is correct');
        this.log('3. Check for service maintenance announcements');
        this.log('');
        break;

      case 'SERVICE_DOWN':
        recommendations.push(
          {
            priority: 'critical',
            action: 'Wait and retry',
            description: 'Service may be temporarily unavailable. Try again in a few minutes.'
          },
          {
            priority: 'high',
            action: 'Check service status',
            description: 'Visit Nillion status page or contact support'
          }
        );

        this.log('1. Service appears to be down - wait and retry in a few minutes');
        this.log('2. Check Nillion service status page');
        this.log('3. Contact Nillion support if issue persists');
        this.log('');
        break;

      case 'NO_API_KEY':
        recommendations.push({
          priority: 'info',
          action: 'Provide API key for full testing',
          description: 'Add your API key to test SDK authentication'
        });

        this.log('1. Provide an API key to test SDK authentication');
        this.log('2. Get your API key from: https://subscription.nillion.com');
        this.log('');
        break;

      default:
        recommendations.push({
          priority: 'medium',
          action: 'Review detailed test results',
          description: 'Check individual test results for more information'
        });

        this.log('1. Review detailed test results above');
        this.log('2. Contact support with diagnostic report if issue persists');
        this.log('');
    }

    this.results.recommendations = recommendations;
  }

  /**
   * Log helper
   */
  log(message) {
    if (this.config.verbose) {
      console.log(message);
    }
  }

  /**
   * Generate text report
   */
  generateTextReport() {
    const lines = [];
    lines.push('═'.repeat(70));
    lines.push('NILLION API DIAGNOSTIC REPORT');
    lines.push('═'.repeat(70));
    lines.push('');
    lines.push(`Generated: ${this.results.timestamp}`);
    lines.push(`Base URL: ${this.config.baseURL}`);
    lines.push(`Model: ${this.config.model}`);
    lines.push('');

    // Diagnosis
    if (this.results.diagnosis) {
      lines.push('DIAGNOSIS');
      lines.push('─'.repeat(70));
      lines.push(`Status: ${this.results.diagnosis.title}`);
      lines.push(`Severity: ${this.results.diagnosis.severity.toUpperCase()}`);
      lines.push(`Description: ${this.results.diagnosis.description}`);
      lines.push('');
    }

    // Test Results Summary
    lines.push('TEST RESULTS SUMMARY');
    lines.push('─'.repeat(70));

    if (this.results.tests.sdk) {
      lines.push(`SDK Authentication: ${this.results.tests.sdk.success ? '✅ PASS' : '❌ FAIL'}`);
    }

    if (this.results.tests.bearer?.models) {
      lines.push(`Bearer Token (/models): ${this.results.tests.bearer.models.success ? '✅ PASS' : '❌ FAIL'}`);
    }

    if (this.results.tests.health) {
      lines.push(`Service Health: ${this.results.tests.health.success ? '✅ HEALTHY' : '❌ DOWN'}`);
    }

    lines.push('');

    // Recommendations
    if (this.results.recommendations.length > 0) {
      lines.push('RECOMMENDATIONS');
      lines.push('─'.repeat(70));
      this.results.recommendations.forEach((rec, i) => {
        lines.push(`${i + 1}. [${rec.priority.toUpperCase()}] ${rec.action}`);
        lines.push(`   ${rec.description}`);
        if (rec.command) lines.push(`   Command: ${rec.command}`);
        if (rec.url) lines.push(`   URL: ${rec.url}`);
        lines.push('');
      });
    }

    lines.push('═'.repeat(70));
    lines.push('End of Report');
    lines.push('═'.repeat(70));

    return lines.join('\n');
  }

  /**
   * Export results as JSON
   */
  exportJSON() {
    return JSON.stringify(this.results, null, 2);
  }
}
