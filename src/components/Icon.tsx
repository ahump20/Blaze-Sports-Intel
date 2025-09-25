import {
  ActivityLogIcon,
  DashboardIcon,
  LightningBoltIcon,
  MixIcon,
  RocketIcon,
  StackIcon
} from "@radix-ui/react-icons";
import type { FC } from "react";

const iconMap = {
  dashboard: DashboardIcon,
  brain: ActivityLogIcon,
  chart: RocketIcon,
  shield: MixIcon,
  layers: StackIcon,
  sparkle: LightningBoltIcon
} as const;

export type IconName = keyof typeof iconMap;

type IconProps = {
  name: IconName;
};

export const Icon: FC<IconProps> = ({ name }) => {
  const Component = iconMap[name];

  return <Component aria-hidden="true" focusable="false" />;
};
