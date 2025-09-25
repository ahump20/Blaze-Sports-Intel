import type { FC } from "react";

import { strategicInsights } from "../data/sections";
import styles from "../styles/Insights.module.css";

export const Insights: FC = () => (
  <section id="insights" className={styles.section}>
    <div className={styles.header}>
      <h2>Why Teams Choose Blaze Intelligence</h2>
      <p>Executive dashboards, neural coaching, and live game orchestration aligned in one platform.</p>
    </div>
    <dl className={styles.list}>
      {strategicInsights.map((insight) => (
        <div key={insight.title} className={styles.item}>
          <dt>{insight.metric}</dt>
          <dd>
            <p className={styles.title}>{insight.title}</p>
            <p>{insight.summary}</p>
          </dd>
        </div>
      ))}
    </dl>
  </section>
);
