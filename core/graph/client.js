/**
 * CAVDAX FalkorDB Connection Manager
 * Connects to local Docker container or FalkorDB Cloud via Redis protocol.
 */

let FalkorDB = null;

let dbInstance = null;
let graphInstance = null;

const DEFAULT_GRAPH_NAME = 'cavdax_core_graph';

export async function getFalkorClient() {
  if (graphInstance) {
    return { db: dbInstance, graph: graphInstance };
  }

  if (!FalkorDB) {
    try {
      const mod = await import('falkordb');
      FalkorDB = mod.FalkorDB;
    } catch {
      throw new Error("Package 'falkordb' is not installed. Run 'npm install' or run inside Docker Compose.");
    }
  }

  const host = process.env.FALKORDB_HOST || 'localhost';
  const port = parseInt(process.env.FALKORDB_PORT || '6379', 10);
  const password = process.env.FALKORDB_PASSWORD || undefined;
  const graphName = process.env.FALKORDB_GRAPH_NAME || DEFAULT_GRAPH_NAME;

  console.log(`[FalkorDB] Connecting to ${host}:${port}...`);

  try {
    const connectionOptions = {
      socket: {
        host,
        port,
      },
    };

    if (password) {
      connectionOptions.password = password;
    }

    dbInstance = await FalkorDB.connect(connectionOptions);
    graphInstance = dbInstance.selectGraph(graphName);

    console.log(`[FalkorDB] Successfully connected. Selected graph: '${graphName}'`);
    return { db: dbInstance, graph: graphInstance };
  } catch (error) {
    console.error(`[FalkorDB Connection Error]:`, error.message);
    throw error;
  }
}

export async function closeFalkorClient() {
  if (dbInstance) {
    await dbInstance.close();
    dbInstance = null;
    graphInstance = null;
    console.log('[FalkorDB] Connection closed.');
  }
}
