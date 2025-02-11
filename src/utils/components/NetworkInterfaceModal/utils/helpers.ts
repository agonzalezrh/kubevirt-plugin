import produce from 'immer';
import { adjectives, animals, uniqueNamesGenerator } from 'unique-names-generator';

import { V1Interface, V1Network, V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { interfacesTypes } from '@kubevirt-utils/resources/vm/utils/network/constants';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';

import { NetworkAttachmentDefinition } from '../components/hooks/types';

export const generateNicName = () => {
  return `nic-${uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
    separator: '-',
  })}`;
};

export const podNetworkExists = (vm: V1VirtualMachine): boolean =>
  !!vm?.spec?.template?.spec?.networks?.find((network) => typeof network.pod === 'object');

export const networkNameStartWithPod = (networkName: string): boolean =>
  networkName?.startsWith('Pod');

export const getNetworkName = (network: V1Network): string => {
  if (network) {
    return network?.pod ? t('Pod networking') : network?.multus?.networkName;
  }
  return null;
};

export const updateVMNetworkInterface = (
  vm: V1VirtualMachine,
  updatedNetworks: V1Network[],
  updatedInterfaces: V1Interface[],
) => {
  const updatedVM = produce<V1VirtualMachine>(vm, (vmDraft: V1VirtualMachine) => {
    vmDraft.spec.template.spec.networks = updatedNetworks;
    vmDraft.spec.template.spec.domain.devices.interfaces = updatedInterfaces;
  });
  return updatedVM;
};

export const createNetwork = (nicName: string, networkName: string): V1Network => {
  const network: V1Network = {
    name: nicName,
  };

  if (!networkNameStartWithPod(networkName) && networkName) {
    network.multus = { networkName: networkName?.split('/')?.[1] || networkName };
  } else {
    network.pod = {};
  }

  return network;
};

export const createInterface = (
  nicName: string,
  interfaceModel: string,
  interfaceMACAddress: string,
  interfaceType: string,
): V1Interface => {
  return {
    [interfaceType.toLowerCase()]: {},
    macAddress: interfaceMACAddress,
    model: interfaceModel,
    name: nicName,
  };
};

export const getNadType = (nad: NetworkAttachmentDefinition): string => {
  try {
    const config = JSON.parse(nad?.spec?.config);
    //can be config.type or config.plugin first element only!'
    return interfacesTypes?.[config?.type] || interfacesTypes?.[config?.plugins?.[0]?.type];
  } catch (e) {
    kubevirtConsole.log('Cannot convert NAD config: ', e);
  }
};
