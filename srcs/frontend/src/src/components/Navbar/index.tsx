import styles from './Navbar.module.scss';
export function Navbar() {
  return (
    <nav>
      <div className={styles.navbar}>
        <a href="/">Home</a>
        <a href="/test">Test</a>
        <a href="/test1">Test1</a>
      </div>
    </nav>
  );
}
