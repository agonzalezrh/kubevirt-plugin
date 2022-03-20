import * as React from 'react';
import { Trans } from 'react-i18next';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Breadcrumb,
  BreadcrumbItem,
  DescriptionListDescription,
  DescriptionListTermHelpText,
  DescriptionListTermHelpTextButton,
  Popover,
} from '@patternfly/react-core';

type NameProps = {
  name: string;
};

const Name: React.FC<NameProps> = ({ name }) => {
  const { t } = useKubevirtTranslation();
  return (
    <>
      <DescriptionListTermHelpText>
        <Popover
          hasAutoWidth
          maxWidth="30rem"
          headerContent={t('Name')}
          bodyContent={
            <Trans ns="plugin__kubevirt-plugin">
              Name must be unique within a namespace. Is required when creating resources, although
              some resources may allow a client to request the generation of an appropriate name
              automatically. Name is primarily intended for creation idempotence and configuration
              definition. Cannot be updated. More info:
              <a href="http://kubernetes.io/docs/user-guide/identifiers#names">
                {` http://kubernetes.io/docs/user-guide/identifiers#names`}
              </a>
              <Breadcrumb>
                <BreadcrumbItem>VirtualMachineInstance</BreadcrumbItem>
                <BreadcrumbItem>metadata</BreadcrumbItem>
                <BreadcrumbItem>name</BreadcrumbItem>
              </Breadcrumb>
            </Trans>
          }
        >
          <DescriptionListTermHelpTextButton>{t('Name')}</DescriptionListTermHelpTextButton>
        </Popover>
      </DescriptionListTermHelpText>
      <DescriptionListDescription>{name}</DescriptionListDescription>
    </>
  );
};

export default Name;
