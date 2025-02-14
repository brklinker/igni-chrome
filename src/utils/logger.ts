const DEBUG = true; // Toggle this for production

export const logger = {
  info: (message: string, ...args: any[]) => {
    if (DEBUG) {
      console.log(`[INFO] ${message}`, ...args);
    }
  },
  
  error: (message: string, error?: any) => {
    if (DEBUG) {
      console.error(`[ERROR] ${message}`, error);
    }
  },
  
  warn: (message: string, ...args: any[]) => {
    if (DEBUG) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },
  
  debug: (message: string, ...args: any[]) => {
    if (DEBUG) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }
}; 