import { Router } from 'express';
import scar from '../../json/to_delete/scar.json';

const router = Router();
type Language = keyof typeof scar.translations;
type VillainData = typeof scar;

const villains: Record<string, VillainData> = {
  scar,
};

router.get('/:villain', (req, res) => {
  const villainName = req.params.villain.toLowerCase();
  const villainData = villains[villainName];

  if (!villainData) {
    return res.status(404).json({
      message: `Villain "${villainName}" not found`,
    });
  }

  const requestedLanguage =
    typeof req.query.lang === 'string'
      ? req.query.lang.toLowerCase()
      : villainData.defaultLanguage;

  if (!villainData.availableLanguages.includes(requestedLanguage)) {
    return res.status(400).json({
      message: `Language "${requestedLanguage}" is not supported`,
      availableLanguages: villainData.availableLanguages,
    });
  }

  const language = requestedLanguage as Language;
  const { translations, images, source, ...sharedData } = villainData;
  const { contentNotes, ...sourceData } = source;

  /*   Hay que cambiar esto cuando la base de datos esté lista, para que se pueda obtener la información 
de la base de datos en lugar de un archivo JSON. Por ahora, esto es suficiente para probar la funcionalidad.
*/

  return res.json({
    ...sharedData,
    language,
    source: {
      ...sourceData,
      contentNote: contentNotes[language],
    },
    images: images.map(({ labels, ...image }) => ({
      ...image,
      label: labels[language],
    })),
    ...translations[language],
  });
});

export default router;
