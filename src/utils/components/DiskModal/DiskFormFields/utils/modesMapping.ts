import { TFunction } from 'i18next';

export enum ACCESS_MODES {
  RWX = 'ReadWriteMany',
  RWO = 'ReadWriteOnce',
  ROX = 'ReadOnlyMany',
}

export enum VOLUME_MODES {
  FILESYSTEM = 'Filesystem',
  BLOCK = 'Block',
}

export type AccessMode = ACCESS_MODES.RWX | ACCESS_MODES.RWO | ACCESS_MODES.ROX;
export type VolumeMode = VOLUME_MODES.FILESYSTEM | VOLUME_MODES.BLOCK;

export const initialAccessModes: AccessMode[] = [
  ACCESS_MODES.RWX,
  ACCESS_MODES.RWO,
  ACCESS_MODES.ROX,
];
export const initialVolumeModes: VolumeMode[] = [VOLUME_MODES.FILESYSTEM, VOLUME_MODES.BLOCK];

type ModeMapping = {
  [volumeMode in VolumeMode]?: AccessMode[];
};

type ProvisionerAccessModeMapping = {
  [provisioner: string]: ModeMapping;
};

// See https://kubernetes.io/docs/concepts/storage/persistent-volumes/#types-of-persistent-volumes for more details
export const provisionerAccessModeMapping: ProvisionerAccessModeMapping = {
  'kubernetes.io/no-provisioner': {
    [VOLUME_MODES.FILESYSTEM]: [ACCESS_MODES.RWO],
    [VOLUME_MODES.BLOCK]: [ACCESS_MODES.RWO],
  },
  'kubernetes.io/aws-ebs': {
    [VOLUME_MODES.FILESYSTEM]: [ACCESS_MODES.RWO],
    [VOLUME_MODES.BLOCK]: [ACCESS_MODES.RWO],
  },
  'kubernetes.io/gce-pd': {
    [VOLUME_MODES.FILESYSTEM]: [ACCESS_MODES.RWO, ACCESS_MODES.ROX],
    [VOLUME_MODES.BLOCK]: [ACCESS_MODES.RWO, ACCESS_MODES.ROX],
  },
  'kubernetes.io/glusterfs': {
    [VOLUME_MODES.FILESYSTEM]: [ACCESS_MODES.RWO, ACCESS_MODES.RWX, ACCESS_MODES.ROX],
    [VOLUME_MODES.BLOCK]: [ACCESS_MODES.RWO, ACCESS_MODES.RWX, ACCESS_MODES.ROX],
  },
  'kubernetes.io/cinder': {
    [VOLUME_MODES.FILESYSTEM]: [ACCESS_MODES.RWO],
    [VOLUME_MODES.BLOCK]: [ACCESS_MODES.RWO],
  },
  'kubernetes.io/azure-file': {
    [VOLUME_MODES.FILESYSTEM]: [ACCESS_MODES.RWO, ACCESS_MODES.RWX, ACCESS_MODES.ROX],
    [VOLUME_MODES.BLOCK]: [ACCESS_MODES.RWO, ACCESS_MODES.RWX, ACCESS_MODES.ROX],
  },
  'kubernetes.io/azure-disk': {
    [VOLUME_MODES.FILESYSTEM]: [ACCESS_MODES.RWO],
    [VOLUME_MODES.BLOCK]: [ACCESS_MODES.RWO],
  },
  'kubernetes.io/quobyte': {
    [VOLUME_MODES.FILESYSTEM]: [ACCESS_MODES.RWO, ACCESS_MODES.RWX, ACCESS_MODES.ROX],
    [VOLUME_MODES.BLOCK]: [ACCESS_MODES.RWO, ACCESS_MODES.RWX, ACCESS_MODES.ROX],
  },
  'kubernetes.io/rbd': {
    [VOLUME_MODES.FILESYSTEM]: [ACCESS_MODES.RWO, ACCESS_MODES.ROX],
    [VOLUME_MODES.BLOCK]: [ACCESS_MODES.RWO, ACCESS_MODES.ROX],
  },
  'kubernetes.io/vsphere-volume': {
    [VOLUME_MODES.FILESYSTEM]: [ACCESS_MODES.RWO, ACCESS_MODES.RWX],
    [VOLUME_MODES.BLOCK]: [ACCESS_MODES.RWO, ACCESS_MODES.RWX],
  },
  'kubernetes.io/portworx-volume': {
    [VOLUME_MODES.FILESYSTEM]: [ACCESS_MODES.RWO, ACCESS_MODES.RWX],
    [VOLUME_MODES.BLOCK]: [ACCESS_MODES.RWO, ACCESS_MODES.RWX],
  },
  'kubernetes.io/scaleio': {
    [VOLUME_MODES.FILESYSTEM]: [ACCESS_MODES.RWO, ACCESS_MODES.ROX],
    [VOLUME_MODES.BLOCK]: [ACCESS_MODES.RWO, ACCESS_MODES.ROX],
  },
  'kubernetes.io/storageos': {
    [VOLUME_MODES.FILESYSTEM]: [ACCESS_MODES.RWO],
    [VOLUME_MODES.BLOCK]: [ACCESS_MODES.RWO],
  },
  // Since 4.6 new provisioners names will be without the 'kubernetes.io/' prefix.
  'manila.csi.openstack.org': {
    [VOLUME_MODES.FILESYSTEM]: [ACCESS_MODES.RWO, ACCESS_MODES.RWX, ACCESS_MODES.ROX],
    [VOLUME_MODES.BLOCK]: [ACCESS_MODES.RWO, ACCESS_MODES.RWX, ACCESS_MODES.ROX],
  },
  'ebs.csi.aws.com': {
    [VOLUME_MODES.FILESYSTEM]: [ACCESS_MODES.RWO],
    [VOLUME_MODES.BLOCK]: [ACCESS_MODES.RWO],
  },
  'csi.ovirt.org': {
    [VOLUME_MODES.FILESYSTEM]: [ACCESS_MODES.RWO],
    [VOLUME_MODES.BLOCK]: [ACCESS_MODES.RWO],
  },
  'cinder.csi.openstack.org': {
    [VOLUME_MODES.FILESYSTEM]: [ACCESS_MODES.RWO],
    [VOLUME_MODES.BLOCK]: [ACCESS_MODES.RWO],
  },
  'pd.csi.storage.gke.io': {
    [VOLUME_MODES.FILESYSTEM]: [ACCESS_MODES.RWO],
    [VOLUME_MODES.BLOCK]: [ACCESS_MODES.RWO],
  },
  'openshift-storage.cephfs.csi.ceph.com': {
    [VOLUME_MODES.FILESYSTEM]: [ACCESS_MODES.RWO, ACCESS_MODES.RWX, ACCESS_MODES.ROX],
  },
  'openshift-storage.rbd.csi.ceph.com': {
    [VOLUME_MODES.FILESYSTEM]: [ACCESS_MODES.RWO, ACCESS_MODES.ROX],
    [VOLUME_MODES.BLOCK]: [ACCESS_MODES.RWO, ACCESS_MODES.RWX, ACCESS_MODES.ROX],
  },
};

export const getAccessModeRadioOptions = (t: TFunction) => [
  {
    value: ACCESS_MODES.RWO,
    label: t('Single user (RWO)'),
  },
  {
    value: ACCESS_MODES.RWX,
    label: t('Shared access (RWX)'),
  },
  {
    value: ACCESS_MODES.ROX,
    label: t('Read only (ROX)'),
  },
];

export const getVolumeModeRadioOptions = (t: TFunction) => [
  {
    value: VOLUME_MODES.FILESYSTEM,
    label: t('Filesystem'),
  },
  {
    value: VOLUME_MODES.BLOCK,
    label: t('Block'),
  },
];

export const getAccessModeForProvisioner = (provisioner: string, volumeMode: VolumeMode) => {
  const modeMap = provisionerAccessModeMapping[provisioner] || {};

  const volumeModes = Object.keys(modeMap) as AccessMode[];
  if (volumeModes?.length > 0) {
    return volumeMode ? modeMap[volumeMode] : volumeModes.map((mode) => modeMap[mode]).flat();
  }

  return initialAccessModes;
};

export const getVolumeModeForProvisioner = (provisioner: string, accessMode: AccessMode) => {
  const modeMap = provisionerAccessModeMapping[provisioner] || {};

  const volumeModes = Object.keys(modeMap) as VolumeMode[];
  if (volumeModes?.length > 0) {
    return accessMode
      ? volumeModes.filter((vMode) => modeMap[vMode].includes(accessMode))
      : volumeModes;
  }

  return initialVolumeModes;
};
