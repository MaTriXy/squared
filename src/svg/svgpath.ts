import { SvgPoint, SvgTransform, SvgTransformExclusions, SvgTransformResidual } from './@types/object';

import SvgBaseVal$MX from './svgbaseval-mx';
import SvgPaint$MX from './svgpaint-mx';
import SvgElement from './svgelement';
import SvgBuild from './svgbuild';

import { INSTANCE_TYPE } from './lib/constant';
import { SVG, TRANSFORM } from './lib/util';

type SvgContainer = squared.svg.SvgContainer;

export default class SvgPath extends SvgPaint$MX(SvgBaseVal$MX(SvgElement)) implements squared.svg.SvgPath {
    public static build(path: SvgPath, transform: SvgTransform[], exclusions?: SvgTransformExclusions, residual?: SvgTransformResidual) {
        path.draw(SvgBuild.filterTransforms(transform, exclusions && exclusions[path.element.tagName]), residual);
        return path;
    }

    public static getCenter(values: SvgPoint[]): SvgPoint {
        let minX = values[0].x;
        let minY = values[0].y;
        let maxX = minX;
        let maxY = minY;
        for (let i = 1; i < values.length; i++) {
            const pt = values[i];
            if (pt.x < minX) {
                minX = pt.x;
            }
            else if (pt.x > maxX) {
                maxX = pt.x;
            }
            if (pt.y < minY) {
                minY = pt.y;
            }
            else if (pt.y > maxX) {
                maxY = pt.y;
            }
        }
        return {
            x: (minX + maxX) / 2,
            y: (minY + maxY) / 2
        };
    }

    public name = '';
    public value = '';
    public transformed: SvgTransform[] | null = null;
    public transformResidual?: SvgTransform[][];

    private _transform?: SvgTransform[];

    constructor(public readonly element: SVGGraphicsElement) {
        super(element);
        this.init();
    }

    public draw(transform?: SvgTransform[], residual?: SvgTransformResidual, extract = false) {
        if (!extract) {
            this.transformed = null;
        }
        const parent = <SvgContainer> this.parent;
        const element = this.element;
        const requireRefit = !!parent && parent.requireRefit();
        let d = '';
        if (SVG.path(element)) {
            d = this.getBaseValue('d');
            if (transform && transform.length || requireRefit) {
                const commands = SvgBuild.getPathCommands(d);
                if (commands.length) {
                    let points = SvgBuild.getPathPoints(commands);
                    if (points.length) {
                        if (transform && transform.length) {
                            if (typeof residual === 'function') {
                                [this.transformResidual, transform] = residual.call(this, element, transform);
                            }
                            if (transform.length) {
                                points = this.transformPoints(transform, points);
                                this.transformed = transform;
                            }
                        }
                        if (requireRefit) {
                            parent.refitPoints(points);
                        }
                        d = SvgBuild.drawPath(SvgBuild.setPathPoints(commands, points));
                    }
                }
            }
        }
        else if (SVG.line(element)) {
            let points: SvgPoint[] = [
                { x: this.getBaseValue('x1'), y: this.getBaseValue('y1') },
                { x: this.getBaseValue('x2'), y: this.getBaseValue('y2') }
            ];
            if (transform && transform.length) {
                if (typeof residual === 'function') {
                    [this.transformResidual, transform] = residual.call(this, element, transform);
                }
                if (transform.length) {
                    points = this.transformPoints(transform, points);
                    this.transformed = transform;
                }
            }
            if (requireRefit) {
                parent.refitPoints(points);
            }
            d = SvgBuild.drawPolyline(points);
        }
        else if (SVG.circle(element) || SVG.ellipse(element)) {
            let rx: number;
            let ry: number;
            if (SVG.ellipse(element)) {
                rx = this.getBaseValue('rx');
                ry = this.getBaseValue('ry');
            }
            else {
                rx = this.getBaseValue('r');
                ry = rx;
            }
            let points: SvgPoint[] = [
                { x: this.getBaseValue('cx'), y: this.getBaseValue('cy'), rx, ry }
            ];
            if (transform && transform.length) {
                if (typeof residual === 'function') {
                    [this.transformResidual, transform] = residual.call(this, element, transform, rx, ry);
                }
                if (transform.length) {
                    points = this.transformPoints(transform, points);
                    this.transformed = transform;
                }
            }
            if (requireRefit) {
                parent.refitPoints(points);
            }
            const pt = <Required<SvgPoint>> points[0];
            d = SvgBuild.drawEllipse(pt.x, pt.y, pt.rx, pt.ry);
        }
        else if (SVG.rect(element)) {
            let x = this.getBaseValue('x');
            let y = this.getBaseValue('y');
            let width = this.getBaseValue('width');
            let height = this.getBaseValue('height');
            if (transform && transform.length) {
                let points: SvgPoint[] = [
                    { x, y },
                    { x: x + width, y },
                    { x: x + width, y: y + height },
                    { x, y: y + height }
                ];
                if (typeof residual === 'function') {
                    [this.transformResidual, transform] = residual.call(this, element, transform);
                }
                if (transform.length) {
                    points = this.transformPoints(transform, points);
                    this.transformed = transform;
                }
                if (requireRefit) {
                    parent.refitPoints(points);
                }
                d = SvgBuild.drawPolygon(points);
            }
            else {
                if (requireRefit) {
                    x = parent.refitX(x);
                    y = parent.refitY(y);
                    width = parent.refitSize(width);
                    height = parent.refitSize(height);
                }
                d = SvgBuild.drawRect(width, height, x, y);
            }
        }
        else if (SVG.polygon(element) || SVG.polyline(element)) {
            let points: SvgPoint[] = this.getBaseValue('points');
            if (transform && transform.length) {
                if (typeof residual === 'function') {
                    [this.transformResidual, transform] = residual.call(this, element, transform);
                }
                if (transform.length) {
                    points = this.transformPoints(transform, points);
                    this.transformed = transform;
                }
            }
            if (requireRefit) {
                if (this.transformed === null) {
                    points = SvgBuild.clonePoints(points);
                }
                parent.refitPoints(points);
            }
            d = element.tagName === 'polygon' ? SvgBuild.drawPolygon(points) : SvgBuild.drawPolyline(points);
        }
        if (!extract) {
            this.value = d;
            this.setPaint([d]);
        }
        return d;
    }

    public transformPoints(transform: SvgTransform[], points: Point[], center?: Point) {
        return SvgBuild.applyTransforms(transform, points, TRANSFORM.origin(this.element), center);
    }

    private init() {
        const element = this.element;
        if (SVG.path(element)) {
            this.setBaseValue('d');
        }
        else if (SVG.line(element)) {
            this.setBaseValue('x1');
            this.setBaseValue('y1');
            this.setBaseValue('x2');
            this.setBaseValue('y2');
        }
        else if (SVG.rect(element)) {
            this.setBaseValue('x');
            this.setBaseValue('y');
            this.setBaseValue('width');
            this.setBaseValue('height');
        }
        else if (SVG.circle(element)) {
            this.setBaseValue('cx');
            this.setBaseValue('cy');
            this.setBaseValue('r');
        }
        else if (SVG.ellipse(element)) {
            this.setBaseValue('cx');
            this.setBaseValue('cy');
            this.setBaseValue('rx');
            this.setBaseValue('ry');
        }
        else if (SVG.polygon(element) || SVG.polyline(element)) {
            this.setBaseValue('points', SvgBuild.clonePoints(element.points));
        }
    }

    get transform() {
        if (this._transform === undefined) {
            this._transform = TRANSFORM.parse(this.element) || SvgBuild.convertTransforms(this.element.transform.baseVal);
        }
        return this._transform;
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG_PATH;
    }
}