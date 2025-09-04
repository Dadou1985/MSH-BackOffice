import { v2 as Translate } from '@google-cloud/translate';

const projectId = process.env.FIREBASE_PROJECT_ID; // remplace par ton ID réel

const translate = new Translate.Translate({
  projectId,
  keyFilename: './google-translate-key.json', // chemin vers la clé JSON
});

export async function translateText(text: string, targetLang: string) {
  try {
    const [translation] = await translate.translate(text, targetLang);
    return translation;
  } catch (error) {
    console.error('Erreur traduction:', error);
    throw new Error('Échec de traduction');
  }
}