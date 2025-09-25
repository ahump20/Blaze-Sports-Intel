import type { FC } from "react";

import { navigation } from "../data/navigation";
import styles from "../styles/Header.module.css";

export const Header: FC = () => (
  <header className={styles.header}>
    <div className={styles.branding}>
      <span className={styles.logo} aria-hidden="true">
        ⚡
      </span>
      <div>
        <p className={styles.company}>Blaze Intelligence</p>
        <p className={styles.tagline}>Unified Sports Command Platform</p>
      </div>
    </div>
    <nav aria-label="Primary">
      <ul className={styles.navList}>
        {navigation.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`} className={styles.navLink}>
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
    <a className={styles.cta} href="#insights">
      Request Field Demo
    </a>
  </header>
);
