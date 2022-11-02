import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { quickCreateVM } from '@catalog/utils/quick-create-vm';
import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import useDefaultStorageClass from '@kubevirt-utils/hooks/useDefaultStorageClass/useDefaultStorageClass';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getResourceUrl } from '@kubevirt-utils/resources/shared';
import { generateVMName } from '@kubevirt-utils/resources/template';
import {
  Alert,
  Button,
  ButtonVariant,
  Checkbox,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  FormGroup,
  Split,
  SplitItem,
  Stack,
  StackItem,
  TextInput,
} from '@patternfly/react-core';

type TemplatesCatalogDrawerCreateFormProps = {
  namespace: string;
  template: V1Template;
  canQuickCreate: boolean;
  isBootSourceAvailable: boolean;
  onCancel: () => void;
};

export const TemplatesCatalogDrawerCreateForm: React.FC<TemplatesCatalogDrawerCreateFormProps> =
  React.memo(({ namespace, template, canQuickCreate, isBootSourceAvailable, onCancel }) => {
    const history = useHistory();
    const { t } = useKubevirtTranslation();
    const [vmName, setVmName] = React.useState(generateVMName(template));
    const [startVM, setStartVM] = React.useState(true);
    const [isQuickCreating, setIsQuickCreating] = React.useState(false);
    const [quickCreateError, setQuickCreateError] = React.useState(undefined);
    const [defaultStorageClass, defaultStorageClassLoaded] = useDefaultStorageClass();

    const onQuickCreate = () => {
      setIsQuickCreating(true);
      setQuickCreateError(undefined);

      quickCreateVM(template, { name: vmName, namespace, startVM, defaultStorageClass })
        .then((vm) => {
          setIsQuickCreating(false);
          history.push(getResourceUrl(VirtualMachineModel, vm));
        })
        .catch((err) => {
          setIsQuickCreating(false);
          setQuickCreateError(err);
        });
    };

    return (
      <form className="template-catalog-drawer-form" id="quick-create-form">
        <Stack hasGutter>
          {canQuickCreate ? (
            <>
              <StackItem>
                <Split hasGutter>
                  <SplitItem>
                    <FormGroup
                      label={t('VirtualMachine name')}
                      isRequired
                      className="template-catalog-drawer-form-name"
                      fieldId="vm-name-field"
                    >
                      <TextInput
                        isRequired
                        type="text"
                        data-test-id="vm-name-input"
                        name="vmname"
                        aria-label="virtualmachine name"
                        value={vmName}
                        onChange={(v) => setVmName(v)}
                      />
                    </FormGroup>
                  </SplitItem>
                  <SplitItem>
                    <DescriptionList>
                      <DescriptionListGroup>
                        <DescriptionListTerm>{t('Project')}</DescriptionListTerm>
                        <DescriptionListDescription>{namespace}</DescriptionListDescription>
                      </DescriptionListGroup>
                    </DescriptionList>
                  </SplitItem>
                </Split>
              </StackItem>
              <StackItem />
              <StackItem>
                <Checkbox
                  id="start-after-create-checkbox"
                  isChecked={startVM}
                  onChange={(v) => setStartVM(v)}
                  label={t('Start this VirtualMachine after creation')}
                />
              </StackItem>
            </>
          ) : (
            <StackItem>
              {t(
                'This Template requires some additional parameters. Click the Customize VirtualMachine button to complete the creation flow.',
              )}
            </StackItem>
          )}
          <StackItem />
          {quickCreateError && (
            <StackItem>
              <Alert variant="danger" title={t('Quick create error')} isInline>
                {quickCreateError.message}
              </Alert>
            </StackItem>
          )}
          <StackItem>
            <Split hasGutter>
              {canQuickCreate && (
                <SplitItem>
                  <Button
                    data-test-id="quick-create-vm-btn"
                    type="submit"
                    form="quick-create-form"
                    isLoading={isQuickCreating || !defaultStorageClassLoaded}
                    isDisabled={!isBootSourceAvailable || isQuickCreating || !vmName}
                    onClick={(e) => {
                      e.preventDefault();
                      onQuickCreate();
                    }}
                  >
                    {t('Quick create VirtualMachine')}
                  </Button>
                </SplitItem>
              )}
              <SplitItem>
                <Button
                  data-test-id="customize-vm-btn"
                  variant={canQuickCreate ? ButtonVariant.secondary : ButtonVariant.primary}
                  onClick={() =>
                    history.push(
                      `templatescatalog/customize?name=${template.metadata.name}&namespace=${template.metadata.namespace}`,
                    )
                  }
                >
                  {t('Customize VirtualMachine')}
                </Button>
              </SplitItem>
              <Button variant={ButtonVariant.link} onClick={() => onCancel()}>
                {t('Cancel')}
              </Button>
            </Split>
          </StackItem>
        </Stack>
      </form>
    );
  });
TemplatesCatalogDrawerCreateForm.displayName = 'TemplatesCatalogDrawerCreateForm';
