import LoggerFactory, { LogLevel } from './logger.js';
import { BUBBLE_API_URL, LOG_LEVEL, ANALYSIS_CHECKER_LOG_LEVEL } from '../constants.js';

const logger = LoggerFactory.getLogger('DEAL-WIZARD/ANALYSIS-CHECKER', ANALYSIS_CHECKER_LOG_LEVEL);

/**
 * Class responsible for checking the status of Bubble.io report generation
 */
class AnalysisChecker {
    // Static constants
    static BUBBLE_API_URL = BUBBLE_API_URL;
    static DEFAULT_POLLING_INTERVAL = 5000; // 5 seconds

    constructor() {
        this.isPolling = false;
        this.pollingInterval = null;
        this.logger = LoggerFactory.getLogger('DEAL-WIZARD/CHECKER', LOG_LEVEL);
        this.logger.setLevel(LogLevel.DEBUG); // Set to DEBUG level to reduce verbosity
        this.logger.info('AnalysisChecker initialized');
    }

    /**
     * Start polling for Bubble.io operation status
     * @param {string} uniqueId - The unique identifier received from Bubble.io
     * @param {Function} onComplete - Callback function to execute when operation is ready
     * @param {Function} onError - Callback function to execute when an error occurs
     * @param {number} [interval] - Optional polling interval in milliseconds
     * @returns {void}
     */
    startPolling(uniqueId, onComplete, onError, interval = AnalysisChecker.DEFAULT_POLLING_INTERVAL) {
        this.logger.info('[POLLING] Starting polling process', { 
            uniqueId, 
            interval,
            timestamp: new Date().toISOString()
        });

        if (this.isPolling) {
            this.logger.warn('[POLLING] Polling already in progress, ignoring new request', { 
                uniqueId,
                existingInterval: this.pollingInterval 
            });
            return;
        }

        this.isPolling = true;
        this.logger.info('[POLLING] Polling initialized', { 
            uniqueId, 
            interval,
            startTime: new Date().toISOString() 
        });

        let attempts = 0;
        const maxAttempts = 60; // 5 minutes maximum (60 * 5 seconds)

        const checkStatus = async () => {
            try {
                attempts++;
                this.logger.info('[POLLING] Checking status', { 
                    uniqueId,
                    timestamp: new Date().toISOString(),
                    attempt: attempts
                });
                
                const status = await this.checkBubbleStatus(uniqueId);
                this.logger.debug('[POLLING] Received status', { 
                    uniqueId, 
                    status,
                    reportStatus: status.reportstatus_text,
                    timestamp: new Date().toISOString()
                });
                
                switch(status.reportstatus_text) {
                    case 'available':
                        this.logger.info('[POLLING] Operation completed successfully', { 
                            uniqueId, 
                            status,
                            completionTime: new Date().toISOString()
                        });
                        this.stopPolling();
                        onComplete(status);
                        return;
                    case 'error':
                        this.logger.error('[POLLING] Operation failed', null, { 
                            uniqueId, 
                            error: status.error,
                            status,
                            failureTime: new Date().toISOString()
                        });
                        this.stopPolling();
                        onError(status.error || 'Analysis failed');
                        return;
                    case 'generating':
                        this.logger.info('[POLLING] Operation still in progress', { 
                            uniqueId, 
                            status,
                            checkTime: new Date().toISOString()
                        });
                        break;
                    case '':
                    case null:
                    case undefined:
                        this.logger.info('[POLLING] No status yet', { 
                            uniqueId, 
                            status,
                            checkTime: new Date().toISOString()
                        });
                        break;
                    default:
                        this.logger.warn('[POLLING] Unknown status received', { 
                            uniqueId, 
                            status,
                            checkTime: new Date().toISOString()
                        });
                }

                if (attempts >= maxAttempts) {
                    this.logger.error('[POLLING] Polling timeout exceeded', null, { 
                        uniqueId, 
                        maxAttempts,
                        timestamp: new Date().toISOString()
                    });
                    this.stopPolling();
                    onError(new Error('Polling timeout exceeded'));
                    return;
                }
            } catch (error) {
                this.logger.error('[POLLING] Error checking status', error, { 
                    uniqueId,
                    errorTime: new Date().toISOString(),
                    errorDetails: {
                        message: error.message,
                        stack: error.stack
                    }
                });
                this.stopPolling();
                onError(error);
            }
        };

        // Initial check
        checkStatus();
        // Set up interval
        this.pollingInterval = setInterval(checkStatus, interval);
    }

    /**
     * Stop polling for operation status
     * @returns {void}
     */
    stopPolling() {
        this.logger.info('[POLLING] Stopping polling process', {
            wasPolling: this.isPolling,
            hadInterval: !!this.pollingInterval,
            stopTime: new Date().toISOString()
        });
        
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
            this.isPolling = false;
            this.logger.info('[POLLING] Polling stopped successfully', {
                timestamp: new Date().toISOString()
            });
        } else {
            this.logger.debug('[POLLING] No active polling to stop', {
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Check the current status of a Bubble.io operation
     * @param {string} uniqueId - The unique identifier to check
     * @returns {Promise<Object>} - Promise resolving to the operation status
     */
    async checkBubbleStatus(uniqueId) {
        const url = `${AnalysisChecker.BUBBLE_API_URL}/api/1.1/obj/properties/${uniqueId}`;
        this.logger.info('[API] Making request to Bubble.io', { 
            uniqueId,
            url,
            timestamp: new Date().toISOString()
        });

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            this.logger.debug('[API] Received response from Bubble.io', {
                uniqueId,
                status: response.status,
                ok: response.ok,
                timestamp: new Date().toISOString()
            });

            if (!response.ok) {
                const error = `HTTP error! status: ${response.status}`;
                this.logger.error('[API] Request failed', new Error(error), { 
                    uniqueId, 
                    status: response.status,
                    timestamp: new Date().toISOString()
                });
                throw new Error(error);
            }

            const data = await response.json();
            this.logger.info('[API] Successfully parsed response', { 
                uniqueId,
                responseData: data,
                timestamp: new Date().toISOString()
            });

            return data.response || { reportstatus_text: '' };
        } catch (error) {
            this.logger.error('[API] Failed to check status', error, { 
                uniqueId,
                errorDetails: {
                    message: error.message,
                    stack: error.stack
                },
                timestamp: new Date().toISOString()
            });
            throw new Error(`Failed to check Bubble.io status: ${error.message}`);
        }
    }

    /**
     * Get the current polling status
     * @returns {boolean} - Whether polling is currently active
     */
    isPollingActive() {
        const status = this.isPolling;
        this.logger.info('[STATUS] Polling status checked', { 
            status,
            timestamp: new Date().toISOString()
        });
        return status;
    }
}

// Export the class for use in other files
export default AnalysisChecker; 