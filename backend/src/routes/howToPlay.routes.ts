import { Router } from 'express';
import scar from '../../json/villains/scar.json';

const router = Router();
type Language = keyof typeof scar.translations;
type VillainData = typeof scar;

const villains: Record<string, VillainData> = {
  scar,
};

router.get('/:villain', (req, res) => {
  const villainName = req.params.villain.toLowerCase();
  const villainData = villains[villainName];

  const availableLanguages = Object.keys(
    villainData.translations,
  ) as Language[];

  if (!villainData) {
    return res.status(404).json({
      message: `Villain "${villainName}" not found`,
    });
  }

  const requestedLanguage =
    typeof req.query.lang === 'string' ? req.query.lang.toLowerCase() : 'en';

  if (!availableLanguages.includes(requestedLanguage as Language)) {
    return res.status(400).json({
      message: `Language "${requestedLanguage}" is not supported`,
      availableLanguages,
    });
  }

  const language = requestedLanguage as Language;

  return res.json({
    ...villainData,
    language,
    localized: villainData.translations[language],
  });
});

export default router;
