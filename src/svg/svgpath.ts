import { SvgPoint, SvgStrokeDash, SvgTransform, SvgTransformExclude, SvgTransformResidual } from './@types/object';

import SvgBaseVal$MX from './svgbaseval-mx';
import SvgPaint$MX from './svgpaint-mx';
import SvgBuild from './svgbuild';
import SvgElement from './svgelement';

import { INSTANCE_TYPE, REGION_UNIT } from './lib/constant';
import { SVG, TRANSFORM } from './lib/util';

type SvgAnimation = squared.svg.SvgAnimation;
type SvgContainer = squared.svg.SvgContainer;
type SvgShapePattern = squared.svg.SvgShapePattern;

const $util = squared.lib.util;

export default class SvgPath extends SvgPaint$MX(SvgBaseVal$MX(SvgElement)) implements squared.svg.SvgPath {
    public static build(path: SvgPath, transforms: SvgTransform[], exclude?: SvgTransformExclude, residual?: SvgTransformResidual, precision?: number) {
        if (exclude && exclude[path.element.tagName]) {
            transforms = SvgBuild.filterTransforms(transforms, exclude[path.element.tagName]);
        }
        path.draw(transforms, residual, precision);
        return path;
    }

    public name = '';
    public value = '';
    public pathLength!: string;
    public transformed: SvgTransform[] | null = null;
    public transformResidual?: SvgTransform[][];

    private _totalLength = 0;
    private _transforms?: SvgTransform[];

    constructor(public readonly element: SVGGraphicsElement) {
        super(element);
        this.init();
    }

    public draw(transforms?: SvgTransform[], residual?: SvgTransformResidual, precision?: number, extract = false) {
        if (!extract) {
            this.transformed = null;
        }
        const element = this.element;
        const parent = <SvgContainer> this.parent;
        const patternParent = <SvgShapePattern> this.patternParent;
        const requireRefit = !!parent && parent.requireRefit();
        const requirePatternRefit = !!patternParent && patternParent.patternContentUnits === REGION_UNIT.OBJECT_BOUNDING_BOX;
        let d: string;
        if (SVG.path(element)) {
            d = this.getBaseValue('d');
            if (transforms && transforms.length || requireRefit || requirePatternRefit) {
                const commands = SvgBuild.getPathCommands(d);
                if (commands.length) {
                    let points = SvgBuild.getPathPoints(commands);
                    if (points.length) {
                        if (requirePatternRefit) {
                            patternParent.patternRefitPoints(points);
                        }
                        if (transforms && transforms.length) {
                            if (typeof residual === 'function') {
                                [this.transformResidual, transforms] = residual.call(this, element, transforms);
                            }
                            if (transforms.length) {
                                points = SvgBuild.applyTransforms(transforms, points, TRANSFORM.origin(this.element));
                                this.transformed = transforms;
                            }
                        }
                        if (requireRefit) {
                            parent.refitPoints(points);
                        }
                        d = SvgBuild.drawPath(SvgBuild.bindPathPoints(commands, points), precision);
                    }
                }
            }
        }
        else if (SVG.line(element)) {
            let points: SvgPoint[] = [
                { x: this.getBaseValue('x1'), y: this.getBaseValue('y1') },
                { x: this.getBaseValue('x2'), y: this.getBaseValue('y2') }
            ];
            if (requirePatternRefit) {
                patternParent.patternRefitPoints(points);
            }
            if (transforms && transforms.length) {
                if (typeof residual === 'function') {
                    [this.transformResidual, transforms] = residual.call(this, element, transforms);
                }
                if (transforms.length) {
                    points = SvgBuild.applyTransforms(transforms, points, TRANSFORM.origin(this.element));
                    this.transformed = transforms;
                }
            }
            if (requireRefit) {
                parent.refitPoints(points);
            }
            d = SvgBuild.drawPolyline(points, precision);
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
            if (requirePatternRefit) {
                patternParent.patternRefitPoints(points);
            }
            if (transforms && transforms.length) {
                if (typeof residual === 'function') {
                    [this.transformResidual, transforms] = residual.call(this, element, transforms, rx, ry);
                }
                if (transforms.length) {
                    points = SvgBuild.applyTransforms(transforms, points, TRANSFORM.origin(this.element));
                    this.transformed = transforms;
                }
            }
            if (requireRefit) {
                parent.refitPoints(points);
            }
            const pt = <Required<SvgPoint>> points[0];
            d = SvgBuild.drawEllipse(pt.x, pt.y, pt.rx, pt.ry, precision);
        }
        else if (SVG.rect(element)) {
            let x = this.getBaseValue('x');
            let y = this.getBaseValue('y');
            let width = this.getBaseValue('width');
            let height = this.getBaseValue('height');
            if (transforms && transforms.length) {
                let points: SvgPoint[] = [
                    { x, y },
                    { x: x + width, y },
                    { x: x + width, y: y + height },
                    { x, y: y + height }
                ];
                if (requirePatternRefit) {
                    patternParent.patternRefitPoints(points);
                }
                if (typeof residual === 'function') {
                    [this.transformResidual, transforms] = residual.call(this, element, transforms);
                }
                if (transforms.length) {
                    points = SvgBuild.applyTransforms(transforms, points, TRANSFORM.origin(this.element));
                    this.transformed = transforms;
                }
                if (requireRefit) {
                    parent.refitPoints(points);
                }
                d = SvgBuild.drawPolygon(points, precision);
            }
            else {
                if (requirePatternRefit) {
                    x = patternParent.patternRefitX(x);
                    y = patternParent.patternRefitY(y);
                    width = patternParent.patternRefitX(width);
                    height = patternParent.patternRefitY(height);
                }
                if (requireRefit) {
                    x = parent.refitX(x);
                    y = parent.refitY(y);
                    width = parent.refitSize(width);
                    height = parent.refitSize(height);
                }
                d = SvgBuild.drawRect(width, height, x, y, precision);
            }
        }
        else if (SVG.polygon(element) || SVG.polyline(element)) {
            let points: SvgPoint[] = this.getBaseValue('points');
            if (requirePatternRefit) {
                patternParent.patternRefitPoints(points);
            }
            if (transforms && transforms.length) {
                if (typeof residual === 'function') {
                    [this.transformResidual, transforms] = residual.call(this, element, transforms);
                }
                if (transforms.length) {
                    points = SvgBuild.applyTransforms(transforms, points, TRANSFORM.origin(this.element));
                    this.transformed = transforms;
                }
            }
            if (requireRefit) {
                if (this.transformed === null) {
                    points = SvgBuild.clonePoints(points);
                }
                parent.refitPoints(points);
            }
            d = SVG.polygon(element) ? SvgBuild.drawPolygon(points, precision) : SvgBuild.drawPolyline(points, precision);
        }
        else {
            d = '';
        }
        if (!extract) {
            this.value = d;
            this._totalLength = 0;
            this.setPaint([d], precision);
        }
        return d;
    }

    public drawStrokeDash(animations?: SvgAnimation[]) {
        const dashArray = $util.convertInt(this.strokeDasharray);
        if (dashArray > 0) {
            const dashOffset = $util.convertInt(this.strokeDashoffset);
            const totalLength = this.totalLength;
            const pathLength = $util.convertInt(this.pathLength) || totalLength;
            const result = this.getStrokeDash(dashArray, dashOffset, pathLength);
            if (animations) {
                const dashTotal = Math.ceil(totalLength / (dashArray * 2));
                for (const item of animations) {
                    if (SvgBuild.asAnimate(item) && item.attributeName === 'stroke-dashoffset' && item.valueTo !== '') {
                        const valueTo = parseFloat(item.valueTo);
                        const valueFrom = item.valueFrom !== '' ? parseFloat(item.valueFrom) : dashOffset;
                        const offsetValue = valueTo - valueFrom;
                        const offsetLength = Math.abs(offsetValue / totalLength);
                        let iterationCount = (dashTotal / result.length) * offsetLength;
                        if (offsetLength % 1 === 0 || offsetValue % pathLength === 0) {
                            iterationCount = Math.ceil(iterationCount);
                        }
                        const keyTimeInterval = iterationCount > 1 ? item.duration / (iterationCount * item.duration) : 1;
                        const values: string[] = [];
                        const keyTimes: number[] = [];
                        let keyTime = 0;
                        for (let i = iterationCount; i > 0; i--) {
                            keyTimes.push(keyTime + (keyTime !== 0 ? 1 / item.duration : 0));
                            if (i >= 1) {
                                if (valueTo < valueFrom) {
                                    values.push('0', '1');
                                }
                                else {
                                    values.push('1', '0');
                                }
                                keyTime += keyTimeInterval;
                            }
                            else {
                                if (valueTo < valueFrom) {
                                    values.push('0', i.toString());
                                }
                                else {
                                    values.push('1', (1 - i).toString());
                                }
                                keyTime = 1;
                            }
                            keyTimes.push(keyTime);
                        }
                        item.values = values;
                        item.keyTimes = keyTimes;
                        if (keyTimes.length === 2 && item.keySplines && item.keySplines.length >= 1) {
                            item.keySplines.length = 1;
                        }
                        else {
                            item.keySplines = undefined;
                        }
                    }
                }
            }
            return result;
        }
        return undefined;
    }

    public getStrokeDash(value: number, offset: number, totalLength: number) {
        const result: SvgStrokeDash[] = [];
        let actualLength: number;
        if (offset < 0 && Math.abs(offset) >= totalLength) {
            actualLength = Math.abs(offset) + Math.ceil(totalLength / value) * value;
        }
        else {
            actualLength = totalLength;
        }
        let previousEnd: number | undefined;
        for (let i = -offset, j = 0; i <= actualLength; i += value, j++) {
            if (i + value >= 0 && j % 2 === 0) {
                const startOffset = i % value;
                let start = startOffset / totalLength;
                if (Math.abs(start) === 0) {
                    start = 0;
                }
                let end: number;
                if (previousEnd !== undefined) {
                    const length = value / totalLength;
                    start = previousEnd + length;
                    if (start >= 1) {
                        break;
                    }
                    else {
                        end = Math.min(start + length, 1);
                    }
                }
                else {
                    const reverse = Math.floor(i / value) % 2 === 1;
                    if (i < 0 && start === 0) {
                        start = 1;
                        end = 0;
                    }
                    else if (start === 1) {
                        if (reverse) {
                            start = 0;
                            end = 1;
                        }
                        else {
                            end = 0;
                        }
                    }
                    else {
                        if (start > 1) {
                            if (Math.floor(start) % 2 === 1) {
                                start = 1;
                            }
                            else {
                                start %= 1;
                            }
                        }
                        end = Math.min(start + (value / totalLength), 1);
                        if (start < 0 && end >= 0) {
                            start = 0;
                        }
                        else if (reverse && actualLength !== totalLength)  {
                            if (start === 0) {
                                start = 1;
                                end = 0;
                            }
                            else {
                                end = Math.min(start, 1);
                                start = 0;
                            }
                        }
                    }
                }
                if (!(start >= 0.999 && end >= 0.999)) {
                    result.push({ start, end });
                }
                previousEnd = end;
            }
        }
        if (result.length === 0) {
            result.push({ start: 1, end: 0 });
        }
        return result;
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
        this.setAttribute('pathLength');
    }

    get transforms() {
        if (this._transforms === undefined) {
            this._transforms = SvgBuild.filterTransforms(TRANSFORM.parse(this.element) || SvgBuild.convertTransforms(this.element.transform.baseVal));
        }
        return this._transforms;
    }

    get totalLength() {
        if (this.value !== '' && this._totalLength === 0) {
            let element: SVGPathElement;
            if (SVG.path(this.element)) {
                element = this.element;
            }
            else {
                element = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                element.setAttribute('d', this.value);
            }
            this._totalLength = element.getTotalLength();
        }
        return this._totalLength;
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG_PATH;
    }
}