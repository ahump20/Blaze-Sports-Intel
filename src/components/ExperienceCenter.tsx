import type { FC } from "react";

import { experiences } from "../data/sections";
import styles from "../styles/ExperienceCenter.module.css";

export const ExperienceCenter: FC = () => (
  <section id="experiences" className={styles.section}>
    <div className={styles.header}>
      <h2>Experience Center</h2>
      <p>Immersive showcases from every Blaze Intelligence subdomain in one interactive hub.</p>
    </div>
    <div className={styles.grid}>
      {experiences.map((experience) => (
        <article key={experience.headline} className={styles.card}>
          <header>
            <p className={styles.badge}>{experience.badge}</p>
            <p className={styles.sport}>{experience.sport}</p>
            <h3>{experience.headline}</h3>
          </header>
          <p>{experience.subheading}</p>
          <a className={styles.cta} href="#insights">
            {experience.cta}
          </a>
        </article>
      ))}
    </div>
  </section>
);
