
import { describe, it, expect } from 'vitest';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

describe('Application Build', () => {
  it('should build without errors', async () => {
    try {
      await execAsync('npm run build');
    } catch (error) {
      // We are expecting the build to succeed, so we fail the test if there is an error
      throw new Error('Build failed with error: ' + error);
    }
  }, 30000); // 30 second timeout for the build
});
