import { supabaseAdmin } from "@/lib/supabase/admin";

export interface LinkNode {
  userId: string;
  domain: string;
  tier: number;
}

export interface LinkEdge {
  sourceUserId: string;
  targetUserId: string;
  sourceDomain: string;
  targetDomain: string;
  module: "distribution" | "exchange";
  isLive: boolean;
  createdAt: string;
}

export interface GraphAnalysis {
  hasReciprocal: boolean;
  shortestPath: number;
  clusterRisk: number;
  patternFlags: PatternFlag[];
}

export interface PatternFlag {
  type: "reciprocal" | "short_loop" | "cluster" | "velocity" | "same_subnet";
  severity: "warning" | "danger";
  description: string;
  involvedNodes: string[];
}

const MIN_SAFE_HOP_DISTANCE = 3;
const MAX_CONNECTIONS_PER_PAIR = 2;
const MAX_DAILY_LINKS_FROM_SAME_SOURCE = 3;
const CLUSTER_THRESHOLD = 5;

export class LinkGraphAnalyzer {
  static async analyzeRoute(
    sourceUserId: string,
    targetUserId: string,
    sourceDomain?: string,
    targetDomain?: string
  ): Promise<GraphAnalysis> {
    const patternFlags: PatternFlag[] = [];

    const hasReciprocal = await this.checkReciprocalLink(sourceUserId, targetUserId);
    if (hasReciprocal) {
      patternFlags.push({
        type: "reciprocal",
        severity: "danger",
        description: "Direct reciprocal link exists between these users",
        involvedNodes: [sourceUserId, targetUserId],
      });
    }

    const shortestPath = await this.calculateShortestPath(sourceUserId, targetUserId);
    if (shortestPath > 0 && shortestPath < MIN_SAFE_HOP_DISTANCE) {
      patternFlags.push({
        type: "short_loop",
        severity: "danger",
        description: `Path distance ${shortestPath} is below minimum safe distance of ${MIN_SAFE_HOP_DISTANCE}`,
        involvedNodes: [sourceUserId, targetUserId],
      });
    }

    const clusterRisk = await this.analyzeClusterRisk(sourceUserId, targetUserId);
    if (clusterRisk > 50) {
      patternFlags.push({
        type: "cluster",
        severity: clusterRisk > 70 ? "danger" : "warning",
        description: `High link cluster detected (${clusterRisk}% risk)`,
        involvedNodes: [sourceUserId, targetUserId],
      });
    }

    if (sourceDomain && targetDomain) {
      const sameSubnet = this.checkSameSubnet(sourceDomain, targetDomain);
      if (sameSubnet) {
        patternFlags.push({
          type: "same_subnet",
          severity: "warning",
          description: "Domains may share same IP subnet or hosting",
          involvedNodes: [sourceDomain, targetDomain],
        });
      }
    }

    const velocityIssue = await this.checkVelocityPattern(sourceUserId, targetUserId);
    if (velocityIssue) {
      patternFlags.push({
        type: "velocity",
        severity: "warning",
        description: "Too many links created between these users recently",
        involvedNodes: [sourceUserId, targetUserId],
      });
    }

    return {
      hasReciprocal,
      shortestPath,
      clusterRisk,
      patternFlags,
    };
  }

  static async checkReciprocalLink(userA: string, userB: string): Promise<boolean> {
    const { data: aToB } = await supabaseAdmin
      .from("backlinks")
      .select("id")
      .eq("user_id", userA)
      .limit(1);

    const { data: bToA } = await supabaseAdmin
      .from("backlinks")
      .select("id")
      .eq("user_id", userB)
      .limit(1);

    if ((aToB?.length || 0) > 0 && (bToA?.length || 0) > 0) {
      return true;
    }

    const { data: exchAToB } = await supabaseAdmin
      .from("exchange_link_graph")
      .select("id")
      .eq("source_user_id", userA)
      .eq("target_user_id", userB)
      .eq("is_live", true)
      .limit(1);

    const { data: exchBToA } = await supabaseAdmin
      .from("exchange_link_graph")
      .select("id")
      .eq("source_user_id", userB)
      .eq("target_user_id", userA)
      .eq("is_live", true)
      .limit(1);

    return (exchAToB?.length || 0) > 0 && (exchBToA?.length || 0) > 0;
  }

  static async calculateShortestPath(userA: string, userB: string): Promise<number> {
    if (userA === userB) return 0;

    const visited = new Set<string>();
    const queue: { userId: string; distance: number }[] = [{ userId: userA, distance: 0 }];

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (current.userId === userB) {
        return current.distance;
      }

      if (visited.has(current.userId) || current.distance >= 6) continue;
      visited.add(current.userId);

      const neighbors = await this.getConnectedUsers(current.userId);
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          queue.push({ userId: neighbor, distance: current.distance + 1 });
        }
      }
    }

    return 999;
  }

  private static async getConnectedUsers(userId: string): Promise<string[]> {
    const neighbors = new Set<string>();

    const { data: distOutgoing } = await supabaseAdmin
      .from("backlinks")
      .select("source_user_id")
      .eq("user_id", userId)
      .eq("status", "Live");

    distOutgoing?.forEach(l => {
      if (l.source_user_id) neighbors.add(l.source_user_id);
    });

    const { data: exchOutgoing } = await supabaseAdmin
      .from("exchange_link_graph")
      .select("target_user_id")
      .eq("source_user_id", userId)
      .eq("is_live", true);

    exchOutgoing?.forEach(l => neighbors.add(l.target_user_id));

    const { data: exchIncoming } = await supabaseAdmin
      .from("exchange_link_graph")
      .select("source_user_id")
      .eq("target_user_id", userId)
      .eq("is_live", true);

    exchIncoming?.forEach(l => neighbors.add(l.source_user_id));

    return Array.from(neighbors);
  }

  static async analyzeClusterRisk(userA: string, userB: string): Promise<number> {
    const neighborsA = new Set(await this.getConnectedUsers(userA));
    const neighborsB = new Set(await this.getConnectedUsers(userB));

    let sharedNeighbors = 0;
    for (const neighbor of neighborsA) {
      if (neighborsB.has(neighbor)) {
        sharedNeighbors++;
      }
    }

    const totalNeighbors = neighborsA.size + neighborsB.size - sharedNeighbors;
    if (totalNeighbors === 0) return 0;

    const clusterCoefficient = sharedNeighbors / Math.max(neighborsA.size, neighborsB.size);
    return Math.round(clusterCoefficient * 100);
  }

  private static checkSameSubnet(domainA: string, domainB: string): boolean {
    const extractRoot = (domain: string) => {
      const parts = domain.replace(/^www\./, "").split(".");
      if (parts.length >= 2) {
        return parts.slice(-2).join(".");
      }
      return domain;
    };

    return extractRoot(domainA) === extractRoot(domainB);
  }

  private static async checkVelocityPattern(userA: string, userB: string): Promise<boolean> {
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: recentLinks } = await supabaseAdmin
      .from("exchange_link_graph")
      .select("id")
      .or(`and(source_user_id.eq.${userA},target_user_id.eq.${userB}),and(source_user_id.eq.${userB},target_user_id.eq.${userA})`)
      .gte("created_at", last24h);

    return (recentLinks?.length || 0) >= MAX_DAILY_LINKS_FROM_SAME_SOURCE;
  }

  static async isRouteSafe(
    sourceUserId: string,
    targetUserId: string,
    module: "distribution" | "exchange"
  ): Promise<{ safe: boolean; reason?: string }> {
    const analysis = await this.analyzeRoute(sourceUserId, targetUserId);

    if (analysis.hasReciprocal) {
      return { safe: false, reason: "Direct reciprocal link would be created" };
    }

    if (analysis.shortestPath > 0 && analysis.shortestPath < MIN_SAFE_HOP_DISTANCE) {
      return { safe: false, reason: `Path too short (${analysis.shortestPath} hops)` };
    }

    const dangerFlags = analysis.patternFlags.filter(f => f.severity === "danger");
    if (dangerFlags.length > 0) {
      return { safe: false, reason: dangerFlags[0].description };
    }

    if (module === "exchange") {
      const connectionCount = await this.getConnectionCount(sourceUserId, targetUserId);
      if (connectionCount >= MAX_CONNECTIONS_PER_PAIR) {
        return { safe: false, reason: "Maximum connections between users reached" };
      }
    }

    return { safe: true };
  }

  static async getConnectionCount(userA: string, userB: string): Promise<number> {
    const { data: aToB } = await supabaseAdmin
      .from("exchange_link_graph")
      .select("id")
      .eq("source_user_id", userA)
      .eq("target_user_id", userB);

    const { data: bToA } = await supabaseAdmin
      .from("exchange_link_graph")
      .select("id")
      .eq("source_user_id", userB)
      .eq("target_user_id", userA);

    return (aToB?.length || 0) + (bToA?.length || 0);
  }

  static async detectPatterns(userId: string): Promise<{
    totalLinks: number;
    reciprocalCount: number;
    avgPathDistance: number;
    clusterScore: number;
    riskAssessment: "low" | "medium" | "high";
    recommendations: string[];
  }> {
    const { data: outgoing } = await supabaseAdmin
      .from("exchange_link_graph")
      .select("target_user_id, hop_distance")
      .eq("source_user_id", userId)
      .eq("is_live", true);

    const { data: incoming } = await supabaseAdmin
      .from("exchange_link_graph")
      .select("source_user_id, hop_distance")
      .eq("target_user_id", userId)
      .eq("is_live", true);

    const totalLinks = (outgoing?.length || 0) + (incoming?.length || 0);
    
    let reciprocalCount = 0;
    const outTargets = new Set(outgoing?.map(l => l.target_user_id) || []);
    for (const inc of incoming || []) {
      if (outTargets.has(inc.source_user_id)) {
        reciprocalCount++;
      }
    }

    const allDistances = [
      ...(outgoing?.map(l => l.hop_distance || 0) || []),
      ...(incoming?.map(l => l.hop_distance || 0) || []),
    ];
    const avgPathDistance = allDistances.length > 0
      ? allDistances.reduce((a, b) => a + b, 0) / allDistances.length
      : 0;

    const connectedUsers = await this.getConnectedUsers(userId);
    let totalClusterScore = 0;
    for (const other of connectedUsers.slice(0, 10)) {
      totalClusterScore += await this.analyzeClusterRisk(userId, other);
    }
    const clusterScore = connectedUsers.length > 0
      ? Math.round(totalClusterScore / Math.min(connectedUsers.length, 10))
      : 0;

    let riskAssessment: "low" | "medium" | "high" = "low";
    const recommendations: string[] = [];

    if (reciprocalCount > 0) {
      riskAssessment = "high";
      recommendations.push("Eliminate reciprocal links immediately");
    }
    if (avgPathDistance < 3 && avgPathDistance > 0) {
      riskAssessment = riskAssessment === "high" ? "high" : "medium";
      recommendations.push("Increase link distance diversity");
    }
    if (clusterScore > 50) {
      riskAssessment = riskAssessment === "low" ? "medium" : riskAssessment;
      recommendations.push("Diversify link sources to reduce clustering");
    }

    if (recommendations.length === 0) {
      recommendations.push("Link profile looks healthy");
    }

    return {
      totalLinks,
      reciprocalCount,
      avgPathDistance: Math.round(avgPathDistance * 10) / 10,
      clusterScore,
      riskAssessment,
      recommendations,
    };
  }

  static async enforceModuleIsolation(
    pageUrl: string,
    requestingModule: "distribution" | "exchange"
  ): Promise<{ allowed: boolean; reason?: string }> {
    const { data: distLinks } = await supabaseAdmin
      .from("backlinks")
      .select("id")
      .eq("linking_url", pageUrl)
      .limit(1);

    const { data: exchLinks } = await supabaseAdmin
      .from("exchange_link_graph")
      .select("id")
      .or(`source_page_url.eq.${pageUrl},link_url.eq.${pageUrl}`)
      .limit(1);

    if (requestingModule === "distribution" && (exchLinks?.length || 0) > 0) {
      return {
        allowed: false,
        reason: "Page already has exchange links - modules must not share pages",
      };
    }

    if (requestingModule === "exchange" && (distLinks?.length || 0) > 0) {
      return {
        allowed: false,
        reason: "Page already has distribution links - modules must not share pages",
      };
    }

    return { allowed: true };
  }

  static async getGraphStats(userId: string): Promise<{
    distribution: { nodes: number; edges: number };
    exchange: { nodes: number; edges: number };
    combined: { nodes: number; edges: number; isolation: boolean };
  }> {
    const { data: distLinks } = await supabaseAdmin
      .from("backlinks")
      .select("id, source_domain")
      .eq("user_id", userId);

    const { data: exchOutgoing } = await supabaseAdmin
      .from("exchange_link_graph")
      .select("id, source_user_id, target_user_id")
      .eq("source_user_id", userId);

    const { data: exchIncoming } = await supabaseAdmin
      .from("exchange_link_graph")
      .select("id, source_user_id, target_user_id")
      .eq("target_user_id", userId);

    const distDomains = new Set(distLinks?.map(l => l.source_domain) || []);
    const exchUsers = new Set([
      ...(exchOutgoing?.map(l => l.target_user_id) || []),
      ...(exchIncoming?.map(l => l.source_user_id) || []),
    ]);

    return {
      distribution: {
        nodes: distDomains.size,
        edges: distLinks?.length || 0,
      },
      exchange: {
        nodes: exchUsers.size,
        edges: (exchOutgoing?.length || 0) + (exchIncoming?.length || 0),
      },
      combined: {
        nodes: distDomains.size + exchUsers.size,
        edges: (distLinks?.length || 0) + (exchOutgoing?.length || 0) + (exchIncoming?.length || 0),
        isolation: true,
      },
    };
  }
}
