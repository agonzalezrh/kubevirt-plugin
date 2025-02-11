import React, { FC, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { getTemplateNameParameterValue } from '@catalog/customize/utils';
import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { useURLParams } from '@kubevirt-utils/hooks/useURLParams';
import { Form } from '@patternfly/react-core';

import { buildFields, getVirtualMachineNameField } from '../../utils';
import { ExpandableOptionsFields } from '../ExpandableOptionalFields';
import { FieldGroup } from '../FieldGroup';
import { FormActionGroup } from '../FormActionGroup';
import { FormError } from '../FormError';

import { useCustomizeFormSubmit } from './useCustomizeFormSubmit';

type CustomizeFormProps = {
  isBootSourceAvailable?: boolean;
  template: V1Template;
};

export const CustomizeForm: FC<CustomizeFormProps> = ({ template }) => {
  const methods = useForm();

  const { error, loaded, onSubmit } = useCustomizeFormSubmit({ template });
  const [requiredFields, optionalFields] = buildFields(template);

  const { params } = useURLParams();
  const vmName = params.get('vmName') || getTemplateNameParameterValue(template);

  const nameField = useMemo(() => getVirtualMachineNameField(vmName), [vmName]);

  return (
    <FormProvider {...methods}>
      <Form onSubmit={methods.handleSubmit(onSubmit)}>
        <FieldGroup field={nameField} showError={error} />
        {requiredFields?.map((field) => (
          <FieldGroup field={field} key={field.name} showError={error} />
        ))}

        <ExpandableOptionsFields optionalFields={optionalFields} />

        <FormError error={error} />
        <FormActionGroup loading={!loaded} />
      </Form>
    </FormProvider>
  );
};
