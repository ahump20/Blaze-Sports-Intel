import type { FC } from "react";

import styles from "../styles/Hero.module.css";

export const Hero: FC = () => (
  <section className={styles.hero}>
    <div className={styles.copy}>
      <p className={styles.kicker}>Unified Intelligence / Real-Time Command</p>
      <h1 className={styles.title}>
        The Blaze Sports Intelligence platform brings every subdomain, dashboard, and showcase
        under one executive roof.
      </h1>
      <p className={styles.subtitle}>
        From the Command Center to the 3D Championship dashboards, coaches and executives operate
        on the same secure metrics fabric—built for Baseball, Football, Basketball, and Track & Field.
      </p>
      <div className={styles.actions}>
        <a className={styles.primaryAction} href="#analytics">
          Explore the Platform
        </a>
        <a className={styles.secondaryAction} href="#experiences">
          Watch Experience Center
        </a>
      </div>
    </div>
    <div className={styles.metrics}>
      <dl>
        <div>
          <dt>Connected Tools Replaced</dt>
          <dd>43</dd>
        </div>
        <div>
          <dt>Live Data Streams</dt>
          <dd>28</dd>
        </div>
        <div>
          <dt>Executive Adoption</dt>
          <dd>97%</dd>
        </div>
      </dl>
    </div>
  </section>
);
