import React from 'react';

import { V1beta1DataVolumeSpec } from '@kubevirt-ui/kubevirt-api/kubevirt';
import CapacityInput from '@kubevirt-utils/components/CapacityInput/CapacityInput';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, TextInput, ValidatedOptions } from '@patternfly/react-core';

import { SOURCE_OPTIONS_IDS, SOURCE_TYPES } from '../../utils/constants';

import { PersistentVolumeClaimSelect } from './PersistentVolumeClaimSelect/PersistentVolumeClaimSelect';
import SelectSourceOption from './SelectSourceOption';
import {
  getGenericSourceCustomization,
  getPVCSource,
  getSourceTypeFromDataVolumeSpec,
} from './utils';

type SelectSourceProps = {
  httpSourceHelperText?: string;
  initialVolumeQuantity?: string;
  onSourceChange: (customSource: V1beta1DataVolumeSpec) => void;
  source: V1beta1DataVolumeSpec;
  sourceLabel: React.ReactNode;
  sourceOptions: SOURCE_OPTIONS_IDS[];
  withSize?: boolean;
};

export const SelectSource: React.FC<SelectSourceProps> = ({
  httpSourceHelperText,
  initialVolumeQuantity = '30Gi',
  onSourceChange,
  source,
  sourceLabel,
  sourceOptions,
  withSize = false,
}) => {
  const { t } = useKubevirtTranslation();
  const selectedSourceType = getSourceTypeFromDataVolumeSpec(source);
  const pvcNameSelected = source?.source?.pvc?.name;
  const pvcNamespaceSelected = source?.source?.pvc?.namespace;
  const httpURL = source?.source?.http?.url;
  const containerImage = source?.source?.registry?.url;
  const volumeQuantity = source?.storage?.resources?.requests?.storage || initialVolumeQuantity;

  const onSourceSelected = (newSourceType: SOURCE_OPTIONS_IDS, newVolumeQuantity?: string) => {
    const selectedVolumeQuantity = newVolumeQuantity || volumeQuantity;

    switch (newSourceType) {
      case SOURCE_TYPES.httpSource:
        return onSourceChange(
          getGenericSourceCustomization(
            newSourceType,
            httpURL,
            withSize ? selectedVolumeQuantity : null,
          ),
        );
      case SOURCE_TYPES.pvcSource:
        return onSourceChange(
          getPVCSource(
            pvcNameSelected,
            pvcNamespaceSelected,
            withSize ? selectedVolumeQuantity : null,
          ),
        );
      case SOURCE_TYPES.registrySource:
        return onSourceChange(
          getGenericSourceCustomization(
            newSourceType,
            containerImage || '',
            withSize ? selectedVolumeQuantity : null,
          ),
        );
      default:
        return;
    }
  };

  const onContainerChange = (newContainerURL) =>
    onSourceChange(
      getGenericSourceCustomization(
        selectedSourceType,
        newContainerURL || '',
        withSize ? volumeQuantity : null,
      ),
    );

  const onURLChange = (newUrl) =>
    onSourceChange(
      getGenericSourceCustomization(selectedSourceType, newUrl, withSize ? volumeQuantity : null),
    );

  return (
    <>
      <SelectSourceOption
        label={sourceLabel}
        onSelectSource={(newSourceType) => onSourceSelected(newSourceType)}
        options={sourceOptions}
        selectedSource={selectedSourceType}
      />

      {selectedSourceType === SOURCE_TYPES.pvcSource && (
        <PersistentVolumeClaimSelect
          selectPVC={(newPVCNamespace, newPVCName) =>
            onSourceChange(
              getPVCSource(newPVCName, newPVCNamespace, withSize ? volumeQuantity : null),
            )
          }
          projectSelected={pvcNamespaceSelected}
          pvcNameSelected={pvcNameSelected}
        />
      )}

      {selectedSourceType === SOURCE_TYPES.registrySource && (
        <FormGroup
          helperText={
            <>
              {t('Example: {{exampleURL}}', {
                exampleURL: 'quay.io/containerdisks/fedora:latest',
              })}
            </>
          }
          className="disk-source-form-group"
          fieldId={`disk-source-required-${selectedSourceType}`}
          isRequired
          label={t('Container Image')}
        >
          <TextInput
            aria-label={t('Container Image')}
            onChange={onContainerChange}
            type="text"
            value={containerImage}
          />
        </FormGroup>
      )}

      {selectedSourceType === SOURCE_TYPES.httpSource && (
        <FormGroup
          className="disk-source-form-group"
          fieldId={`disk-source-required-${selectedSourceType}`}
          helperText={httpSourceHelperText}
          isRequired
          label={t('Image URL')}
        >
          <TextInput
            aria-label={t('Image URL')}
            onChange={onURLChange}
            type="text"
            validated={!httpURL ? ValidatedOptions.error : ValidatedOptions.default}
            value={httpURL}
          />
        </FormGroup>
      )}

      {withSize && selectedSourceType !== SOURCE_TYPES.defaultSource && (
        <CapacityInput
          label={t('Disk size')}
          onChange={(newVolume) => onSourceSelected(selectedSourceType, newVolume)}
          size={volumeQuantity}
        />
      )}
    </>
  );
};
