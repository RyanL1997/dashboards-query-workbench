/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { createGetterSetter } from '../../../../src/plugins/opensearch_dashboards_utils/public';
import { RenderAccelerationDetailsFlyoutParams } from '../../../dashboards-observability/common/types/data_connections';
import { catalogCacheRefs } from '../framework/catalog_cache_refs';
import { ObservabilityStart, RenderAccelerationFlyoutParams } from '../types';

export const [
  getRenderAccelerationDetailsFlyout,
  setRenderAccelerationDetailsFlyout,
] = createGetterSetter<
  ({
    acceleration,
    dataSourceName,
    handleRefresh,
    dataSourceMDSId,
  }: RenderAccelerationDetailsFlyoutParams) => void
>('renderAccelerationDetailsFlyout');

export const [
  getRenderAssociatedObjectsDetailsFlyout,
  setRenderAssociatedObjectsDetailsFlyout,
] = createGetterSetter('renderAssociatedObjectsDetailsFlyout');

export const [
  getRenderCreateAccelerationFlyout,
  setRenderCreateAccelerationFlyout,
] = createGetterSetter<({ dataSource, dataSourceMDSId }: RenderAccelerationFlyoutParams) => void>(
  'renderCreateAccelerationFlyout'
);

const noop = () => {};

export const registerObservabilityDependencies = (start?: ObservabilityStart) => {
  // Per-field fallbacks: older observability versions (obs < 2.13, shipped with
  // AOS 1.3.2 / 2.11 / 2.12) don't export these fields. The workbench still
  // loads on those hosts; features that need the missing APIs are gated off by
  // `caps.hasCatalogCache` / `caps.hasAccelerationFlyout` in each consumer.
  setRenderAccelerationDetailsFlyout(start?.renderAccelerationDetailsFlyout ?? noop);
  setRenderAssociatedObjectsDetailsFlyout(start?.renderAssociatedObjectsDetailsFlyout ?? noop);
  setRenderCreateAccelerationFlyout(start?.renderCreateAccelerationFlyout ?? noop);
  catalogCacheRefs.CatalogCacheManager = start?.CatalogCacheManagerInstance;
  catalogCacheRefs.useLoadDatabasesToCache = start?.useLoadDatabasesToCacheHook;
  catalogCacheRefs.useLoadTablesToCache = start?.useLoadTablesToCacheHook;
  catalogCacheRefs.useLoadTableColumnsToCache = start?.useLoadTableColumnsToCacheHook;
  catalogCacheRefs.useLoadAccelerationsToCache = start?.useLoadAccelerationsToCacheHook;
};
