import type { FC } from "react";

import type { AnalyticsCapability, PipelineCapability } from "../data/sections";
import styles from "../styles/CapabilityGrid.module.css";

import { Icon } from "./Icon";

type Capability = AnalyticsCapability | PipelineCapability;

type CapabilityGridProps = {
  id: string;
  title: string;
  subtitle: string;
  capabilities: Capability[];
};

export const CapabilityGrid: FC<CapabilityGridProps> = ({
  id,
  title,
  subtitle,
  capabilities
}) => (
  <section id={id} className={styles.section}>
    <div className={styles.header}>
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </div>
    <div className={styles.grid}>
      {capabilities.map((capability) => (
        <article key={capability.title} className={styles.card}>
          <div className={styles.iconWrapper}>
            <Icon name={capability.icon} />
          </div>
          <h3>{capability.title}</h3>
          <p>{capability.description}</p>
        </article>
      ))}
    </div>
  </section>
);
