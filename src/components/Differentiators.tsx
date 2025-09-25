import type { FC } from "react";

import { uniqueDifferentiators } from "../data/sections";
import styles from "../styles/Differentiators.module.css";

import { Icon } from "./Icon";

export const Differentiators: FC = () => (
  <section id="differentiators" className={styles.section}>
    <div className={styles.header}>
      <h2>Blaze Intelligence Moat</h2>
      <p>
        Each differentiator converts instinct into auditable math, ensuring executives can trust what they see and trace why it
        matters.
      </p>
    </div>
    <ul className={styles.grid}>
      {uniqueDifferentiators.map((differentiator) => (
        <li key={differentiator.title} className={styles.card}>
          <div className={styles.iconWrapper}>
            <Icon name={differentiator.icon} />
          </div>
          <h3>{differentiator.title}</h3>
          <p>{differentiator.description}</p>
          <p className={styles.proof}>
            <span className={styles.proofLabel}>Proof:</span> {differentiator.proof}
          </p>
        </li>
      ))}
    </ul>
  </section>
);
