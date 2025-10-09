import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export class ExportUtils {
  static async exportToPDF(data, filename = 'nil-ai-verification-report.pdf', theme = 'dark') {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      let yPosition = margin;

      // Theme-based color schemes
      const themes = {
        dark: {
          background: [18, 18, 18],       // #121212
          surface: [28, 28, 28],          // #1c1c1c
          primary: [0, 255, 255],         // #00ffff - cyan
          success: [0, 255, 136],         // #00ff88 - green
          error: [255, 68, 68],           // #ff4444 - red
          text: [255, 255, 255],          // #ffffff
          textSecondary: [204, 204, 204], // #cccccc
          textMuted: [136, 136, 136],     // #888888
          border: [60, 60, 60]            // #3c3c3c
        },
        light: {
          background: [255, 255, 255],    // #ffffff
          surface: [250, 250, 250],       // #fafafa
          primary: [0, 122, 204],         // #007acc - blue
          success: [0, 153, 76],          // #00994c - green
          error: [204, 51, 51],           // #cc3333 - red
          text: [33, 33, 33],             // #212121
          textSecondary: [97, 97, 97],    // #616161
          textMuted: [158, 158, 158],     // #9e9e9e
          border: [224, 224, 224]         // #e0e0e0
        }
      };

      const colors = themes[theme] || themes.dark;
      const isDark = theme === 'dark';

      // Add background
      pdf.setFillColor(...colors.background);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');

      // Add header section
      pdf.setFillColor(...colors.surface);
      pdf.rect(0, 0, pageWidth, 45, 'F');

      // Add title border accent
      pdf.setDrawColor(...colors.primary);
      pdf.setLineWidth(1);
      pdf.line(margin, 40, pageWidth - margin, 40);

      // Add title
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...colors.text);
      pdf.text('Nil AI Key Verification Report', margin, yPosition + 10);
      yPosition += 20;

      // Subtitle with metadata
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(...colors.textMuted);
      pdf.text(`Generated: ${new Date().toLocaleString()}`, margin, yPosition);
      pdf.text(`Report ID: ${data.reportId || 'N/A'}`, pageWidth - margin - 60, yPosition);
      yPosition += 15;

      // API Key Information Section
      pdf.setFillColor(...colors.surface);
      pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 28, 3, 3, 'F');

      yPosition += 8;
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...colors.textSecondary);
      pdf.text('API KEY INFORMATION', margin + 5, yPosition);

      yPosition += 8;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(...colors.text);
      pdf.text(`Masked Key: ${data.apiKeyMasked}`, margin + 5, yPosition);

      yPosition += 6;
      const isConnected = data.connectionStatus === 'Connected';
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...(isConnected ? colors.success : colors.error));
      pdf.text(`Connection Status: ${data.connectionStatus}`, margin + 5, yPosition);
      yPosition += 18;

      // Connection Statistics Section
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.setTextColor(...colors.primary);
      pdf.text('Connection Statistics', margin, yPosition);
      yPosition += 3;

      pdf.setDrawColor(...colors.border);
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Stats in a table-like format
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(...colors.text);

      const stats = [
        ['Total Requests', data.stats.totalRequests],
        ['Successful Requests', data.stats.successfulRequests],
        ['Failed Requests', data.stats.failedRequests],
        ['Success Rate', `${Math.round((data.stats.successfulRequests / data.stats.totalRequests) * 100)}%`],
        ['Average Response Time', `${data.stats.averageResponseTime}ms`],
        ['Total Tokens Used', data.stats.totalTokens]
      ];

      stats.forEach(([label, value], index) => {
        if (index % 2 === 0) {
          pdf.setFillColor(...colors.surface);
          pdf.rect(margin, yPosition - 4, pageWidth - 2 * margin, 8, 'F');
        }

        pdf.setTextColor(...colors.textSecondary);
        pdf.text(label + ':', margin + 5, yPosition);
        pdf.setTextColor(...colors.text);
        pdf.setFont('helvetica', 'bold');
        pdf.text(String(value), pageWidth - margin - 40, yPosition);
        pdf.setFont('helvetica', 'normal');
        yPosition += 8;
      });

      yPosition += 10;

      // Configuration Section
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.setTextColor(...colors.primary);
      pdf.text('Configuration Details', margin, yPosition);
      yPosition += 3;

      pdf.setDrawColor(...colors.border);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(...colors.textSecondary);

      const config = [
        `SDK Version: @nillion/nilai-ts`,
        `Base URL: https://nilai-a779.nillion.network/v1/`,
        `Model: ${data.validation?.model || 'google/gemma-3-27b-it'}`,
        `NilAuth Instance: SANDBOX`,
        `Verification Method: API Connection Test`
      ];

      config.forEach(line => {
        pdf.text(line, margin + 5, yPosition);
        yPosition += 6;
      });

      yPosition += 12;

      // Recent Activity Log Section
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.setTextColor(...colors.primary);
      pdf.text('Recent Activity Log', margin, yPosition);
      yPosition += 3;

      pdf.setDrawColor(...colors.border);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(...colors.textSecondary);

      data.logs.slice(0, 15).forEach(log => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();

          // Add background to new page
          pdf.setFillColor(...colors.background);
          pdf.rect(0, 0, pageWidth, pageHeight, 'F');

          yPosition = margin;
        }

        const timestamp = new Date(log.timestamp).toLocaleTimeString();
        const logType = log.type.toUpperCase();

        // Color code by log type
        let typeColor = colors.textMuted;
        if (log.type === 'success') typeColor = colors.success;
        if (log.type === 'error') typeColor = colors.error;
        if (log.type === 'warning') typeColor = colors.textSecondary;

        pdf.setTextColor(...typeColor);
        pdf.text(`[${timestamp}]`, margin + 2, yPosition);

        pdf.setTextColor(...colors.text);
        const logLine = `${logType} - ${log.category}: ${log.message}`;
        const lines = pdf.splitTextToSize(logLine, pageWidth - 2 * margin - 30);

        lines.forEach((line, idx) => {
          if (yPosition > pageHeight - 20) {
            pdf.addPage();
            pdf.setFillColor(...colors.background);
            pdf.rect(0, 0, pageWidth, pageHeight, 'F');
            yPosition = margin;
          }
          pdf.text(line, margin + 25, yPosition);
          if (idx < lines.length - 1) yPosition += 4;
        });

        yPosition += 5;
      });

      // Verification Proof Section
      if (yPosition > pageHeight - 50) {
        pdf.addPage();
        pdf.setFillColor(...colors.background);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');
        yPosition = margin;
      } else {
        yPosition += 12;
      }

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.setTextColor(...colors.primary);
      pdf.text('Verification Proof', margin, yPosition);
      yPosition += 3;

      pdf.setDrawColor(...colors.border);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Verification status box
      const verificationPassed = data.connectionStatus === 'Connected';
      pdf.setFillColor(...(verificationPassed ? colors.success : colors.error));
      pdf.setDrawColor(...(verificationPassed ? colors.success : colors.error));
      pdf.setLineWidth(1);
      pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, 15, 2, 2, 'FD');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.setTextColor(255, 255, 255);
      pdf.text(
        `VERIFICATION ${verificationPassed ? 'PASSED' : 'FAILED'}`,
        pageWidth / 2,
        yPosition + 10,
        { align: 'center' }
      );
      yPosition += 20;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(...colors.textSecondary);
      pdf.text(
        `This report confirms that the API key was ${verificationPassed ? 'successfully tested' : 'unable to connect'} using the official Nillion SDK.`,
        margin + 5,
        yPosition
      );
      yPosition += 5;
      pdf.text(
        `Timestamp: ${new Date().toISOString()}`,
        margin + 5,
        yPosition
      );

      // Footer on all pages
      const totalPages = pdf.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);

        // Footer background
        pdf.setFillColor(...colors.surface);
        pdf.rect(0, pageHeight - 15, pageWidth, 15, 'F');

        // Footer line
        pdf.setDrawColor(...colors.border);
        pdf.setLineWidth(0.5);
        pdf.line(0, pageHeight - 15, pageWidth, pageHeight - 15);

        // Footer text
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(...colors.textMuted);
        pdf.text(
          'Generated by Nil AI Key Verification Tool | DrakeN.Space',
          margin,
          pageHeight - 8
        );
        pdf.text(
          `Page ${i} of ${totalPages}`,
          pageWidth - margin - 20,
          pageHeight - 8
        );
      }

      return pdf.output('arraybuffer');
    } catch (error) {
      throw new Error(`PDF export failed: ${error.message}`);
    }
  }

  static exportToMarkdown(data, filename = 'nil-ai-verification-report.md') {
    try {
      const isConnected = data.connectionStatus === 'Connected';
      const successRate = data.stats.totalRequests > 0
        ? Math.round((data.stats.successfulRequests / data.stats.totalRequests) * 100)
        : 0;

      const markdown = `# Nil AI Key Verification Report

**Generated:** ${new Date().toLocaleString()}
**Report ID:** ${data.reportId || `report-${Date.now()}`}

---

## API Key Information

- **API Key (Masked):** \`${data.apiKeyMasked}\`
- **Connection Status:** ${isConnected ? '✅ Connected' : '❌ Disconnected'}
- **Validation:** ${data.validation || 'Passed'}

---

## Connection Statistics

| Metric | Value |
|--------|-------|
| **Total Requests** | ${data.stats.totalRequests} |
| **Successful Requests** | ${data.stats.successfulRequests} |
| **Failed Requests** | ${data.stats.failedRequests} |
| **Success Rate** | ${successRate}% |
| **Average Response Time** | ${data.stats.averageResponseTime}ms |
| **Total Tokens Used** | ${data.stats.totalTokens} |

---

## Configuration

- **Base URL:** \`https://nilai-a779.nillion.network/v1/\`
- **Model:** \`google/gemma-3-27b-it\`
- **SDK Version:** \`@nillion/nilai-ts\`
- **NilAuth Instance:** \`SANDBOX\`

---

## Recent Activity Log

${data.logs.slice(0, 20).map(log => {
  const timestamp = new Date(log.timestamp).toLocaleString();
  const icon = log.type === 'success' ? '✅' : log.type === 'error' ? '❌' : 'ℹ️';
  return `### ${icon} ${log.category.toUpperCase()}
**Time:** ${timestamp}
**Message:** ${log.message}
${log.details ? `\n**Details:** \`${JSON.stringify(log.details)}\`\n` : ''}`;
}).join('\n\n')}

---

## Verification Proof

- **Verification Status:** ${isConnected ? '✅ PASSED' : '❌ FAILED'}
- **Proof Hash:** \`${data.proofHash || 'N/A'}\`
- **Verification Timestamp:** ${new Date().toISOString()}
- **Tool:** Nil AI Key Verification v1.0.0
- **Author:** DrakeN ([https://draken.space](https://draken.space))

---

## Chat History

${data.chatHistory && data.chatHistory.length > 0 ?
  data.chatHistory.map((msg, idx) => {
    const role = msg.role === 'user' ? '**You**' : '**AI**';
    return `${idx + 1}. ${role}: ${msg.content}`;
  }).join('\n\n') :
  '_No chat history available_'
}

---

## Summary

This report verifies that the Nillion API key has been tested and ${isConnected ? 'successfully connected' : 'failed to connect'} to the Nil AI service. The verification was performed using the official Nillion SDK (\`@nillion/nilai-ts\`) with proper authentication through the SANDBOX instance.

${isConnected ?
  `The API key is **fully functional** and can be used for development and testing purposes.` :
  `The API key **failed verification**. Please check the key and try again.`
}

---

**Generated by Nil AI Key Verification Tool**
**Website:** [https://draken.space](https://draken.space)
**Report Date:** ${new Date().toLocaleString()}
`;

      return markdown;
    } catch (error) {
      throw new Error(`Markdown export failed: ${error.message}`);
    }
  }

  static exportToJSON(data, filename = 'nil-ai-verification-data.json') {
    try {
      const exportData = {
        exportInfo: {
          tool: 'Nil AI Key Verification',
          version: '1.0.0',
          exportDate: new Date().toISOString(),
          reportId: data.reportId || `report-${Date.now()}`
        },
        apiKeyInfo: {
          masked: data.apiKeyMasked,
          validation: data.validation,
          connectionStatus: data.connectionStatus
        },
        statistics: data.stats,
        chatHistory: data.chatHistory || [],
        logs: data.logs,
        configuration: {
          baseURL: 'https://nilai-a779.nillion.network/v1/',
          model: 'google/gemma-3-27b-it',
          nilauthInstance: 'SANDBOX',
          sdkVersion: '@nillion/nilai-ts'
        },
        verification: {
          verified: data.connectionStatus === 'Connected',
          verificationTimestamp: new Date().toISOString(),
          proofHash: data.proofHash || 'N/A'
        }
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      throw new Error(`JSON export failed: ${error.message}`);
    }
  }

  static exportToCSV(logs, filename = 'nil-ai-verification-logs.csv') {
    try {
      if (!logs || logs.length === 0) {
        throw new Error('No logs to export');
      }

      const headers = ['Timestamp', 'Type', 'Category', 'Message', 'Details'];
      const csvRows = [headers.join(',')];

      logs.forEach(log => {
        const row = [
          `"${log.timestamp}"`,
          `"${log.type}"`,
          `"${log.category}"`,
          `"${log.message.replace(/"/g, '""')}"`,
          `"${JSON.stringify(log.details).replace(/"/g, '""')}"`
        ];
        csvRows.push(row.join(','));
      });

      return csvRows.join('\n');
    } catch (error) {
      throw new Error(`CSV export failed: ${error.message}`);
    }
  }

  static async captureScreenshot(elementId) {
    try {
      const element = document.getElementById(elementId) || document.body;

      const canvas = await html2canvas(element, {
        backgroundColor: '#0a0a0a',
        scale: 2,
        logging: false,
        useCORS: true
      });

      return canvas.toDataURL('image/png');
    } catch (error) {
      throw new Error(`Screenshot capture failed: ${error.message}`);
    }
  }

  static generateVerificationProof(data) {
    try {
      const proof = {
        timestamp: new Date().toISOString(),
        apiKeyHash: data.apiKeyHash || 'N/A',
        connectionStatus: data.connectionStatus,
        statistics: data.stats,
        configuration: {
          baseURL: 'https://nilai-a779.nillion.network/v1/',
          model: 'google/gemma-3-27b-it',
          sdkVersion: '@nillion/nilai-ts',
          nilauthInstance: 'SANDBOX'
        },
        verification: {
          tool: 'Nil AI Key Verification',
          version: '1.0.0',
          verified: data.connectionStatus === 'Connected',
          evidence: {
            totalRequests: data.stats.totalRequests,
            successfulRequests: data.stats.successfulRequests,
            averageResponseTime: data.stats.averageResponseTime,
            lastSuccessfulRequest: data.lastSuccessfulRequest || null
          }
        },
        signature: this.generateProofSignature(data)
      };

      return proof;
    } catch (error) {
      throw new Error(`Proof generation failed: ${error.message}`);
    }
  }

  static generateProofSignature(data) {
    try {
      // Create a simple hash-based signature for proof validation
      const signatureData = [
        data.connectionStatus,
        data.stats.totalRequests,
        data.stats.successfulRequests,
        new Date().toDateString()
      ].join('|');

      // Simple hash function (in production, use proper cryptographic signing)
      let hash = 0;
      for (let i = 0; i < signatureData.length; i++) {
        const char = signatureData.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }

      return `proof-${Math.abs(hash).toString(16)}-${Date.now().toString(36)}`;
    } catch (error) {
      return `signature-error-${Date.now()}`;
    }
  }

  static validateExportData(data) {
    const requiredFields = ['connectionStatus', 'stats', 'logs', 'apiKeyMasked'];
    const missing = requiredFields.filter(field => !data[field]);

    if (missing.length > 0) {
      throw new Error(`Missing required export data: ${missing.join(', ')}`);
    }

    return true;
  }
}