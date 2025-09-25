import type { FC } from "react";

import styles from "../styles/Footer.module.css";

export const Footer: FC = () => (
  <footer className={styles.footer}>
    <div>
      <p className={styles.brand}>Blaze Intelligence</p>
      <p>One secure home for scouting intel, AI coaching, executive storytelling, and revenue growth.</p>
    </div>
    <div className={styles.links}>
      <a href="mailto:hello@blazeintelligence.com">hello@blazeintelligence.com</a>
      <a href="#analytics">Platform Overview</a>
      <a href="#experiences">Experience Center</a>
    </div>
    <p className={styles.copyright}>© {new Date().getFullYear()} Blaze Intelligence. All rights reserved.</p>
  </footer>
);
