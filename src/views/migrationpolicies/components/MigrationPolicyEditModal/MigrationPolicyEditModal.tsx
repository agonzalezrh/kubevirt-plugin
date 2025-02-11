import React, { useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';

import MigrationPolicyModel from '@kubevirt-ui/kubevirt-api/console/models/MigrationPolicyModel';
import { V1alpha1MigrationPolicy } from '@kubevirt-ui/kubevirt-api/kubevirt';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { k8sCreate, k8sDelete, k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import { Form, FormGroup, TextInput } from '@patternfly/react-core';

import { migrationPoliciesPageBaseURL } from '../../list/utils/constants';
import MigrationPolicyConfigurations from '../MigrationPolicyConfigurations/MigrationPolicyConfigurations';

import { EditMigrationPolicyInitialState } from './utils/constants';
import {
  extractEditMigrationPolicyInitialValues,
  produceUpdatedMigrationPolicy,
} from './utils/utils';

type MigrationPolicyEditModalProps = {
  isOpen: boolean;
  mp: V1alpha1MigrationPolicy;
  onClose: () => void;
};

const MigrationPolicyEditModal: React.FC<MigrationPolicyEditModalProps> = ({
  isOpen,
  mp,
  onClose,
}) => {
  const { t } = useKubevirtTranslation();
  const history = useHistory();

  const [state, setState] = useState<EditMigrationPolicyInitialState>(
    extractEditMigrationPolicyInitialValues(mp),
  );

  const actualPathArray = history.location.pathname.split('/');
  const lastPolicyPathElement = actualPathArray[actualPathArray.length - 1]; // last part of url after "/", MigrationPolicy's previous name or ''

  const setStateField = (field: string) => (value: any) => {
    const isValueFunction = typeof value === 'function';
    setState((prevState) => ({
      ...prevState,
      [field]: isValueFunction ? value(prevState?.[field]) : value,
    }));
  };

  const updatedMigrationPolicy: V1alpha1MigrationPolicy = useMemo(
    () => produceUpdatedMigrationPolicy(mp, state),
    [mp, state],
  );

  const onSubmit = (updatedMP: V1alpha1MigrationPolicy) => {
    if (updatedMP?.metadata?.name !== mp?.metadata?.name) {
      return k8sCreate({ data: updatedMP, model: MigrationPolicyModel }).then(() => {
        return k8sDelete({ model: MigrationPolicyModel, resource: mp }).then(() => {
          if (lastPolicyPathElement === mp?.metadata?.name) {
            // if we were on MigrationPolicy details page, stay there and just update the data
            history.push(`${migrationPoliciesPageBaseURL}/${updatedMP?.metadata?.name}`);
          } else {
            history.push(migrationPoliciesPageBaseURL); // MigrationPolicies list
          }
        });
      });
    }
    return k8sUpdate({
      data: updatedMP,
      model: MigrationPolicyModel,
    });
  };

  return (
    <TabModal
      headerText={t('Edit MigrationPolicy')}
      isOpen={isOpen}
      obj={updatedMigrationPolicy}
      onClose={onClose}
      onSubmit={onSubmit}
    >
      <Form>
        <FormGroup
          fieldId="migration-policy-name"
          helperText={t('Unique name of the MigrationPolicy')}
          isRequired
          label={t('MigrationPolicy name')}
        >
          <TextInput
            onChange={setStateField('migrationPolicyName')}
            value={state?.migrationPolicyName}
          />
        </FormGroup>
        <MigrationPolicyConfigurations
          setState={setState}
          setStateField={setStateField}
          state={state}
        />
      </Form>
    </TabModal>
  );
};

export default MigrationPolicyEditModal;
