/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import semver from 'semver';

export type GateState = 'S-min' | 'S-async' | 'S-flint-none' | 'S-full';

export interface DeploymentCapabilities {
  version: string;
  state: GateState;
  hasDataSources: boolean;
  hasAsyncQuery: boolean;
  hasSessionId: boolean;
  hasFlintDDL: boolean;
  hasCatalogCache: boolean;
  hasAccelerationFlyout: boolean;
  // Legacy OpenSearch DSL JSON response format (`?format=json` on /_plugins/_sql).
  // Removed in SQL 3.0 via opensearch-project/sql#3367, still present on 1.3.2 and 2.x.
  // Opposite polarity from the other fields: true = "legacy feature still works".
  hasDslJsonFormat: boolean;
}

/**
 * Capabilities used when the connected cluster's version is unknown — first
 * render before the resolver completes, probe failure, etc. Equivalent to
 * `S-full` *except* `hasDslJsonFormat` is `false` so an unknown cluster is
 * assumed to be 3.x-like (the legacy DSL JSON format was removed in 3.0).
 */
export const DEFAULT_CAPABILITIES: DeploymentCapabilities = {
  version: '',
  state: 'S-full',
  hasDataSources: true,
  hasAsyncQuery: true,
  hasSessionId: true,
  hasFlintDDL: true,
  hasCatalogCache: true,
  hasAccelerationFlyout: true,
  hasDslJsonFormat: false,
};

export function getDeploymentCapabilities(version: string | undefined): DeploymentCapabilities {
  const coerced = version ? semver.coerce(version) : null;
  if (!coerced) {
    return DEFAULT_CAPABILITIES;
  }

  const v = coerced.version;
  const hasAsyncQuery = semver.gte(v, '2.11.0');
  const hasSessionId = semver.gte(v, '2.12.0');
  const hasFlintDDL = semver.gte(v, '2.13.0');
  const hasDataSources = hasAsyncQuery;
  const hasCatalogCache = semver.gte(v, '2.13.0');
  const hasAccelerationFlyout = semver.gte(v, '2.13.0');
  // Legacy DSL JSON format: works on 1.3.2 and all 2.x; removed on 3.0+.
  const hasDslJsonFormat = semver.lt(v, '3.0.0');

  const state: GateState = !hasAsyncQuery
    ? 'S-min'
    : !hasSessionId
    ? 'S-async'
    : !hasFlintDDL
    ? 'S-flint-none'
    : 'S-full';

  return {
    version: v,
    state,
    hasDataSources,
    hasAsyncQuery,
    hasSessionId,
    hasFlintDDL,
    hasCatalogCache,
    hasAccelerationFlyout,
    hasDslJsonFormat,
  };
}
