import { SvgBaseValue, SvgLinearGradient, SvgRadialGradient, SvgTransform } from './@types/object';

import SvgAnimation from './svganimation';
import SvgCreate from './svgcreate';
import SvgShape from './svgshape';
import SvgGroupPaint from './svggrouppaint';
import SvgGroupRect from './svggrouprect';
import SvgImage from './svgimage';

import { getHrefTargetElement, getTransform, isVisible, isSvgImage, isSvgShape, setVisible } from './lib/util';

const $dom = squared.lib.dom;
const $util = squared.lib.util;

export default class Svg extends squared.lib.base.Container<squared.svg.SvgView> implements squared.svg.Svg {
    public animate: SvgAnimation[];
    public baseValue: SvgBaseValue = {
        transformed: null
    };

    public readonly name: string;
    public readonly defs = {
        clipPath: new Map<string, SvgGroupPaint>(),
        gradient: new Map<string, Gradient>()
    };

    private _width: number | undefined;
    private _height: number | undefined;
    private _transform?: SvgTransform[];

    constructor(public readonly element: SVGSVGElement) {
        super();
        this.name = SvgCreate.setName(element);
        this.animate = SvgCreate.toAnimateList(element);
        this.init();
        this.setChildren();
    }

    public setChildren() {
        this.clear();
        const element = this.element;
        for (let i = 0; i < element.children.length; i++) {
            const item = element.children[i];
            if (item instanceof SVGGElement) {
                this.append(new SvgGroupPaint(item));
            }
            else if (item instanceof SVGSVGElement) {
                this.append(new SvgGroupRect(item));
            }
            else if (item instanceof SVGUseElement) {
                const use = SvgCreate.getUseTarget(item, true, element);
                if (use) {
                    this.append(use);
                }
            }
            else if (isSvgImage(item)) {
                this.append(new SvgImage(item));
            }
            else if (isSvgShape(item)) {
                this.append(new SvgShape(item));
            }
        }
    }

    private init() {
        const element = this.element;
        element.querySelectorAll('set, animate, animateTransform, animateMotion').forEach((svg: SVGAnimationElement) => {
            const href = svg.attributes.getNamedItem('href');
            if (href && href.value !== '') {
                const target = getHrefTargetElement(svg);
                if (svg.parentElement) {
                    svg.parentElement.removeChild(svg);
                }
                if (target) {
                    target.appendChild(svg);
                }
            }
        });
        element.querySelectorAll('clipPath, linearGradient, radialGradient').forEach((svg: SVGElement) => {
            if (svg.id) {
                const id = `#${svg.id}`;
                if (svg instanceof SVGClipPathElement) {
                    const group = new SvgGroupPaint(svg);
                    if (group.length) {
                        this.defs.clipPath.set(id, group);
                    }
                }
                else if (svg instanceof SVGLinearGradientElement) {
                    this.defs.gradient.set(id, <SvgLinearGradient> {
                        type: 'linear',
                        x1: svg.x1.baseVal.value,
                        x2: svg.x2.baseVal.value,
                        y1: svg.y1.baseVal.value,
                        y2: svg.y2.baseVal.value,
                        x1AsString: svg.x1.baseVal.valueAsString,
                        x2AsString: svg.x2.baseVal.valueAsString,
                        y1AsString: svg.y1.baseVal.valueAsString,
                        y2AsString: svg.y2.baseVal.valueAsString,
                        colorStop: SvgCreate.toColorStopList(svg)
                    });
                }
                else if (svg instanceof SVGRadialGradientElement) {
                    this.defs.gradient.set(id, <SvgRadialGradient> {
                        type: 'radial',
                        cx: svg.cx.baseVal.value,
                        cy: svg.cy.baseVal.value,
                        r: svg.r.baseVal.value,
                        cxAsString: svg.cx.baseVal.valueAsString,
                        cyAsString: svg.cy.baseVal.valueAsString,
                        rAsString: svg.r.baseVal.valueAsString,
                        fx: svg.fx.baseVal.value,
                        fy: svg.fy.baseVal.value,
                        fxAsString: svg.fx.baseVal.valueAsString,
                        fyAsString: svg.fy.baseVal.valueAsString,
                        colorStop: SvgCreate.toColorStopList(svg)
                    });
                }
            }
        });
    }

    set width(value) {
        if ($dom.isUserAgent($dom.USER_AGENT.FIREFOX)) {
            this._width = value;
        }
        else {
            this.element.width.baseVal.value = value;
        }
    }
    get width() {
        if ($dom.isUserAgent($dom.USER_AGENT.FIREFOX)) {
            if (this._width !== undefined) {
                return this._width;
            }
            else {
                const bounds = this.element.getBoundingClientRect();
                return bounds.width;
            }
        }
        else {
            return this.element.width.baseVal.value;
        }
    }

    set height(value) {
        if ($dom.isUserAgent($dom.USER_AGENT.FIREFOX)) {
            this._height = value;
        }
        else {
            this.element.height.baseVal.value = value;
        }
    }
    get height() {
        if ($dom.isUserAgent($dom.USER_AGENT.FIREFOX)) {
            if (this._height !== undefined) {
                return this._height;
            }
            else {
                const bounds = this.element.getBoundingClientRect();
                return bounds.height;
            }
        }
        else {
            return this.element.height.baseVal.value;
        }
    }

    get viewBox() {
        return this.element.viewBox.baseVal;
    }

    set opacity(value) {
        if ($util.isNumber(value)) {
            let opacity = parseFloat(value.toString());
            if (opacity <= 0) {
                opacity = 0;
            }
            else if (opacity >= 1) {
                opacity = 1;
            }
            this.element.style.opacity = opacity.toString();
            this.element.setAttribute('opacity', opacity.toString());
        }
    }
    get opacity() {
        return parseFloat($dom.cssAttribute(this.element, 'opacity'));
    }

    get transform() {
        if (this._transform === undefined) {
            this._transform = getTransform(this.element) || SvgCreate.toTransformList(this.element.transform.baseVal);
        }
        return this._transform;
    }

    set visible(value) {
        setVisible(this.element, value);
    }
    get visible() {
        return isVisible(this.element);
    }
}