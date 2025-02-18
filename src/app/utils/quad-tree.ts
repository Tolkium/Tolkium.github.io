// utils/quad-tree.ts
import { Point } from '../models/point.model';

interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class QuadTree {
  private points: Point[] = [];
  private divided = false;
  private northeast?: QuadTree;
  private northwest?: QuadTree;
  private southeast?: QuadTree;
  private southwest?: QuadTree;
  private readonly capacity = 4;

  constructor(private bounds: Bounds) {}

  public insert(point: Point): boolean {
    if (!this.contains(point)) {
      return false;
    }

    if (this.points.length < this.capacity) {
      this.points.push(point);
      return true;
    }

    if (!this.divided) {
      this.subdivide();
    }

    return this.northeast!.insert(point) ||
           this.northwest!.insert(point) ||
           this.southeast!.insert(point) ||
           this.southwest!.insert(point);
  }

  public query(range: Bounds): Point[] {
    const found: Point[] = [];

    if (!this.intersects(range)) {
      return found;
    }

    for (const point of this.points) {
      if (this.pointInRange(point, range)) {
        found.push(point);
      }
    }

    if (this.divided) {
      found.push(
        ...this.northeast!.query(range),
        ...this.northwest!.query(range),
        ...this.southeast!.query(range),
        ...this.southwest!.query(range)
      );
    }

    return found;
  }

  private subdivide(): void {
    const x = this.bounds.x;
    const y = this.bounds.y;
    const w = this.bounds.width / 2;
    const h = this.bounds.height / 2;

    this.northeast = new QuadTree({ x: x + w, y, width: w, height: h });
    this.northwest = new QuadTree({ x, y, width: w, height: h });
    this.southeast = new QuadTree({ x: x + w, y: y + h, width: w, height: h });
    this.southwest = new QuadTree({ x, y: y + h, width: w, height: h });

    this.divided = true;
  }

  private contains(point: Point): boolean {
    return point.x >= this.bounds.x &&
           point.x <= this.bounds.x + this.bounds.width &&
           point.y >= this.bounds.y &&
           point.y <= this.bounds.y + this.bounds.height;
  }

  private intersects(range: Bounds): boolean {
    return !(range.x > this.bounds.x + this.bounds.width ||
             range.x + range.width < this.bounds.x ||
             range.y > this.bounds.y + this.bounds.height ||
             range.y + range.height < this.bounds.y);
  }

  private pointInRange(point: Point, range: Bounds): boolean {
    return point.x >= range.x &&
           point.x <= range.x + range.width &&
           point.y >= range.y &&
           point.y <= range.y + range.height;
  }
}
