import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef<any>();

/** Navigate from outside a screen (e.g. a notification tap), waiting for the navigator to mount. */
export function navigateWhenReady(name: string, params?: object, attempts = 20) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  } else if (attempts > 0) {
    setTimeout(() => navigateWhenReady(name, params, attempts - 1), 150);
  }
}
