/**
 * Team Contrarians Data Specification
 * WeMakeDevs x FalkorDB Graph Hacks Hackathon
 */

export const TEAM_DETAILS = {
  name: 'Contrarians',
  tagline: 'Defying Vector RAG Blindness with Causal Graph Intelligence',
  logo: '/team/contrarians-logo.png',
  hackathon: 'WeMakeDevs × FalkorDB Graph Hacks (October 2026)',
  track: 'Track 01: Agents That Act on Connected Data (Primary) & Track 02: Knowledge Graphs & Long-Term Memory',
  license: 'GNU General Public License v3.0 (GPL-3.0)',
  githubRepo: 'https://github.com/suneetchugh-dev/CAVDAX',
};

export const TEAM_MEMBERS = [
  {
    id: 'suneet',
    name: 'Suneet Chugh',
    role: 'Team Leader',
    title: 'Lead Architect & Systems Engineer',
    domain: 'Distributed Systems, GraphBLAS & Agentic MCP',
    bio: 'Pioneered the FalkorDB GraphBLAS causal invalidation loop, enclosed MCP execution gate architecture, Real-Time Metrics HUD, and production web deployment.',
    avatar: '/avatars/suneet.webp',
    fallbackAvatar: 'https://github.com/suneetchugh-dev.png',
    github: 'https://github.com/suneetchugh-dev',
    linkedin: 'https://www.linkedin.com/in/suneetchugh-dev/',
    tags: ['FalkorDB', 'GraphBLAS', 'MCP Architecture', 'Cypher', 'DevOps & Docker'],
    highlights: [
      'Engineered sub-2ms Query 2 GraphBLAS invalidation cascade in FalkorDB',
      'Designed enclosed MCP protocol proxy intercepting in-flight agent write tools',
      'Built hardware-accelerated monochromatic HUD and responsive metrics'
    ]
  },
  {
    id: 'geetika',
    name: 'Geetika Chugh',
    role: 'Developer',
    title: 'Causal Graph & Cognitive Engine Developer',
    domain: 'Knowledge Graphs, Agent Cognition & Causal Inference',
    bio: 'Engineered the 4-tier causal DAG ontology, multi-hop provenance graph verification, and empirical benchmark evaluations demonstrating 100% elimination of silent cache rot.',
    avatar: '/avatars/geetika.png',
    fallbackAvatar: 'https://github.com/GeetikaChughIBM.png',
    github: 'https://github.com/GeetikaChughIBM',
    linkedin: 'https://www.linkedin.com/in/geetika-chugh-085251252/',
    tags: ['Causal Graphs', 'DAG Ontologies', 'Empirical Benchmarks', 'Agent Cognition', 'Verification Logic'],
    highlights: [
      'Formalized Source -> Fact -> Decision causal ontology and lifecycle states',
      'Authored 10-Scenario evaluation dataset proving Vector RAG failure modes',
      'Led technical deep-dive documentation on silent cache rot elimination'
    ]
  }
];

export const SYSTEM_CREDITS = [
  { label: 'Graph Engine', value: 'FalkorDB GraphBLAS', detail: 'Linear algebraic sparse matrix operations in RAM' },
  { label: 'Agent Protocol', value: 'Model Context Protocol (MCP)', detail: 'Anthropic open standard (2024-11-05)' },
  { label: 'Gate SLA', value: '< 15ms Latency', detail: 'Zero perceptible delay during code generation' },
  { label: 'License', value: 'GNU GPL v3.0', detail: '100% Open Source and community auditable' }
];
