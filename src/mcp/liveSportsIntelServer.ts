import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

import { LiveSportsIntelError, LiveSportsIntelFetcher } from '../lib/liveSportsIntelFetcher';

const server = new McpServer(
  {
    name: 'blaze-sports-intel-live',
    version: '1.0.0',
  },
  {
    instructions:
      'Use the fetch_blaze_intel tool to gather live sports intelligence from any Blaze Intelligence domain or subdomain.',
  },
);

const fetcher = new LiveSportsIntelFetcher();

const fetchParams = {
  target: z
    .string()
    .describe('Blaze Sports Intel domain or fully qualified URL (must end with blazesportsintel.com).'),
  path: z
    .string()
    .optional()
    .describe('Optional path to append when the target is a bare domain (e.g., /live-baseball).'),
  includeLinks: z
    .boolean()
    .optional()
    .describe('Include curated internal/external links in the response. Defaults to true.'),
  includeStructuredData: z
    .boolean()
    .optional()
    .describe('Include any JSON-LD structured data discovered on the page. Defaults to true.'),
} as const;

const fetchParamsSchema = z.object(fetchParams);

type FetchParams = z.infer<typeof fetchParamsSchema>;

server.tool(
  'fetch_blaze_intel',
  'Fetch live sports intelligence for a Blaze Intelligence property.',
  fetchParams,
  async (args: FetchParams) => {
    try {
      const intel = await fetcher.fetchIntel({
        target: args.target,
        path: args.path,
        includeLinks: args.includeLinks,
        includeStructuredData: args.includeStructuredData,
      });

      return {
        content: [
          {
            type: 'text' as const,
            text:
              intel.summary.length > 0
                ? `Summary for ${intel.metadata.title ?? intel.requestedUrl}: ${intel.summary}`
                : `Fetched Blaze Intelligence intel for ${intel.requestedUrl}.`,
          },
        ],
        structuredContent: {
          intel,
        },
      };
    } catch (error) {
      const message =
        error instanceof LiveSportsIntelError
          ? `${error.code}: ${error.message}`
          : 'Unexpected failure fetching Blaze Intelligence data.';

      return {
        isError: true,
        content: [
          {
            type: 'text' as const,
            text: message,
          },
        ],
      };
    }
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown MCP server error';
  console.error(`Failed to start Blaze Sports Intel MCP server: ${message}`);
  process.exitCode = 1;
});

process.on('SIGINT', async () => {
  await server.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await server.close();
  process.exit(0);
});
