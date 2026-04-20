/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ILegacyClusterClient, Logger } from '../../../../src/core/server';

/**
 * Resolves and caches the local OpenSearch cluster's version at plugin start time.
 *
 * The probe uses OSD's internal (admin) credentials so it doesn't depend on the
 * current user having `cluster:monitor/main`. The cluster version is not
 * user-sensitive and it's consulted purely to shape which workbench features
 * are enabled for the deployment.
 */
export class ClusterInfoService {
  private versionPromise: Promise<string> | null = null;

  constructor(private readonly client: ILegacyClusterClient, private readonly logger: Logger) {}

  /**
   * Returns the cached cluster version. First call triggers the probe; subsequent
   * calls share the in-flight or resolved promise. If the probe fails, the cache
   * is cleared so the next caller retries.
   */
  getVersion(): Promise<string> {
    if (!this.versionPromise) {
      this.versionPromise = this.probe().catch((err) => {
        this.logger.warn(`ClusterInfoService: probe failed, will retry on next request: ${err}`);
        this.versionPromise = null;
        return '';
      });
    }
    return this.versionPromise;
  }

  private async probe(): Promise<string> {
    const info = await this.client.callAsInternalUser('info');
    const version = info?.version?.number ?? '';
    this.logger.debug(`ClusterInfoService: resolved cluster version "${version}"`);
    return version;
  }
}
