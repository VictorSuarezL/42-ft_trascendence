export const Button = ({
  onClick, // accion
  onHover,
  className, // estilos
  children, // lo que se renderiza
}: {
  onClick: () => void;
  onHover?: () => void;
  className: string;
  children: React.ReactNode;
}) => {
  return (
    <button className={className} onClick={onClick} onMouseEnter={onHover}>
      {children}
    </button>
  );
};
