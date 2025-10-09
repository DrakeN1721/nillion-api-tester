import { NilaiOpenAIClient, NilAuthInstance } from '@nillion/nilai-ts';
import { SecuritySettingsManager } from '../utils/environment';
import { validateApiKeyFormat, RateLimiter } from '../utils/validationUtils';

// Create a shared rate limiter for API calls (10 requests per minute)
const rateLimiter = new RateLimiter(10, 60000);

export class NilAIService {
  constructor(apiKey, model = 'google/gemma-3-27b-it') {
    this.apiKey = apiKey;
    this.baseURL = 'https://nilai-a779.nillion.network/v1/';
    this.model = model;

    try {
      // Check if API key testing is allowed based on security settings and environment
      const isAllowed = SecuritySettingsManager.isApiKeyTestingAllowed();

      this.client = new NilaiOpenAIClient({
        baseURL: this.baseURL,
        apiKey: this.apiKey,
        nilauthInstance: NilAuthInstance.SANDBOX,
        // Only allow browser usage if security settings permit it
        dangerouslyAllowBrowser: isAllowed,
      });

      // Log security status for audit trail
      console.log('Nil AI Client initialized:', {
        dangerouslyAllowBrowser: isAllowed,
        timestamp: new Date().toISOString(),
        apiKeyHash: this.hashApiKeySync(apiKey)
      });

    } catch (error) {
      console.error('Failed to initialize Nil AI client:', error);

      // Provide helpful error message if security settings are the issue
      if (error.message.includes('browser-like environment')) {
        throw new Error(`Client initialization failed: Browser API key usage not enabled. Please enable "Local Development Mode" in Security Settings. Original error: ${error.message}`);
      }

      throw new Error(`Client initialization failed: ${error.message}`);
    }
  }

  async testConnection() {
    try {
      // Check rate limiting
      const rateLimitCheck = rateLimiter.canMakeRequest();
      if (!rateLimitCheck.allowed) {
        throw new Error(`Rate limit exceeded. Please wait ${rateLimitCheck.retryAfter} seconds before trying again.`);
      }

      const startTime = Date.now();

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'user',
            content: 'Hello! Please respond with just "Connection test successful!" to verify API functionality.'
          }
        ],
        max_tokens: 50,
        temperature: 0.1
      });

      const responseTime = Date.now() - startTime;

      if (response && response.choices && response.choices[0]) {
        return {
          success: true,
          response: response.choices[0].message.content,
          model: response.model || this.model,
          usage: response.usage,
          responseTime,
          timestamp: new Date().toISOString(),
          request: {
            baseURL: this.baseURL,
            model: this.model,
            apiKey: `${this.apiKey.substring(0, 8)}...${this.apiKey.substring(this.apiKey.length - 8)}`
          }
        };
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        errorType: error.name || 'UnknownError',
        timestamp: new Date().toISOString(),
        request: {
          baseURL: this.baseURL,
          model: this.model,
          apiKey: `${this.apiKey.substring(0, 8)}...${this.apiKey.substring(this.apiKey.length - 8)}`
        }
      };
    }
  }

  async sendMessage(message, chatHistory = []) {
    try {
      // Check rate limiting
      const rateLimitCheck = rateLimiter.canMakeRequest();
      if (!rateLimitCheck.allowed) {
        throw new Error(`Rate limit exceeded. Please wait ${rateLimitCheck.retryAfter} seconds before trying again.`);
      }

      const startTime = Date.now();

      // Prepare messages with context (keep last 10 messages for context)
      const contextMessages = chatHistory.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Add the new user message
      const messages = [...contextMessages, { role: 'user', content: message }];

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: messages,
        max_tokens: 500,
        temperature: 0.7
      });

      const responseTime = Date.now() - startTime;

      if (response && response.choices && response.choices[0]) {
        return {
          success: true,
          response: response.choices[0].message.content,
          model: response.model || this.model,
          usage: response.usage,
          responseTime,
          timestamp: new Date().toISOString(),
          request: {
            baseURL: this.baseURL,
            model: this.model,
            messageCount: messages.length,
            userMessage: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
            apiKey: `${this.apiKey.substring(0, 8)}...${this.apiKey.substring(this.apiKey.length - 8)}`
          }
        };
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        errorType: error.name || 'UnknownError',
        timestamp: new Date().toISOString(),
        request: {
          baseURL: this.baseURL,
          model: this.model,
          userMessage: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
          apiKey: `${this.apiKey.substring(0, 8)}...${this.apiKey.substring(this.apiKey.length - 8)}`
        }
      };
    }
  }

  // Update the model
  setModel(newModel) {
    this.model = newModel;
  }

  // Get current model
  getModel() {
    return this.model;
  }

  // Get detailed information about the current configuration
  getConfiguration() {
    return {
      baseURL: this.baseURL,
      model: this.model,
      apiKey: `${this.apiKey.substring(0, 8)}...${this.apiKey.substring(this.apiKey.length - 8)}`,
      fullApiKey: this.apiKey, // For verification purposes
      nilauthInstance: 'SANDBOX',
      sdkVersion: '@nillion/nilai-ts',
      timestamp: new Date().toISOString()
    };
  }

  // Validate API key format (enhanced version)
  static validateApiKeyFormat(apiKey) {
    const validation = validateApiKeyFormat(apiKey);

    return {
      valid: validation.valid,
      reason: validation.error || 'API key format appears valid'
    };
  }

  // Get rate limit status
  static getRateLimitStatus() {
    return rateLimiter.getStatus();
  }

  // Reset rate limiter (for testing purposes)
  static resetRateLimit() {
    rateLimiter.reset();
  }

  // Generate attestation data for proof
  async generateAttestation() {
    try {
      const config = this.getConfiguration();
      const testResult = await this.testConnection();

      return {
        timestamp: new Date().toISOString(),
        apiKeyHash: await this.hashApiKey(this.apiKey),
        configuration: config,
        testResult: testResult,
        proof: {
          verified: testResult.success,
          responseTime: testResult.responseTime,
          model: testResult.model,
          usage: testResult.usage
        },
        signature: await this.generateSignature(testResult)
      };
    } catch (error) {
      throw new Error(`Failed to generate attestation: ${error.message}`);
    }
  }

  // Hash API key for proof without revealing it
  async hashApiKey(apiKey) {
    const encoder = new TextEncoder();
    const data = encoder.encode(apiKey);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Generate cryptographic signature for proof
  async generateSignature(data) {
    try {
      const encoder = new TextEncoder();
      const dataString = JSON.stringify(data);
      const dataBuffer = encoder.encode(dataString);
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      return `signature_generation_failed_${Date.now()}`;
    }
  }

  // Synchronous hash for API key (for logging purposes)
  hashApiKeySync(apiKey) {
    // Simple hash for logging - not cryptographically secure but sufficient for audit logs
    let hash = 0;
    for (let i = 0; i < apiKey.length; i++) {
      const char = apiKey.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }
}