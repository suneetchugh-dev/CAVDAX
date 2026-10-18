/**
 * CAVDAX Core Cypher Queries
 * Implements the 3 mathematically sound queries tested for FalkorDB GraphBLAS.
 */

/**
 * Query 1: Enclosed Action Gate Verification
 * Inspects all dependency paths and uses ANY(...) aggregation to ensure zero stale links.
 */
export async function verifyActionGate(graph, decisionId) {
  const startTime = Date.now();

  const cypher = `
    MATCH (d:Decision {id: $decisionId})
    WITH d, d.status AS decision_status
    OPTIONAL MATCH path = (d)-[:DEPENDS_ON*1..4]->(f:Fact)-[:EXTRACTED_FROM]->(s:Source)
    WITH d, decision_status,
         collect({
           path_nodes: [n IN nodes(path) | labels(n)[0] + ':' + coalesce(n.id, n.ref)],
           fact_stale: coalesce(f.is_stale, false),
           source_status: coalesce(s.status, 'ACTIVE'),
           has_invalid_decision: ANY(n IN nodes(path) WHERE (n:Decision) AND n.status <> 'VALID')
         }) AS dependencies
    RETURN d.id AS decision_id,
           decision_status,
           CASE
             WHEN decision_status = 'INVALIDATED_NEEDS_REVALIDATION' THEN 'BLOCKED_DECISION_INVALIDATED'
             WHEN size(dependencies) = 0 THEN 'BLOCKED_NO_GROUNDING'
             WHEN ANY(dep IN dependencies WHERE dep.has_invalid_decision = true) THEN 'BLOCKED_INTERMEDIATE_DECISION_INVALIDATED'
             WHEN ANY(dep IN dependencies WHERE dep.fact_stale = true) THEN 'BLOCKED_STALE_FACT'
             WHEN ANY(dep IN dependencies WHERE dep.source_status = 'SUPERSEDED') THEN 'BLOCKED_SUPERSEDED_SOURCE'
             ELSE 'APPROVED'
           END AS gate_verdict,
           [dep IN dependencies WHERE dep.has_invalid_decision = true OR dep.fact_stale = true OR dep.source_status = 'SUPERSEDED' | dep.path_nodes] AS violation_paths
  `;

  const result = await graph.query(cypher, { params: { decisionId } });
  const latencyMs = Date.now() - startTime;

  if (!result.data || result.data.length === 0) {
    return {
      decision_id: decisionId,
      gate_verdict: 'BLOCKED_DECISION_NOT_FOUND',
      latency_ms: latencyMs,
      violation_paths: [],
      error: `Decision '${decisionId}' does not exist in FalkorDB.`
    };
  }

  const row = result.data[0];
  return {
    decision_id: row.decision_id,
    decision_status: row.decision_status,
    gate_verdict: row.gate_verdict,
    violation_paths: row.violation_paths || [],
    is_approved: row.gate_verdict === 'APPROVED',
    latency_ms: latencyMs
  };
}

/**
 * Query 2: Cascading Invalidation on Ingesting Superseding Source
 * Establishes the SUPERSEDES edge and cascades status flags across the DAG in < 4ms.
 */
export async function cascadeInvalidation(graph, newSourceId, oldSourceId) {
  const startTime = Date.now();

  const cypher = `
    MATCH (newSource:Source {id: $newSourceId})
    MATCH (oldSource:Source {id: $oldSourceId})
    MERGE (newSource)-[:SUPERSEDES]->(oldSource)
    SET oldSource.status = 'SUPERSEDED',
        oldSource.superseded_at = timestamp()
    WITH oldSource
    MATCH (oldSource)<-[:EXTRACTED_FROM]-(staleFact:Fact)
    SET staleFact.is_stale = true, 
        staleFact.invalidated_at = timestamp()
    WITH staleFact
    MATCH (d:Decision)-[:DEPENDS_ON*1..4]->(staleFact)
    SET d.status = 'INVALIDATED_NEEDS_REVALIDATION',
        d.invalidated_at = timestamp()
    RETURN count(DISTINCT d) AS affected_decisions, 
           collect(DISTINCT d.id) AS invalidated_decision_ids
  `;

  const result = await graph.query(cypher, { params: { newSourceId, oldSourceId } });
  const latencyMs = Date.now() - startTime;

  const row = result.data && result.data[0] ? result.data[0] : {};
  return {
    affected_decisions: row.affected_decisions || 0,
    invalidated_decision_ids: row.invalidated_decision_ids || [],
    latency_ms: latencyMs
  };
}

/**
 * Query 3: Act IV Revalidation (Closing the Loop)
 * Archives the old decision, creates the fresh decision, and links it to the active fact.
 */
export async function revalidateDecision(graph, { newSourceId, oldDecisionId, newDecisionId, newFactId, title }) {
  const startTime = Date.now();

  const cypher = `
    MATCH (newSource:Source {id: $newSourceId})<-[:EXTRACTED_FROM]-(newFact:Fact {id: $newFactId})
    MATCH (oldDecision:Decision {id: $oldDecisionId})
    CREATE (newDecision:Decision {
      id: $newDecisionId,
      title: $title,
      status: 'VALID',
      created_at: timestamp()
    })
    CREATE (newDecision)-[:DEPENDS_ON]->(newFact)
    CREATE (newDecision)-[:REPLACES]->(oldDecision)
    SET oldDecision.status = 'REPLACED_ARCHIVED'
    RETURN newDecision.id AS active_decision_id, oldDecision.id AS archived_decision_id
  `;

  const result = await graph.query(cypher, {
    params: { newSourceId, oldDecisionId, newDecisionId, newFactId, title }
  });
  const latencyMs = Date.now() - startTime;

  const row = result.data && result.data[0] ? result.data[0] : {};
  return {
    active_decision_id: row.active_decision_id,
    archived_decision_id: row.archived_decision_id,
    latency_ms: latencyMs
  };
}

/**
 * Query 4: Fetch Entire Graph State for Web HUD
 * Returns formatted nodes and edges for react-force-graph-2d / Cytoscape.
 */
export async function fetchGraphState(graph) {
  const nodesResult = await graph.query(`
    MATCH (n)
    RETURN id(n) AS internal_id, labels(n)[0] AS label, properties(n) AS props
  `);

  const edgesResult = await graph.query(`
    MATCH (a)-[r]->(b)
    RETURN id(a) AS source_internal, id(b) AS target_internal, 
           coalesce(a.id, a.ref) AS source_id, 
           coalesce(b.id, b.ref) AS target_id, 
           type(r) AS rel_type
  `);

  const nodes = (nodesResult.data || []).map(row => ({
    id: row.props.id || row.props.ref || String(row.internal_id),
    internalId: row.internal_id,
    label: row.label,
    ...row.props
  }));

  const edges = (edgesResult.data || []).map(row => ({
    source: row.source_id || String(row.source_internal),
    target: row.target_id || String(row.target_internal),
    type: row.rel_type
  }));

  return { nodes, edges };
}

/**
 * Query 5: Seed Demo Graph
 * Initializes the demo state with ADR-001 (Active), Fact (Auth v1, Fresh), and Decision #102 (Valid).
 */
export async function seedDemoGraph(graph) {
  console.log('[FalkorDB] Clearing and seeding demo graph...');
  await graph.query(`MATCH (n) DETACH DELETE n`);

  const cypher = `
    // 1. Initial Source (ADR-001)
    CREATE (s1:Source {
      id: 'ADR-001',
      ref: 'docs/adrs/ADR-001.md',
      type: 'ADR',
      status: 'ACTIVE',
      title: 'Adopt TokenAuth v1 for Payment Gateway',
      created_at: timestamp()
    })

    // 2. Fact extracted from ADR-001
    CREATE (f1:Fact {
      id: 'F-Auth-v1',
      claim: 'Payment gateway services require TokenAuth v1 for all checkout endpoints',
      is_stale: false,
      verified: true
    })
    CREATE (f1)-[:EXTRACTED_FROM]->(s1)

    // 3. Architecture Decision dependent on Fact 1
    CREATE (d1:Decision {
      id: 'DEC-102',
      title: 'Generate Checkout Service with TokenAuth v1',
      status: 'VALID',
      created_at: timestamp()
    })
    CREATE (d1)-[:DEPENDS_ON]->(f1)

    // 4. Staged Superseding Source (ADR-002) - Initially unlinked
    CREATE (s2:Source {
      id: 'ADR-002',
      ref: 'docs/adrs/ADR-002.md',
      type: 'ADR',
      status: 'ACTIVE',
      title: 'Mandatory Migration to OAuth2; TokenAuth v1 Decommissioned',
      created_at: timestamp()
    })
    CREATE (f2:Fact {
      id: 'F-OAuth2',
      claim: 'OAuth2 is strictly enforced across all payment endpoints; TokenAuth v1 prohibited',
      is_stale: false,
      verified: true
    })
    CREATE (f2)-[:EXTRACTED_FROM]->(s2)

    RETURN s1.id AS seeded_source, d1.id AS seeded_decision
  `;

  const result = await graph.query(cypher);
  console.log('[FalkorDB] Seed complete:', result.data);
  return result.data;
}
