import { Injectable } from '@angular/core';
import { Point } from '../../models/animation.constants';

/**
 * Service for calculating particle physics forces.
 * Uses pure functions where possible for better testability and performance.
 */
@Injectable({
  providedIn: 'root'
})
export class ParticlePhysicsService {

  /**
   * Compute a fluctuating strength between min and max using a smooth sinusoidal function.
   * periodSeconds controls the oscillation period (5-10 seconds for one full cycle).
   */
  public computeFluctuatingStrength(minStrength: number, maxStrength: number, periodSeconds: number, timeMs: number): number {
    const clampedPeriod = Math.max(1.0, Math.min(30.0, periodSeconds)); // Clamp to reasonable range
    const angularFreq = (2 * Math.PI) / clampedPeriod; // Convert period to angular frequency
    const t = (timeMs / 1000) * angularFreq; // Time in radians
    const wave = (Math.sin(t) + 1) / 2; // [0,1] smooth oscillation
    return minStrength + wave * (maxStrength - minStrength);
  }

  /**
   * Applies a spring-like force that tries to keep particles around a target spacing.
   * Helpful for maintaining polygonal structures without collapsing into clusters.
   */
  public applyPolygonStabilizer(
    point: Point,
    otherPoint: Point,
    distance: number,
    targetSpacing: number,
    strength: number
  ): void {
    if (distance <= 0) {
      return;
    }

    const dx = otherPoint.x - point.x;
    const dy = otherPoint.y - point.y;
    const dirX = dx / distance;
    const dirY = dy / distance;

    const normalizedDelta = (distance - targetSpacing) / Math.max(1, targetSpacing);
    // Clamp to avoid extreme forces
    const clampedDelta = Math.max(-2, Math.min(2, normalizedDelta));
    const force = clampedDelta * strength;

    point.vx += dirX * force;
    point.vy += dirY * force;
    otherPoint.vx -= dirX * force;
    otherPoint.vy -= dirY * force;
  }

  /**
   * Magnetic force variant where force grows as distance increases (within radius),
   * capped between minStrength and maxStrength and controlled by a coefficient.
   * coefficient > 1 biases force to grow more with distance; < 1 more linear.
   */
  public applyMagneticForceInverse(
    point: Point,
    otherPoint: Point,
    distance: number,
    magneticRadius: number,
    minStrength: number,
    maxStrength: number,
    coefficient: number
  ): void {
    if (distance <= 0 || distance >= magneticRadius) {
      return;
    }
    const normalized = Math.pow(distance / magneticRadius, Math.max(0.01, coefficient));
    const strength = Math.min(maxStrength, Math.max(minStrength, normalized * (maxStrength - minStrength) + minStrength));

    const dx = otherPoint.x - point.x;
    const dy = otherPoint.y - point.y;
    const dirX = dx / distance;
    const dirY = dy / distance;

    point.vx += dirX * strength;
    point.vy += dirY * strength;
    otherPoint.vx -= dirX * strength;
    otherPoint.vy -= dirY * strength;
  }

  /**
   * Applies repulsion force between two particles when they are very close.
   * Prevents particles from sticking together permanently.
   * 
   * @param point - First particle
   * @param otherPoint - Second particle
   * @param distance - Pre-calculated distance between particles (optimization)
   * @param repulsionRadius - Maximum distance for repulsion to take effect
   * @param repulsionStrength - Strength multiplier for the repulsion force
   */
  public applyRepulsionForce(
    point: Point,
    otherPoint: Point,
    distance: number,
    repulsionRadius: number,
    repulsionStrength: number
  ): void {
    // Early exit if distance is zero or outside repulsion range
    if (distance <= 0 || distance >= repulsionRadius) {
      return;
    }

    // Calculate repulsion force (stronger when closer)
    const force = (1 - distance / repulsionRadius) * repulsionStrength;
    
    // Calculate direction vector (normalized)
    const dx = otherPoint.x - point.x;
    const dy = otherPoint.y - point.y;
    const dirX = dx / distance;
    const dirY = dy / distance;

    // Apply force in opposite directions (push apart)
    point.vx -= dirX * force;
    point.vy -= dirY * force;
    otherPoint.vx += dirX * force;
    otherPoint.vy += dirY * force;
  }

  /**
   * Applies magnetic attraction force between two particles at medium distance.
   * Creates natural clustering and triangle formations.
   * 
   * @param point - First particle
   * @param otherPoint - Second particle
   * @param distance - Pre-calculated distance between particles
   * @param magneticRadius - Maximum distance for magnetic attraction
   * @param magneticStrength - Strength multiplier for the magnetic force
   */
  public applyMagneticForce(
    point: Point,
    otherPoint: Point,
    distance: number,
    magneticRadius: number,
    magneticStrength: number
  ): void {
    // Early exit if outside magnetic range or distance is zero
    if (distance <= 0 || distance >= magneticRadius) {
      return;
    }

    // Calculate magnetic force (stronger when closer)
    const force = (1 - distance / magneticRadius) * magneticStrength;
    
    // Calculate direction vector (normalized)
    const dx = otherPoint.x - point.x;
    const dy = otherPoint.y - point.y;
    const dirX = dx / distance;
    const dirY = dy / distance;

    // Apply force in same directions (pull together)
    point.vx += dirX * force;
    point.vy += dirY * force;
    otherPoint.vx -= dirX * force;
    otherPoint.vy -= dirY * force;
  }

  /**
   * Applies velocity damping to a particle, gradually reducing its speed.
   * Creates smoother, more natural motion and prevents runaway velocities.
   * 
   * @param point - Particle to apply damping to
   * @param dampingFactor - Factor to multiply velocity by (e.g., 0.98 = 2% reduction per frame)
   */
  public applyDamping(point: Point, dampingFactor: number): void {
    point.vx *= dampingFactor;
    point.vy *= dampingFactor;
  }

  /**
   * Applies random Brownian motion to a particle.
   * Adds small random forces to prevent particles from settling into stable configurations.
   * 
   * @param point - Particle to apply Brownian motion to
   * @param strength - Strength of the random forces
   */
  public applyBrownianMotion(point: Point, strength: number): void {
    // Add random force in range [-strength/2, +strength/2]
    point.vx += (Math.random() - 0.5) * strength;
    point.vy += (Math.random() - 0.5) * strength;
  }

  /**
   * Detects and breaks up particle clusters that are too dense.
   * Applies explosive outward forces to disperse stuck particles.
   * 
   * @param points - Array of all particles
   * @param clusterThreshold - Maximum distance to consider particles as part of same cluster
   * @param explosionForce - Strength of the explosive force applied
   * @param minClusterSize - Minimum number of nearby particles to trigger explosion
   * @returns Number of particles that were in clusters and received explosive force
   */
  public breakUpClusters(
    points: Point[],
    clusterThreshold: number,
    explosionForce: number,
    minClusterSize: number = 4
  ): number {
    let clusteredCount = 0;

    // Optimization: Cache point count to avoid repeated array access
    const pointCount = points.length;

    for (let i = 0; i < pointCount; i++) {
      const point = points[i];
      let nearbyCount = 0;

      // Count nearby particles
      for (let j = 0; j < pointCount; j++) {
        if (i === j) continue;

        const other = points[j];
        const dx = other.x - point.x;
        const dy = other.y - point.y;
        const distance = Math.hypot(dx, dy);

        if (distance < clusterThreshold) {
          nearbyCount++;
        }
      }

      // If particle is in a dense cluster
      if (nearbyCount >= minClusterSize) {
        // Apply random outward explosion force
        // Cap the force per frame to make explosion gradual and visible (not instant teleportation)
        const maxForcePerFrame = 15; // Maximum velocity change per frame for smooth explosion
        const angle = Math.random() * Math.PI * 2;
        const forceX = Math.cos(angle) * explosionForce;
        const forceY = Math.sin(angle) * explosionForce;
        
        // Apply force gradually over multiple frames by capping the magnitude
        const forceMagnitude = Math.hypot(forceX, forceY);
        if (forceMagnitude > maxForcePerFrame) {
          const scale = maxForcePerFrame / forceMagnitude;
          point.vx += forceX * scale;
          point.vy += forceY * scale;
        } else {
          point.vx += forceX;
          point.vy += forceY;
        }
        clusteredCount++;
      }
    }

    return clusteredCount;
  }

  /**
   * Calculates distance between two points.
   * Using Math.hypot for accuracy and performance (browser-optimized).
   * 
   * @param point1 - First point
   * @param point2 - Second point
   * @returns Euclidean distance between the points
   */
  public getDistance(point1: Point, point2: Point): number {
    return Math.hypot(point2.x - point1.x, point2.y - point1.y);
  }

  /**
   * Ensures a particle maintains minimum and maximum speed limits.
   * If below minimum, gives random direction at minimum speed.
   * If above maximum, scales velocity down proportionally.
   * 
   * @param point - Particle to constrain
   * @param minSpeed - Minimum allowed speed
   * @param maxSpeed - Maximum allowed speed
   */
  public constrainSpeed(point: Point, minSpeed: number, maxSpeed: number): void {
    const speed = Math.hypot(point.vx, point.vy);

    if (speed < minSpeed) {
      if (speed < 0.01) {
        // Particle is essentially stopped - give it a new random direction at min speed
        const angle = Math.random() * Math.PI * 2;
        point.vx = Math.cos(angle) * minSpeed;
        point.vy = Math.sin(angle) * minSpeed;
      } else {
        // Particle is moving but too slow - boost it to minimum speed while preserving direction
        const scale = minSpeed / speed;
        point.vx *= scale;
        point.vy *= scale;
        
        // Add a small random perturbation to help break out of equilibrium states
        const perturbation = minSpeed * 0.1; // 10% of min speed
        point.vx += (Math.random() - 0.5) * perturbation;
        point.vy += (Math.random() - 0.5) * perturbation;
      }
    } else if (speed > maxSpeed) {
      // Scale down to maximum speed
      const scale = maxSpeed / speed;
      point.vx *= scale;
      point.vy *= scale;
    }
  }
}

