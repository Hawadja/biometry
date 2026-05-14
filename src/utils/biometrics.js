import ReactNativeBiometrics from 'react-native-biometrics';

// 1. Il faut créer une instance
const rnBiometrics = new ReactNativeBiometrics();

export async function checkBiometrics() {
  // 2. Utilisez l'instance 'rnBiometrics'
  const { available, biometryType } = await rnBiometrics.isSensorAvailable();
  return { available, type: biometryType };
}

export async function authenticate(promptMessage = 'Déverrouillez') {
  // 3. Utilisez l'instance 'rnBiometrics'
  try {
    const { success, error } = await rnBiometrics.simplePrompt({
      promptMessage,
      cancelButtonText: 'Utiliser le code PIN'
    });
    return { success, error };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function createKeys() {
  const { publicKey } = await rnBiometrics.createKeys();
  return publicKey;
}


