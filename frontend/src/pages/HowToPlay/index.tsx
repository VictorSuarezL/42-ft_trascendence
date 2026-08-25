import { useParams } from 'react-router-dom';
import { Character } from './Character';
import { BasicRules } from './BasicRules';

export function HowToPlay() {
  const { villain } = useParams<{ villain: string }>();
  if (villain) {
    return <Character name={villain} />;
  } else {
    return <BasicRules />;
  }
}
