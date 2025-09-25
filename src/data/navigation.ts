export type NavigationItem = {
  id: string;
  label: string;
};

export const navigation: NavigationItem[] = [
  { id: "analytics", label: "Command Center" },
  { id: "experiences", label: "Experience Center" },
  { id: "pipeline", label: "AI Pipeline" },
  { id: "partnerships", label: "Partnerships" },
  { id: "insights", label: "Insights" }
];
