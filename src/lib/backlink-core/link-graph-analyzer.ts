import { supabaseAdmin } from "@/lib/supabase/admin";
import type { GraphDistance, ModuleType } from "./types";

const MIN_HOP_DISTANCE = 3;
const MAX_GRAPH_DEPTH = 6;
const MAX_CONNECTIONS_PER_PAIR = 2;

export class LinkGraphAnalyzer {
  static async calculateHopDistance(
    fromUserId: string,
    toUserId: string
  ): Promise<GraphDistance> {
    if (fromUserId === toUserId) {
      return {
        fromUserId,
        toUserId,
        hopCount: 0,
        path: [fromUserId],
        hasDirectLink: false,
        hasShortLoop: false,
      };
    }

    const hasDirectLink = await this.hasDirectConnection(fromUserId, toUserId);
    const hasShortLoop = await this.detectShortLoop(fromUserId, toUserId);

    const visited = new Set<string>();
    const queue: { userId: string; distance: number; path: string[] }[] = [
      { userId: fromUserId, distance: 0, path: [fromUserId] },
    ];

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (current.userId === toUserId) {
        return {
          fromUserId,
          toUserId,
          hopCount: current.distance,
          path: current.path,
          hasDirectLink,
          hasShortLoop,
        };
      }

      if (visited.has(current.userId)) continue;
      visited.add(current.userId);

      if (current.distance >= MAX_GRAPH_DEPTH) continue;

      const neighbors = await this.getConnectedUsers(current.userId);

      for (const neighborId of neighbors) {
        if (!visited.has(neighborId)) {
          queue.push({
            userId: neighborId,
            distance: current.distance + 1,
            path: [...current.path, neighborId],
          });
        }
      }
    }

    return {
      fromUserId,
      toUserId,
      hopCount: 999,
      path: [],
      hasDirectLink,
      hasShortLoop,
    };
  }

  static async hasDirectConnection(userA: string, userB: string): Promise<boolean> {
    const { data: aToB } = await supabaseAdmin
      .from("exchange_link_graph")
      .select("id")
      .eq("source_user_id", userA)
      .eq("target_user_id", userB)
      .eq("is_live", true)
      .limit(1);

    if (aToB && aToB.length > 0) return true;

    const { data: bToA } = await supabaseAdmin
      .from("exchange_link_graph")
      .select("id")
      .eq("source_user_id", userB)
      .eq("target_user_id", userA)
      .eq("is_live", true)
      .limit(1);

    return (bToA && bToA.length > 0) || false;
  }

  static async detectShortLoop(
    sourceUserId: string,
    targetUserId: string
  ): Promise<boolean> {
    const { data: reverseLinks } = await supabaseAdmin
      .from("exchange_link_graph")
      .select("source_user_id")
      .eq("target_user_id", sourceUserId)
      .eq("is_live", true);

    if (!reverseLinks) return false;

    for (const link of reverseLinks) {
      if (link.source_user_id === targetUserId) {
        return true;
      }

      const { data: secondHop } = await supabaseAdmin
        .from("exchange_link_graph")
        .select("id")
        .eq("source_user_id", link.source_user_id)
        .eq("target_user_id", targetUserId)
        .eq("is_live", true)
        .limit(1);

      if (secondHop && secondHop.length > 0) {
        return true;
      }
    }

    return false;
  }

  static async getConnectedUsers(userId: string): Promise<string[]> {
    const neighbors = new Set<string>();

    const { data: outgoing } = await supabaseAdmin
      .from("exchange_link_graph")
      .select("target_user_id")
      .eq("source_user_id", userId)
      .eq("is_live", true);

    outgoing?.forEach((l) => neighbors.add(l.target_user_id));

    const { data: incoming } = await supabaseAdmin
      .from("exchange_link_graph")
      .select("source_user_id")
      .eq("target_user_id", userId)
      .eq("is_live", true);

    incoming?.forEach((l) => neighbors.add(l.source_user_id));

    return Array.from(neighbors);
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

  static async validateExchangeRoute(
    sourceUserId: string,
    targetUserId: string
  ): Promise<{
    isValid: boolean;
    hopDistance: number;
    blockedReason?: string;
  }> {
    const graphDistance = await this.calculateHopDistance(sourceUserId, targetUserId);

    if (graphDistance.hasDirectLink) {
      return {
        isValid: false,
        hopDistance: 1,
        blockedReason: "Direct reciprocal link would be created",
      };
    }

    if (graphDistance.hasShortLoop) {
      return {
        isValid: false,
        hopDistance: graphDistance.hopCount,
        blockedReason: "Short link loop detected (A → B → A pattern)",
      };
    }

    if (graphDistance.hopCount < MIN_HOP_DISTANCE && graphDistance.hopCount > 0) {
      return {
        isValid: false,
        hopDistance: graphDistance.hopCount,
        blockedReason: `Hop distance ${graphDistance.hopCount} is less than minimum ${MIN_HOP_DISTANCE}`,
      };
    }

    const connectionCount = await this.getConnectionCount(sourceUserId, targetUserId);
    if (connectionCount >= MAX_CONNECTIONS_PER_PAIR) {
      return {
        isValid: false,
        hopDistance: graphDistance.hopCount,
        blockedReason: "Maximum connections between these users reached",
      };
    }

    return {
      isValid: true,
      hopDistance: graphDistance.hopCount || MIN_HOP_DISTANCE,
    };
  }

  static async getUserGraphMetrics(userId: string): Promise<{
    outgoingLinks: number;
    incomingLinks: number;
    uniqueConnections: number;
    avgHopDistance: number;
    networkReach: number;
    clusteringCoefficient: number;
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

    const uniqueConnections = new Set<string>();
    const hopDistances: number[] = [];

    outgoing?.forEach((l) => {
      uniqueConnections.add(l.target_user_id);
      if (l.hop_distance) hopDistances.push(l.hop_distance);
    });

    incoming?.forEach((l) => {
      uniqueConnections.add(l.source_user_id);
      if (l.hop_distance) hopDistances.push(l.hop_distance);
    });

    const avgHopDistance =
      hopDistances.length > 0
        ? hopDistances.reduce((a, b) => a + b, 0) / hopDistances.length
        : 0;

    const reachableUsers = new Set<string>();
    const toExplore = [userId];
    let depth = 0;

    while (toExplore.length > 0 && depth < 3) {
      const current = toExplore.shift()!;
      if (reachableUsers.has(current)) continue;
      reachableUsers.add(current);

      const neighbors = await this.getConnectedUsers(current);
      neighbors.forEach((n) => {
        if (!reachableUsers.has(n)) toExplore.push(n);
      });
      depth++;
    }

    const neighbors = await this.getConnectedUsers(userId);
    let triangles = 0;
    const possibleTriangles = (neighbors.length * (neighbors.length - 1)) / 2;

    for (let i = 0; i < neighbors.length; i++) {
      for (let j = i + 1; j < neighbors.length; j++) {
        const areConnected = await this.hasDirectConnection(neighbors[i], neighbors[j]);
        if (areConnected) triangles++;
      }
    }

    const clusteringCoefficient =
      possibleTriangles > 0 ? triangles / possibleTriangles : 0;

    return {
      outgoingLinks: outgoing?.length || 0,
      incomingLinks: incoming?.length || 0,
      uniqueConnections: uniqueConnections.size,
      avgHopDistance: Math.round(avgHopDistance * 10) / 10,
      networkReach: reachableUsers.size - 1,
      clusteringCoefficient: Math.round(clusteringCoefficient * 100) / 100,
    };
  }

  static async detectPatterns(userId: string): Promise<{
    hasReciprocal: boolean;
    reciprocalCount: number;
    hasCluster: boolean;
    clusterSize: number;
    warnings: string[];
  }> {
    const warnings: string[] = [];
    let reciprocalCount = 0;

    const { data: outgoing } = await supabaseAdmin
      .from("exchange_link_graph")
      .select("target_user_id")
      .eq("source_user_id", userId)
      .eq("is_live", true);

    for (const link of outgoing || []) {
      const hasReverse = await this.hasDirectConnection(link.target_user_id, userId);
      if (hasReverse) {
        reciprocalCount++;
      }
    }

    if (reciprocalCount > 0) {
      warnings.push(`${reciprocalCount} reciprocal link(s) detected - potential footprint`);
    }

    const neighbors = await this.getConnectedUsers(userId);
    let clusterConnections = 0;

    for (let i = 0; i < neighbors.length; i++) {
      for (let j = i + 1; j < neighbors.length; j++) {
        const areConnected = await this.hasDirectConnection(neighbors[i], neighbors[j]);
        if (areConnected) clusterConnections++;
      }
    }

    const hasCluster = clusterConnections > neighbors.length;
    if (hasCluster) {
      warnings.push("Tight cluster detected - links may appear coordinated");
    }

    return {
      hasReciprocal: reciprocalCount > 0,
      reciprocalCount,
      hasCluster,
      clusterSize: clusterConnections,
      warnings,
    };
  }
}
