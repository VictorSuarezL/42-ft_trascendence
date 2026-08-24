import { useParams } from 'react-router-dom';
import { Character } from './Character';
import { BasicRules } from './BasicRules';

export function HowToPlay() {
  const { name } = useParams<{ name: string }>();
  if (name) {
    return <Character name={name} />;
  } else {
    return <BasicRules />;
  }
}
