/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * GUARDIAN ORACLE / Q-MESH SOVEREIGN INFRASTRUCTURE
 * MODULE 5: BYZANTINE SECRET CANARY DRIFT DETECTOR (PHASE 004C)
 * 
 * Re-exports SecretCanaryVerifier and SecretCanaryDriftDetector aliases
 * for activation drift detection and Byzantine fault isolation.
 */

export { 
  SecretCanaryVerifier,
  SecretCanaryVerifier as SecretCanaryDriftDetector 
} from './CascadiaMeshTransport';
