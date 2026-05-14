import { Camera } from 'react-native-vision-camera';
import { PermissionsAndroid, Platform } from 'react-native';

export async function requestCameraPermissions() {
  if (Platform.OS === 'android') {
    const camera = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
    const mic = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
    return camera === 'granted' && mic === 'granted';
  }
  const permission = await Camera.requestCameraPermission();
  return permission === 'granted';
}

export async function takePhoto(cameraRef) {
  if (!cameraRef?.current) return null;
  try {
    return await cameraRef.current.takePhoto({ flash: 'auto', quality: 'high' });
  } catch (error) {
    console.error('Erreur capture:', error);
    return null;
  }
}