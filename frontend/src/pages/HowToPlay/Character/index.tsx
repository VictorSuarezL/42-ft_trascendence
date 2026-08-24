import { useEffect } from 'react';

export function Character({ name }: { name: string }) {
  // https://es.react.dev/reference/react/useEffect
  useEffect(() => {
    // Aquí va la llamada a la API para obtener
    // la información del personaje según el nombre
  }, [name]);

  return (
    <div>
      <h1>Personaje: {name}</h1>
      <p>Esta es la página de instrucciones para el personaje {name}.</p>
    </div>
  );
}
