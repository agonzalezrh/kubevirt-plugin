import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { VirtualMachineModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  K8sResourceCommon,
  ListPageBody,
  ListPageCreateDropdown,
  ListPageFilter,
  ListPageHeader,
  useK8sWatchResource,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';

import { filters } from '../utils';

import VirtualMachineRow from './components/VirtualMachineRow/VirtualMachineRow';
import useVirtualMachineColumns from './hooks/useVirtualMachineColumns';

type VirtualMachinesListProps = {
  kind: string;
  namespace: string;
};

const VirtualMachinesList: React.FC<VirtualMachinesListProps> = ({ kind, namespace }) => {
  const { t } = useKubevirtTranslation();
  const history = useHistory();
  const ref = VirtualMachineModelGroupVersionKind;

  const [vms, loaded, loadError] = useK8sWatchResource<V1VirtualMachine[]>({
    kind,
    isList: true,
    namespaced: true,
    namespace,
  });

  const [unfilteredData, data, onFilterChange] = useListPageFilter(vms, filters);

  const createItems = {
    catalog: t('From catalog'),
    yaml: t('With YAML'),
  };

  const onCreate = (type: string) =>
    type === 'catalog'
      ? history.push(`/k8s/ns/${namespace || 'default'}/templatescatalog`)
      : history.push(`/k8s/cluster/${ref.group}~${ref.version}~${ref.kind}/~new`);

  const columns = useVirtualMachineColumns();
  return (
    <>
      <ListPageHeader title={t('Virtual Machines')}>
        <ListPageCreateDropdown items={createItems} onClick={onCreate}>
          {t('Create')}
        </ListPageCreateDropdown>
      </ListPageHeader>
      <ListPageBody>
        <ListPageFilter
          data={data}
          loaded={loaded}
          rowFilters={filters}
          onFilterChange={onFilterChange}
        />
        <VirtualizedTable<K8sResourceCommon>
          data={data}
          unfilteredData={unfilteredData}
          loaded={loaded}
          loadError={loadError}
          columns={columns}
          Row={VirtualMachineRow}
          rowData={{ kind }}
        />
      </ListPageBody>
    </>
  );
};

export default VirtualMachinesList;
