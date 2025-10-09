/**
 * Secure storage utilities for API keys and sensitive data
 * Uses system keychain on macOS/Windows/Linux when available
 */

const SERVICE_NAME = 'nil-ai-verifier';
const ACCOUNT_NAME = 'api-key';

/**
 * Check if we're in Electron environment
 */
const isElectron = () => {
  return window.electron !== undefined;
};

/**
 * Fallback to encrypted localStorage if keychain unavailable
 */
class FallbackStorage {
  constructor() {
    this.storageKey = 'nil-ai-encrypted-key';
  }

  // Simple XOR encryption (better than plain text, but not cryptographically secure)
  // In production, use Web Crypto API for stronger encryption
  encrypt(data) {
    const key = this.getDeviceKey();
    let result = '';
    for (let i = 0; i < data.length; i++) {
      result += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(result);
  }

  decrypt(data) {
    const key = this.getDeviceKey();
    const decoded = atob(data);
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
  }

  // Generate a device-specific key for encryption
  getDeviceKey() {
    let deviceKey = localStorage.getItem('nil-ai-device-key');
    if (!deviceKey) {
      // Generate random key based on device characteristics
      deviceKey = `${navigator.userAgent}-${navigator.language}-${screen.width}x${screen.height}-${Date.now()}`;
      localStorage.setItem('nil-ai-device-key', btoa(deviceKey));
    } else {
      deviceKey = atob(deviceKey);
    }
    return deviceKey;
  }

  async setPassword(key) {
    try {
      const encrypted = this.encrypt(key);
      localStorage.setItem(this.storageKey, encrypted);
      return true;
    } catch (error) {
      console.error('Failed to store key:', error);
      return false;
    }
  }

  async getPassword() {
    try {
      const encrypted = localStorage.getItem(this.storageKey);
      if (!encrypted) return null;
      return this.decrypt(encrypted);
    } catch (error) {
      console.error('Failed to retrieve key:', error);
      return null;
    }
  }

  async deletePassword() {
    try {
      localStorage.removeItem(this.storageKey);
      return true;
    } catch (error) {
      console.error('Failed to delete key:', error);
      return false;
    }
  }
}

/**
 * Secure Storage Manager
 * Uses system keychain via Electron IPC or falls back to encrypted localStorage
 */
export class SecureStorage {
  constructor() {
    this.fallback = new FallbackStorage();
    this.usingKeychain = false;
  }

  /**
   * Save API key securely
   * @param {string} apiKey - The API key to store
   * @returns {Promise<boolean>} - Success status
   */
  async saveApiKey(apiKey) {
    if (!apiKey || typeof apiKey !== 'string') {
      throw new Error('Invalid API key');
    }

    // Try keychain first if in Electron
    if (isElectron() && window.electron.saveSecureData) {
      try {
        const success = await window.electron.saveSecureData(SERVICE_NAME, ACCOUNT_NAME, apiKey);
        if (success) {
          this.usingKeychain = true;
          console.log('✅ API key saved to system keychain');
          return true;
        }
      } catch (error) {
        console.warn('⚠️  Keychain unavailable, using encrypted localStorage:', error.message);
      }
    }

    // Fallback to encrypted localStorage
    const success = await this.fallback.setPassword(apiKey);
    if (success) {
      console.log('✅ API key saved to encrypted localStorage');
    }
    return success;
  }

  /**
   * Retrieve API key from secure storage
   * @returns {Promise<string|null>} - The API key or null if not found
   */
  async getApiKey() {
    // Try keychain first if in Electron
    if (isElectron() && window.electron.getSecureData) {
      try {
        const key = await window.electron.getSecureData(SERVICE_NAME, ACCOUNT_NAME);
        if (key) {
          this.usingKeychain = true;
          console.log('🔐 API key retrieved from system keychain');
          return key;
        }
      } catch (error) {
        console.warn('⚠️  Keychain unavailable, checking encrypted localStorage:', error.message);
      }
    }

    // Fallback to encrypted localStorage
    const key = await this.fallback.getPassword();
    if (key) {
      console.log('🔐 API key retrieved from encrypted localStorage');
    }
    return key;
  }

  /**
   * Delete API key from secure storage
   * @returns {Promise<boolean>} - Success status
   */
  async deleteApiKey() {
    let success = true;

    // Try keychain first if in Electron
    if (isElectron() && window.electron.deleteSecureData) {
      try {
        await window.electron.deleteSecureData(SERVICE_NAME, ACCOUNT_NAME);
        console.log('🗑️  API key deleted from system keychain');
      } catch (error) {
        console.warn('⚠️  Could not delete from keychain:', error.message);
        success = false;
      }
    }

    // Always try to delete from fallback storage too
    const fallbackSuccess = await this.fallback.deletePassword();
    if (fallbackSuccess) {
      console.log('🗑️  API key deleted from encrypted localStorage');
    }

    return success && fallbackSuccess;
  }

  /**
   * Check if using secure keychain storage
   * @returns {boolean}
   */
  isUsingKeychain() {
    return this.usingKeychain;
  }

  /**
   * Get storage method being used
   * @returns {string}
   */
  getStorageMethod() {
    if (this.usingKeychain) {
      return 'System Keychain (macOS Keychain / Windows Credential Manager / Linux Secret Service)';
    }
    return 'Encrypted LocalStorage (XOR encryption)';
  }
}

// Create singleton instance
export const secureStorage = new SecureStorage();

export default secureStorage;
