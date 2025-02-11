import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Popover } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

export const SelectDiskSourceLabel: React.FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      {t('Disk source')}{' '}
      <Popover
        bodyContent={() => (
          <div>
            {t(
              'Disk Source represents the source for our disk, this can be HTTP, Registry or an existing PVC',
            )}
          </div>
        )}
        aria-label={'Help'}
      >
        <HelpIcon />
      </Popover>
    </>
  );
};
