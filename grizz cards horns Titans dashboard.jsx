import React from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { motion } from "framer-motion";

/*
 * Updated Team Dashboard
 *
 * This component renders a tabbed dashboard for four teams: the Memphis Grizzlies
 * (NBA), Tennessee Titans (NFL), Texas Longhorns (NCAA baseball), and the
 * St. Louis Cardinals (MLB). Each tab contains cards summarizing key
 * performance metrics and a corresponding bar chart. The metrics below are
 * pulled from the most recent publicly available data as of September 14, 2025.
 * See accompanying citations in the project documentation for exact sources.
 *
 * To update these stats with live data, replace the values in the `teamsData`
 * object with API calls or hooks feeding real‑time analytics.
 */

const teamsData = {
  grizzlies: {
    title: "Memphis Grizzlies",
    subtitle: "NBA 2024‑25 Regular Season",
    stats: [
      { name: "Points per Game", value: 121.7 },
      { name: "Opp. Points per Game", value: 116.9 },
      { name: "Offensive Rating", value: 117.7 },
      { name: "Defensive Rating", value: 113.0 },
      { name: "Net Rating", value: 4.7 },
      { name: "Pace", value: 103.3 },
      { name: "Record", value: "48–34" },
    ],
    chartData: [
      { category: "OffRtg", value: 117.7 },
      { category: "DefRtg", value: 113.0 },
      { category: "NetRtg", value: 4.7 },
      { category: "Pace", value: 103.3 },
    ],
  },
  titans: {
    title: "Tennessee Titans",
    subtitle: "NFL 2025 Season",
    stats: [
      { name: "EPA per Play", value: -0.41 },
      { name: "Success Rate", value: 23.64 },
      { name: "EPA per Pass", value: -0.39 },
      { name: "EPA per Rush", value: -0.44 },
      { name: "Pass Yards", value: 112 },
      { name: "Rush Yards", value: 71 },
      { name: "Completion %", value: 42.86 },
      { name: "Sack %", value: 17.65 },
    ],
    chartData: [
      { category: "EPA/Play", value: -0.41 },
      { category: "EPA/Pass", value: -0.39 },
      { category: "EPA/Rush", value: -0.44 },
    ],
  },
  longhorns: {
    title: "Texas Longhorns",
    subtitle: "NCAA Baseball 2025",
    stats: [
      { name: "Record", value: "44–14 (22–8 SEC)" },
      { name: "Coaches Rank", value: 12 },
      { name: "D1Baseball Rank", value: 17 },
      { name: "Scoring Margin", value: 2.7 },
    ],
    chartData: [
      { category: "Coaches Rank", value: 12 },
      { category: "D1 Rank", value: 17 },
      { category: "Scoring Margin", value: 2.7 },
    ],
  },
  cardinals: {
    title: "St. Louis Cardinals",
    subtitle: "MLB 2024 Run Value Leaders",
    stats: [
      { name: "Helsley Slider", value: 27, per100: 1.8 },
      { name: "Gray Sweeper", value: 39, per100: 1.5 },
      { name: "Pallante Fastball", value: 36, per100: 1.0 },
      { name: "Mikolas Slider", value: 31.2, per100: 0.8 },
      { name: "Fedde Cutter", value: 6, per100: 0.6 },
      { name: "Mikolas Sinker", value: 6, per100: 0.2 },
    ],
    chartData: [
      { category: "Helsley Slider", value: 1.8 },
      { category: "Gray Sweeper", value: 1.5 },
      { category: "Pallante Fastball", value: 1.0 },
      { category: "Mikolas Slider", value: 0.8 },
      { category: "Fedde Cutter", value: 0.6 },
      { category: "Mikolas Sinker", value: 0.2 },
    ],
  },
};

const fadeVariant = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function TeamDashboard() {
  return (
    <Tabs defaultValue="grizzlies" className="w-full space-y-6">
      <TabsList className="grid grid-cols-4 gap-2 bg-muted p-2 rounded-xl">
        {Object.entries(teamsData).map(([key, team]) => (
          <TabsTrigger
            key={key}
            value={key}
            className="py-2 px-4 text-sm font-semibold rounded-lg focus:outline-none data-[state=active]:bg-primary/90 data-[state=active]:text-white"
          >
            {team.title}
          </TabsTrigger>
        ))}
      </TabsList>
      {Object.entries(teamsData).map(([key, team]) => (
        <TabsContent key={key} value={key} asChild>
          <section className="space-y-6">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeVariant}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Team Summary */}
              <Card className="bg-white border border-gray-200 shadow-sm rounded-xl p-4 flex flex-col">
                <CardHeader className="mb-2">
                  <h3 className="text-xl font-bold text-gray-800">
                    {team.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {team.subtitle}
                  </p>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-1 text-sm">
                    {team.stats.map((stat) => (
                      <li key={stat.name} className="flex justify-between">
                        <span className="font-medium text-gray-700">{stat.name}</span>
                        <span className="text-gray-900">
                          {typeof stat.value === "number" ? stat.value : stat.value}
                          {stat.per100 !== undefined && (
                            <span className="text-xs text-gray-500 ml-1">
                              ({stat.per100.toFixed(1)}/100)
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="mt-2">
                  <p className="text-xs text-gray-500 italic">
                    Data current as of Sept 14 2025. Replace with live hooks for
                    real‑time analytics.
                  </p>
                </CardFooter>
              </Card>
              {/* Chart */}
              <Card className="bg-white border border-gray-200 shadow-sm rounded-xl p-4">
                <CardHeader className="mb-2">
                  <h3 className="text-lg font-bold text-gray-800">Key Metrics</h3>
                </CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={team.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                      <XAxis dataKey="category" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip wrapperClassName="text-sm" />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Bar dataKey="value" name="Value" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
                <CardFooter>
                  <p className="text-xs text-gray-500">
                    The bar chart visualizes the most relevant metrics for each
                    team. For the Cardinals, values denote run value per 100
                    pitches; for other teams, they represent ratings or
                    efficiency metrics.
                  </p>
                </CardFooter>
              </Card>
            </motion.div>
          </section>
        </TabsContent>
      ))}
    </Tabs>
  );
}