import React from 'react';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { PopoverPosition, Title } from '@patternfly/react-core';

import './DiskListTitle.scss';

const DiskListTitle = () => {
  const { t } = useKubevirtTranslation();

  return (
    <Title className="disk-list-title" headingLevel="h2">
      {t('Disks')}{' '}
      <HelpTextIcon
        bodyContent={t(
          'The following information is provided by the OpenShift Virtualization operator.',
        )}
        helpIconClassName="title-help-text-icon"
        position={PopoverPosition.right}
      />
    </Title>
  );
};

export default DiskListTitle;
