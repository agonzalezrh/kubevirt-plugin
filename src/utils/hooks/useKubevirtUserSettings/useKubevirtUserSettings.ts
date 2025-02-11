import { useEffect, useState } from 'react';

import {
  ConfigMapModel,
  modelToGroupVersionKind,
  RoleBindingModel,
  RoleModel,
  UserModel,
} from '@kubevirt-ui/kubevirt-api/console';
import {
  IoK8sApiCoreV1ConfigMap,
  IoK8sApiRbacV1Role,
  IoK8sApiRbacV1RoleBinding,
} from '@kubevirt-ui/kubevirt-api/kubernetes';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  k8sCreate,
  k8sGet,
  k8sPatch,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';

import {
  KUBEVIRT_USER_SETTINGS_CONFIG_MAP_NAME,
  userSettingsRole,
  userSettingsRoleBinding,
} from './utils/const';
import userSettingsInitialState, { UserSettingsState } from './utils/userSettingsInitialState';
import { parseNestedJSON } from './utils/utils';

type UseKubevirtUserSettings = (
  key?: string,
) => [{ [key: string]: any }, (val: any) => void, boolean, Error];

const useKubevirtUserSettings: UseKubevirtUserSettings = (key) => {
  const [error, setError] = useState<Error>();
  const [userName, setUserName] = useState<string>();
  const [userSettings, setUserSettings] = useState<UserSettingsState>();
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingUserName, setLoadingUserName] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserName = async () => {
      setError(null);
      try {
        const user = await k8sGet({ model: UserModel, path: '~' });
        setUserName(user?.metadata?.name?.replace(':', '-'));
      } catch (e) {
        setError(e);
      }
      setLoadingUserName(false);
    };
    fetchUserName();
  }, []);

  const [userConfigMap, loadedConfigMap, configMapError] =
    useK8sWatchResource<IoK8sApiCoreV1ConfigMap>(
      userName && {
        groupVersionKind: modelToGroupVersionKind(ConfigMapModel),
        name: KUBEVIRT_USER_SETTINGS_CONFIG_MAP_NAME,
        namespace: DEFAULT_NAMESPACE,
      },
    );

  useEffect(() => {
    if (userName) {
      if (configMapError?.code === 404) {
        const createResources = async () => {
          await k8sCreate<IoK8sApiCoreV1ConfigMap>({
            data: {
              data: { [userName]: JSON.stringify(userSettingsInitialState) },
              metadata: {
                name: KUBEVIRT_USER_SETTINGS_CONFIG_MAP_NAME,
                namespace: DEFAULT_NAMESPACE,
              },
            },
            model: ConfigMapModel,
          });

          await k8sCreate<IoK8sApiRbacV1Role>({
            data: userSettingsRole,
            model: RoleModel,
          });

          await k8sCreate<IoK8sApiRbacV1RoleBinding>({
            data: userSettingsRoleBinding,
            model: RoleBindingModel,
          });
        };

        try {
          createResources();
          setError(null);
        } catch (e) {
          setError(e);
        }
      }
      loadedConfigMap && setLoading(false);
    }
  }, [configMapError?.code, userName, loadedConfigMap]);

  useEffect(() => {
    if (!isEmpty(userConfigMap) && !userSettings && userName) {
      setUserSettings(
        (<unknown>parseNestedJSON(userConfigMap?.data?.[userName]) || {}) as UserSettingsState,
      );
    }
  }, [userConfigMap, userSettings, userName]);

  const updateUserSetting = (val: any) => {
    setUserSettings((prevUserSettings) => {
      const updateResource = async (data: { [key: string]: any }) => {
        try {
          await k8sPatch({
            data: [
              {
                op: 'replace',
                path: `/data/${userName}`,
                value: JSON.stringify(data),
              },
            ],
            model: ConfigMapModel,
            resource: userConfigMap,
          });
        } catch (e) {
          setError(e);
        }
      };

      const data = key ? { ...prevUserSettings, [key]: val } : val;
      updateResource(data);
      return data;
    });
  };

  return [
    key ? userSettings?.[key] : userSettings,
    userSettings && updateUserSetting,
    !loading && !loadingUserName && loadedConfigMap,
    error || configMapError,
  ];
};

export default useKubevirtUserSettings;
