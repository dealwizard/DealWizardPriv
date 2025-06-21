import LoggerFactory, { LogLevel } from '../utils/logger';

/**
 * Interface for Bubble.io API response
 */
interface BubbleStatusResponse {
  response?: BubbleStatus;
}

/**
 * Interface for the status object returned by Bubble.io
 */
interface BubbleStatus {
  reportstatus_text?: string;
  error?: string;
  [key: string]: any;
}

/**
 * Class responsible for checking the status of Bubble.io report generation
 */
class AnalysisChecker {
  // Static constants
  private static readonly BUBBLE_API_URL = 'https://deal-wizard-home-61532.bubbleapps.io';
  private static readonly DEFAULT_POLLING_INTERVAL = 5000; // 5 seconds

  private isPolling: boolean;
  private pollingInterval: NodeJS.Timeout | null;
  private logger: any;

  constructor() {
    this.isPolling = false;
    this.pollingInterval = null;
    this.logger = LoggerFactory.getLogger('DEAL-WIZARD/CHECKER');
    this.logger.setLevel(LogLevel.DEBUG); // Set to DEBUG level to reduce verbosity
    this.logger.info('AnalysisChecker initialized');
  }

  /**
   * Start polling for Bubble.io operation status
   * @param uniqueId - The unique identifier received from Bubble.io
   * @param onComplete - Callback function to execute when operation is ready
   * @param onError - Callback function to execute when an error occurs
   * @param interval - Optional polling interval in milliseconds
   * @returns void
   */
  public startPolling(
    uniqueId: string, 
    onComplete: (status: BubbleStatus) => void, 
    onError: (error: Error | string) => void, 
    interval: number = AnalysisChecker.DEFAULT_POLLING_INTERVAL
  ): void {
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

    const checkStatus = async (): Promise<void> => {
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
            this.logger.error('[POLLING] Operation failed', { 
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
          this.logger.error('[POLLING] Polling timeout exceeded', { 
            uniqueId, 
            maxAttempts,
            timestamp: new Date().toISOString()
          });
          this.stopPolling();
          onError(new Error('Polling timeout exceeded'));
          return;
        }
      } catch (error) {
        const typedError = error as Error;
        this.logger.error('[POLLING] Error checking status', { 
          uniqueId,
          errorTime: new Date().toISOString(),
          errorDetails: {
            message: typedError.message,
            stack: typedError.stack
          }
        });
        this.stopPolling();
        onError(typedError);
      }
    };

    // Initial check
    checkStatus();
    // Set up interval
    this.pollingInterval = setInterval(checkStatus, interval);
  }

  /**
   * Stop polling for operation status
   * @returns void
   */
  public stopPolling(): void {
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
   * @param uniqueId - The unique identifier to check
   * @returns Promise resolving to the operation status
   */
  private async checkBubbleStatus(uniqueId: string): Promise<BubbleStatus> {
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
        this.logger.error('[API] Request failed', { 
          uniqueId, 
          status: response.status,
          timestamp: new Date().toISOString(),
          error
        });
        throw new Error(error);
      }

      const data = await response.json() as BubbleStatusResponse;
      this.logger.info('[API] Successfully parsed response', { 
        uniqueId,
        responseData: data,
        timestamp: new Date().toISOString()
      });

      return data.response || { reportstatus_text: '' };
    } catch (error) {
      const typedError = error as Error;
      this.logger.error('[API] Failed to check status', { 
        uniqueId,
        errorDetails: {
          message: typedError.message,
          stack: typedError.stack
        },
        timestamp: new Date().toISOString()
      });
      throw new Error(`Failed to check Bubble.io status: ${typedError.message}`);
    }
  }

  /**
   * Get the current polling status
   * @returns Whether polling is currently active
   */
  public isPollingActive(): boolean {
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