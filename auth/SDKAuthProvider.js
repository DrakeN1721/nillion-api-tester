/**
 * SDKAuthProvider - Official Nillion SDK Authentication
 *
 * This is the RECOMMENDED authentication method that uses the official
 * @nillion/nilai-ts SDK with automatic NUC token generation.
 *
 * Features:
 * - Automatic NUC (Nillion User Credential) token generation
 * - Proper instance routing (SANDBOX/PRODUCTION)
 * - Token lifecycle management
 * - Specialized request signing
 */

export class SDKAuthProvider {
  constructor(config) {
    this.mode = 'sdk';
    this.apiKey = config.apiKey;
    this.baseURL = config.baseURL || 'https://nilai-a779.nillion.network/v1/';
    this.model = config.model || 'google/gemma-3-27b-it';
    this.nilauthInstance = config.nilauthInstance || 'SANDBOX'; // Will be converted to enum later
    this.client = null;
    this.sdkLoaded = false;

    // Validate configuration
    if (!this.apiKey) {
      throw new Error('API key is required for SDK authentication');
    }

    // Ensure trailing slash in baseURL
    if (!this.baseURL.endsWith('/')) {
      this.baseURL += '/';
    }
  }

  /**
   * Lazy-load the Nillion SDK and initialize the client
   * @returns {Promise<void>}
   */
  async _initializeSDK() {
    if (this.sdkLoaded) return;

    try {
      // Dynamically import the SDK
      const sdk = await import('@nillion/nilai-ts');
      const { NilaiOpenAIClient, NilAuthInstance } = sdk;

      // Convert nilauthInstance string to enum
      const instance = this.nilauthInstance === 'PRODUCTION'
        ? NilAuthInstance.PRODUCTION
        : NilAuthInstance.SANDBOX;

      // Initialize the Nillion SDK client
      this.client = new NilaiOpenAIClient({
        baseURL: this.baseURL,
        apiKey: this.apiKey,
        nilauthInstance: instance,
      });

      this.sdkLoaded = true;
    } catch (error) {
      if (error.code === 'ERR_MODULE_NOT_FOUND') {
        throw new Error(
          '❌ Nillion SDK (@nillion/nilai-ts) is not installed.\n\n' +
          'To use SDK authentication, please install it:\n' +
          '  npm install @nillion/nilai-ts\n\n' +
          'Alternatively, you can test bearer token authentication:\n' +
          '  node index.js --auth-mode bearer --bearer-token Nillion2025'
        );
      }
      throw new Error(`Failed to initialize Nillion SDK: ${error.message}`);
    }
  }

  /**
   * Test API connection
   * @returns {Promise<object>} Test result
   */
  async testConnection() {
    try {
      await this._initializeSDK();

      const startTime = Date.now();

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'user',
            content: 'Hello! This is a test message. Please respond with "Connection successful!"'
          }
        ],
        max_tokens: 50,
        temperature: 0.1
      });

      const responseTime = Date.now() - startTime;

      if (response && response.choices && response.choices[0]) {
        return {
          success: true,
          mode: 'SDK',
          method: 'Nillion SDK with NUC token',
          response: response.choices[0].message.content,
          model: response.model || this.model,
          usage: response.usage,
          responseTime,
          timestamp: new Date().toISOString(),
          details: {
            baseURL: this.baseURL,
            nilauthInstance: this.nilauthInstance,
            apiKey: `${this.apiKey.substring(0, 8)}...${this.apiKey.substring(this.apiKey.length - 8)}`
          }
        };
      } else {
        return {
          success: false,
          mode: 'SDK',
          method: 'Nillion SDK with NUC token',
          error: 'Invalid response format from API',
          responseTime,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      return {
        success: false,
        mode: 'SDK',
        method: 'Nillion SDK with NUC token',
        error: error.message,
        errorType: error.name || 'UnknownError',
        timestamp: new Date().toISOString(),
        details: {
          baseURL: this.baseURL,
          nilauthInstance: this.nilauthInstance,
          apiKey: `${this.apiKey.substring(0, 8)}...${this.apiKey.substring(this.apiKey.length - 8)}`
        }
      };
    }
  }

  /**
   * Send a chat message
   * @param {string} message - User message
   * @param {array} chatHistory - Previous messages for context
   * @returns {Promise<object>} Chat response
   */
  async sendMessage(message, chatHistory = []) {
    try {
      await this._initializeSDK();

      const startTime = Date.now();

      // Prepare messages with context (keep last 10 messages)
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
          mode: 'SDK',
          response: response.choices[0].message.content,
          model: response.model || this.model,
          usage: response.usage,
          responseTime,
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          success: false,
          mode: 'SDK',
          error: 'Invalid response format from API',
          responseTime,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      return {
        success: false,
        mode: 'SDK',
        error: error.message,
        errorType: error.name || 'UnknownError',
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
      mode: 'SDK',
      name: 'SDK Authentication',
      description: 'Official Nillion SDK with NUC token generation',
      status: 'Recommended',
      deprecated: false,
      config: {
        baseURL: this.baseURL,
        model: this.model,
        nilauthInstance: this.nilauthInstance,
        apiKey: `${this.apiKey.substring(0, 8)}...${this.apiKey.substring(this.apiKey.length - 8)}`
      }
    };
  }

  /**
   * List available models (if supported by SDK)
   * @returns {Promise<object>} Models list or error
   */
  async listModels() {
    try {
      await this._initializeSDK();

      if (typeof this.client.models !== 'undefined' && this.client.models.list) {
        const models = await this.client.models.list();
        return {
          success: true,
          mode: 'SDK',
          models: models.data || models,
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          success: false,
          mode: 'SDK',
          error: 'Models endpoint not exposed in SDK',
          note: 'This is normal - use chat completions instead',
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      return {
        success: false,
        mode: 'SDK',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
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
