
import { accelerometer, setUpdateIntervalForType, SensorTypes } from 'react-native-sensors';
import { map, filter } from 'rxjs/operators';

let subscription = null;
let lastShake = 0;
let shakeCount = 0;
let shakeTimer = null;

const SHAKE_WINDOW = 1200; // Temps max autorisé entre deux secousses successives (ms)
const MOVE_COOLDOWN = 350;  // Temps min pour éviter qu'un seul mouvement compte pour 2 secousses

/**
 * Calcule le nombre de secousses selon la règle : (Jour au carré) modulo 5
 * Dimanche = 0, Lundi = 1, Mardi = 2, Mercredi = 3, Jeudi = 4, Vendredi = 5, Samedi = 6
 */
export function getRequiredShakesForToday() {
  const currentDay = new Date().getDay(); // Rvoie 0 pour Dimanche, 1 pour Lundi... 6 pour Samedi
  
  // Règle stricte demandée : Vendredi doit être sans secousse (bloqué)
  if (currentDay === 5) {
    return 0; 
  }

  // Formule mathématique : (Jour * Jour) % 5
  return (currentDay * currentDay) % 5;
}

export function startShakeDetection(onShakeSuccess, threshold = 20) {
  if (subscription) subscription.unsubscribe();

  const requiredShakes = getRequiredShakesForToday();

  // Si c'est Vendredi (0 secousses), on ne démarre pas le capteur pour économiser la batterie
  if (requiredShakes === 0) {
    console.log("Aujourd'hui c'est Vendredi : mode secousse désactivé.");
    return () => {};
  }

  // Configuration de l'intervalle pour éviter l'erreur Android HIGH_SAMPLING_RATE
  setUpdateIntervalForType(SensorTypes.accelerometer, 100); 

  shakeCount = 0;

  subscription = accelerometer
    .pipe(
      map(({ x, y, z }) => Math.sqrt(x * x + y * y + z * z)),
      filter(acc => {
        const now = Date.now();
        // Vérifie la force de la secousse et impose un délai minimal entre deux secousses physiques
        if (acc > threshold && (now - lastShake) > MOVE_COOLDOWN) {
          lastShake = now;
          return true;
        }
        return false;
      })
    )
    .subscribe(() => {
      shakeCount++;
      console.log(`Secousse détectée ! Compteur : ${shakeCount} / ${requiredShakes}`);

      // Annule le précédent minuteur d'attente
      clearTimeout(shakeTimer);

      // Attend que l'utilisateur finisse sa série de secousses
      shakeTimer = setTimeout(() => {
        if (shakeCount === requiredShakes) {
          onShakeSuccess(); // Le nombre exact de secousses est atteint !
        } else {
          console.log(`Échec : ${shakeCount} secousses faites au lieu de ${requiredShakes}`);
        }
        shakeCount = 0; // Remise à zéro pour la prochaine tentative
      }, SHAKE_WINDOW);
    });
    
  return () => stopShakeDetection();
}

export function stopShakeDetection() {
  if (subscription) {
    subscription.unsubscribe();
    subscription = null;
  }
  clearTimeout(shakeTimer);
}


