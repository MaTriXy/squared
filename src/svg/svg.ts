import { SvgGradient, SvgTransformExclude, SvgTransformResidual } from './@types/object';

import SvgBaseVal$MX from './svgbaseval-mx';
import SvgSynchronize$MX from './svgsynchronize-mx';
import SvgView$MX from './svgview-mx';
import SvgViewRect$MX from './svgviewrect-mx';
import SvgContainer from './svgcontainer';

import { INSTANCE_TYPE } from './lib/constant';
import { SVG, getTargetElement } from './lib/util';

const $color = squared.lib.color;
const $dom = squared.lib.dom;
const $util = squared.lib.util;

function getColorStop(element: SVGGradientElement) {
    const result: ColorStop[] = [];
    const stops = element.getElementsByTagName('stop');
    for (let i = 0; i < stops.length; i++) {
        const color = $color.parseRGBA($dom.cssAttribute(stops[i], 'stop-color'), $dom.cssAttribute(stops[i], 'stop-opacity'));
        if (color) {
            result.push({
                color: color.valueRGBA,
                offset: $dom.cssAttribute(stops[i], 'offset'),
                opacity: color.alpha
            });
        }
    }
    return result;
}

function getBaseValue(element: SVGElement, ...attrs: string[]) {
    const result: ObjectMap<string | number> = {};
    for (const attr of attrs) {
        if (element[attr] && element[attr].baseVal) {
            result[attr] = element[attr].baseVal.value;
            result[`${attr}AsString`] = element[attr].baseVal.valueAsString;
        }
    }
    return result;
}

export default class Svg extends SvgSynchronize$MX(SvgViewRect$MX(SvgBaseVal$MX(SvgView$MX(SvgContainer)))) implements squared.svg.Svg {
    public readonly definitions = {
        clipPath: new Map<string, SVGClipPathElement>(),
        pattern: new Map<string, SVGPatternElement>(),
        gradient: new Map<string, SvgGradient>()
    };
    public precision?: number;

    constructor(
        public readonly element: SVGSVGElement,
        public readonly documentRoot = true)
    {
        super(element);
        this.init();
    }

    public build(exclude?: SvgTransformExclude, residual?: SvgTransformResidual, precision?: number) {
        this.precision = precision;
        this.setRect();
        super.build(exclude, residual, precision);
    }

    public synchronize(keyTimeMode = 0, precision?: number) {
        if (!this.documentRoot && this.animations.length) {
            this.mergeAnimations(this.getAnimateViewRect(), this.getAnimateTransform(), keyTimeMode, precision);
        }
        super.synchronize(keyTimeMode, precision);
    }

    private init() {
        if (this.documentRoot) {
            $util.cloneObject(this.element.viewBox.baseVal, this.aspectRatio);
            this.element.querySelectorAll('set, animate, animateTransform, animateMotion').forEach((element: SVGAnimationElement) => {
                const target = getTargetElement(element, this.element);
                if (target) {
                    if (element.parentElement) {
                        element.parentElement.removeChild(element);
                    }
                    target.appendChild(element);
                }
            });
        }
        this.setDefinitions(this.element);
        this.element.querySelectorAll('defs').forEach(element => this.setDefinitions(element));
    }

    private setDefinitions(item: SVGElement) {
        item.querySelectorAll('clipPath, pattern, linearGradient, radialGradient').forEach((element: SVGElement) => {
            if (element.id) {
                const id = `#${element.id}`;
                if (SVG.clipPath(element)) {
                    this.definitions.clipPath.set(id, element);
                }
                else if (SVG.pattern(element)) {
                    this.definitions.pattern.set(id, element);
                }
                else if (SVG.linearGradient(element)) {
                    this.definitions.gradient.set(id, {
                        type: 'linear',
                        element,
                        spreadMethod: element.spreadMethod.baseVal,
                        colorStops: getColorStop(element),
                        ...getBaseValue(element, 'x1', 'x2', 'y1', 'y2')
                    });
                }
                else if (SVG.radialGradient(element)) {
                    this.definitions.gradient.set(id, {
                        type: 'radial',
                        element,
                        spreadMethod: element.spreadMethod.baseVal,
                        colorStops: getColorStop(element),
                        ...getBaseValue(element, 'cx', 'cy', 'r', 'fx', 'fy', 'fr')
                    });
                }
            }
        });
    }

    get viewBox() {
        return this.element.viewBox.baseVal || $dom.getDOMRect(this.element);
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG;
    }
}