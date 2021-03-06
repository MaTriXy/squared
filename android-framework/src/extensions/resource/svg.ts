import { TemplateData, TemplateDataA, TemplateDataAA, TemplateDataAAA } from '../../../../src/base/@types/application';
import { SvgMatrix, SvgPoint, SvgTransform } from '../../../../src/svg/@types/object';
import { ResourceStoredMapAndroid } from '../../@types/application';
import { ResourceSvgOptions } from '../../@types/extension';

import Resource from '../../resource';
import View from '../../view';

import { BUILD_ANDROID } from '../../lib/enumeration';
import { getXmlNs } from '../../lib/util';

import ANIMATEDVECTOR_TMPL from '../../template/resource/embedded/animated-vector';
import LAYERLIST_TMPL from '../../template/resource/embedded/layer-list';
import SETOBJECTANIMATOR_TMPL from '../../template/resource/embedded/set-objectanimator';
import VECTOR_TMPL from '../../template/resource/embedded/vector';

if (!squared.svg) {
    squared.svg = { lib: {} } as any;
}

import $Svg = squared.svg.Svg;
import $SvgAnimate = squared.svg.SvgAnimate;
import $SvgAnimateTransform = squared.svg.SvgAnimateTransform;
import $SvgBuild = squared.svg.SvgBuild;
import $SvgG = squared.svg.SvgG;
import $SvgShape = squared.svg.SvgShape;

type SvgAnimation = squared.svg.SvgAnimation;
type SvgGroup = squared.svg.SvgGroup;
type SvgImage = squared.svg.SvgImage;
type SvgPath = squared.svg.SvgPath;
type SvgView = squared.svg.SvgView;

interface AnimatedTargetData extends TemplateDataAA {
    name: string;
    animationName?: string;
}

interface SetOrdering {
    name?: string;
    ordering?: string;
}

interface GroupTemplateData extends TemplateDataAA {
    region: TransformData[][];
    clipRegion: StringMap[];
    path: TransformData[][];
    clipPath: StringMap[];
    BB: TemplateData[];
}

interface SetTemplateData extends SetOrdering, TemplateDataAA {
    AA: AnimatorTemplateData[];
    BB: TogetherTemplateData[];
}

interface AnimatorTemplateData extends SetOrdering, TemplateDataAAA {
    fillBefore: TemplateData[] | false;
    repeating: PropertyValue[];
    fillCustom: TemplateData[] | false;
    fillAfter: TemplateData[] | false;
}

interface FillTemplateData extends SetOrdering, ExternalData {
    values: PropertyValue[];
}

interface TogetherTemplateData extends SetOrdering, ExternalData {
    together: PropertyValue[];
}

interface PathTemplateData extends Partial<SvgPath> {
    name: string;
    clipElement: StringMap[];
    fillPattern: any;
    trimPathStart?: string;
    trimPathEnd?: string;
    trimPathOffset?: string;
}

interface TransformData {
    groupName?: string;
    translateX?: string;
    translateY?: string;
    scaleX?: string;
    scaleY?: string;
    rotation?: string;
    pivotX?: string;
    pivotY?: string;
}

interface AnimateGroup {
    element: SVGGraphicsElement;
    animate: SvgAnimation[];
    pathData?: string;
}

interface PropertyValueHolder {
    propertyName: string;
    keyframes: KeyFrame[];
}

interface KeyFrame {
    interpolator: string;
    fraction: string;
    value: string;
}

interface PropertyValue {
    propertyName?: string;
    startOffset?: string;
    duration?: string;
    repeatCount?: string;
    valueType?: string;
    valueFrom?: string;
    valueTo?: string;
    interpolator?: string;
    propertyValues: PropertyValueHolder[] | boolean;
}

interface FillReplace {
    index: number;
    time: number;
    to: string;
    reset: boolean;
    animate?: $SvgAnimateTransform;
}

const $util = squared.lib.util;
const $math = squared.lib.math;
const $xml = squared.lib.xml;
const $constS = squared.svg.lib.constant;
const $utilS = squared.svg.lib.util;

const TEMPLATES: ObjectMap<StringMap> = {};
const STORED = <ResourceStoredMapAndroid> Resource.STORED;

const INTERPOLATOR_ANDROID = {
    accelerate_decelerate: '@android:anim/accelerate_decelerate_interpolator',
    accelerate:	'@android:anim/accelerate_interpolator',
    anticipate:	'@android:anim/anticipate_interpolator',
    anticipate_overshoot: '@android:anim/anticipate_overshoot_interpolator',
    bounce:	'@android:anim/bounce_interpolator',
    cycle: '@android:anim/cycle_interpolator',
    decelerate:	'@android:anim/decelerate_interpolator',
    linear: '@android:anim/linear_interpolator',
    overshoot: '@android:anim/overshoot_interpolator'
};

if ($constS) {
    Object.assign(INTERPOLATOR_ANDROID, {
        [$constS.KEYSPLINE_NAME['ease-in']]: INTERPOLATOR_ANDROID.accelerate,
        [$constS.KEYSPLINE_NAME['ease-out']]: INTERPOLATOR_ANDROID.decelerate,
        [$constS.KEYSPLINE_NAME['ease-in-out']]: INTERPOLATOR_ANDROID.accelerate_decelerate,
        [$constS.KEYSPLINE_NAME['linear']]: INTERPOLATOR_ANDROID.linear
    });
}

const INTERPOLATOR_XML = `<?xml version="1.0" encoding="utf-8"?>
<pathInterpolator xmlns:android="http://schemas.android.com/apk/res/android"
	android:controlX1="{0}"
	android:controlY1="{1}"
	android:controlX2="{2}"
	android:controlY2="{3}" />`;

const ATTRIBUTE_ANDROID = {
    'stroke': ['strokeColor'],
    'fill': ['fillColor'],
    'opacity': ['alpha'],
    'stroke-opacity': ['strokeAlpha'],
    'fill-opacity': ['fillAlpha'],
    'stroke-width': ['strokeWidth'],
    'stroke-dasharray': ['trimPathStart', 'trimPathEnd'],
    'stroke-dashoffset': ['trimPathOffset'],
    'd': ['pathData'],
    'clip-path': ['pathData']
};

function getPaintAttribute(value: string) {
    for (const attr in ATTRIBUTE_ANDROID) {
        if (ATTRIBUTE_ANDROID[attr].includes(value)) {
            return $util.convertCamelCase(attr);
        }
    }
    return '';
}

function getVectorName(target: SvgView, section: string, index = -1) {
    return `${target.name}_${section + (index !== -1 ? `_${index + 1}` : '')}`;
}

function createPathInterpolator(value: string) {
    if (INTERPOLATOR_ANDROID[value]) {
        return INTERPOLATOR_ANDROID[value];
    }
    else {
        const interpolatorName = `path_interpolator_${$util.convertWord(value)}`;
        if (!STORED.animators.has(interpolatorName)) {
            const xml = $util.formatString(INTERPOLATOR_XML, ...value.split(' '));
            STORED.animators.set(interpolatorName, xml);
        }
        return `@anim/${interpolatorName}`;
    }
}

function createTransformData(transform: SvgTransform[] | null) {
    const result: TransformData = {};
    if (transform) {
        for (let i = 0; i < transform.length; i++) {
            const item = transform[i];
            const m = item.matrix;
            switch (item.type) {
                case SVGTransform.SVG_TRANSFORM_SCALE:
                    result.scaleX = m.a.toString();
                    result.scaleY = m.d.toString();
                    if (item.origin) {
                        result.pivotX = item.origin.x.toString();
                        result.pivotY = item.origin.y.toString();
                    }
                    break;
                case SVGTransform.SVG_TRANSFORM_ROTATE:
                    result.rotation = item.angle.toString();
                    if (item.origin) {
                        result.pivotX = item.origin.x.toString();
                        result.pivotY = item.origin.y.toString();
                    }
                    else {
                        result.pivotX = '0';
                        result.pivotY = '0';
                    }
                    break;
                case SVGTransform.SVG_TRANSFORM_TRANSLATE:
                    result.translateX = m.e.toString();
                    result.translateY = m.f.toString();
                    break;
            }
        }
    }
    return result;
}

function getViewport(element: SVGGraphicsElement) {
    const result: SVGGraphicsElement[] = [];
    let parent = element.parentElement;
    while (parent) {
        result.push(<SVGGraphicsElement> (parent as unknown));
        parent = parent.parentElement;
        if (parent instanceof HTMLElement) {
            break;
        }
    }
    return result;
}

function getParentOffset(element: SVGGraphicsElement, baseElement: SVGGraphicsElement) {
    let x = 0;
    let y = 0;
    for (const parent of getViewport(element)) {
        if (($utilS.SVG.svg(parent) || $utilS.SVG.use(parent)) && parent !== baseElement) {
            x += parent.x.baseVal.value;
            y += parent.y.baseVal.value;
        }
    }
    return { x, y };
}

function getOuterOpacity(target: SvgView) {
    let result = parseFloat(target.opacity);
    let current = target.parent;
    while (current) {
        const opacity = parseFloat(current['opacity'] || '1');
        if (!isNaN(opacity) && opacity < 1) {
            result *= opacity;
        }
        current = current['parent'];
    }
    return result;
}

function partitionTransforms(element: SVGGraphicsElement, transforms: SvgTransform[], rx = 1, ry = 1): [SvgTransform[][], SvgTransform[]] {
    if (transforms.length && ($utilS.SVG.circle(element) || $utilS.SVG.ellipse(element))) {
        const index = transforms.findIndex(item => item.type === SVGTransform.SVG_TRANSFORM_ROTATE);
        if (index !== -1 && (rx !== ry || transforms.length > 1 && transforms.some(item => item.type === SVGTransform.SVG_TRANSFORM_SCALE && item.matrix.a !== item.matrix.d))) {
            return segmentTransforms(element, transforms);
        }
    }
    return [[], transforms];
}

function segmentTransforms(element: SVGGraphicsElement, transforms: SvgTransform[], ignoreClient = false): [SvgTransform[][], SvgTransform[]] {
    if (transforms.length) {
        const host: SvgTransform[][] = [];
        const client: SvgTransform[] = [];
        const items = transforms.slice(0).reverse();
        const rotateOrigin = transforms[0].fromCSS ? [] : $utilS.TRANSFORM.rotateOrigin(element).reverse();
        for (let i = 1; i < items.length; i++) {
            const itemA = items[i];
            const itemB = items[i - 1];
            if (itemA.type === itemB.type) {
                let matrix: SvgMatrix | undefined;
                switch (itemA.type) {
                    case SVGTransform.SVG_TRANSFORM_TRANSLATE:
                        matrix = $utilS.MATRIX.clone(itemA.matrix);
                        matrix.e += itemB.matrix.e;
                        matrix.f += itemB.matrix.f;
                        break;
                    case SVGTransform.SVG_TRANSFORM_SCALE: {
                        matrix = $utilS.MATRIX.clone(itemA.matrix);
                        matrix.a *= itemB.matrix.a;
                        matrix.d *= itemB.matrix.d;
                        break;
                    }
                }
                if (matrix) {
                    itemA.matrix = matrix;
                    items.splice(--i, 1);
                }
            }
        }
        const current: SvgTransform[] = [];
        function restart() {
            host.push(current.slice(0));
            current.length = 0;
        }
        for (const item of items) {
            switch (item.type) {
                case SVGTransform.SVG_TRANSFORM_MATRIX:
                case SVGTransform.SVG_TRANSFORM_SKEWX:
                case SVGTransform.SVG_TRANSFORM_SKEWY:
                    client.push(item);
                    break;
                case SVGTransform.SVG_TRANSFORM_TRANSLATE:
                    if (!ignoreClient && host.length === 0 && current.length === 0) {
                        client.push(item);
                    }
                    else {
                        current.push(item);
                        restart();
                    }
                    break;
                case SVGTransform.SVG_TRANSFORM_ROTATE:
                    while (rotateOrigin.length) {
                        const origin = <SvgPoint> rotateOrigin.shift();
                        if (origin.angle === item.angle) {
                            if (origin.x !== 0 || origin.y !== 0) {
                                item.origin = origin;
                            }
                            break;
                        }
                    }
                    if (item.origin === undefined && current.length === 1 && current[0].type === SVGTransform.SVG_TRANSFORM_SCALE) {
                        current.push(item);
                        continue;
                    }
                case SVGTransform.SVG_TRANSFORM_SCALE:
                    if (current.length) {
                        restart();
                    }
                    current.push(item);
                    break;
            }
        }
        if (current.length) {
            host.push(current);
        }
        return [host.reverse(), client];
    }
    return [[], transforms];
}

function getPropertyValue(values: string[] | (string | number)[][], index: number, propertyIndex: number, keyFrames = false, baseValue?: string) {
    let result: string | undefined;
    const value = values[index];
    if (value) {
        result = Array.isArray(value) ? value[propertyIndex].toString() : value;
    }
    else if (!keyFrames && index === 0) {
        result = baseValue;
    }
    return result || '';
}

function getValueType(attributeName: string) {
    switch (attributeName) {
        case 'fill':
        case 'stroke':
            return '';
        case 'opacity':
        case 'stroke-opacity':
        case 'stroke-dasharray':
        case 'stroke-dashoffset':
        case 'fill-opacity':
        case 'transform':
            return 'floatType';
        case 'stroke-width':
            return 'intType';
        case 'd':
        case 'x':
        case 'x1':
        case 'x2':
        case 'cx':
        case 'y':
        case 'y1':
        case 'y2':
        case 'cy':
        case 'r':
        case 'rx':
        case 'ry':
        case 'width':
        case 'height':
        case 'points':
            return 'pathType';
        default:
            if (getTransformInitialValue(attributeName)) {
                return 'floatType';
            }
            return undefined;
    }
}

function isColorType(attr: string) {
    return attr === 'fill' || attr === 'stroke';
}

function createAnimateFromTo(attributeName: string, delay: number, to: string, from?: string) {
    const result = new $SvgAnimate();
    result.attributeName = attributeName;
    result.delay = delay;
    result.duration = 1;
    result.from = from !== undefined ? from : to;
    result.to = to;
    result.fillForwards = true;
    result.convertToValues();
    return result;
}

function getAttributePropertyName(value: string, checkTransform = true) {
    let result: string[] | undefined = ATTRIBUTE_ANDROID[value];
    if (result === undefined && checkTransform && getTransformInitialValue(value)) {
        result = [value];
    }
    return result;
}

function getTransformPropertyName(type: number) {
    switch (type) {
        case SVGTransform.SVG_TRANSFORM_TRANSLATE:
            return ['translateX', 'translateY'];
        case SVGTransform.SVG_TRANSFORM_SCALE:
            return ['scaleX', 'scaleY', 'pivotX', 'pivotY'];
        case SVGTransform.SVG_TRANSFORM_ROTATE:
            return ['rotation', 'pivotX', 'pivotY'];
    }
    return undefined;
}

function getTransformValues(item: $SvgAnimateTransform) {
    switch (item.type) {
        case SVGTransform.SVG_TRANSFORM_ROTATE:
            return $SvgAnimateTransform.toRotateList(item.values);
        case SVGTransform.SVG_TRANSFORM_SCALE:
            return $SvgAnimateTransform.toScaleList(item.values);
        case SVGTransform.SVG_TRANSFORM_TRANSLATE:
            return $SvgAnimateTransform.toTranslateList(item.values);
    }
    return undefined;
}

function getTransformInitialValue(name: string) {
    switch (name) {
        case 'rotation':
        case 'pivotX':
        case 'pivotY':
        case 'translateX':
        case 'translateY':
            return '0';
        case 'scaleX':
        case 'scaleY':
            return '1';
    }
    return undefined;
}

function checkColorType(item: SvgAnimation, value: string) {
    if (isColorType(item.attributeName)) {
        const colorName = Resource.addColor(value);
        if (colorName !== '') {
            return `@color/${colorName}`;
        }
    }
    return value;
}

export default class ResourceSvg<T extends View> extends squared.base.Extension<T> {
    public readonly options: ResourceSvgOptions = {
        transformExclude: {
            path: [],
            line: [],
            rect: [],
            ellipse: [SVGTransform.SVG_TRANSFORM_SKEWX, SVGTransform.SVG_TRANSFORM_SKEWY],
            circle: [SVGTransform.SVG_TRANSFORM_SKEWX, SVGTransform.SVG_TRANSFORM_SKEWY],
            polyline: [],
            polygon: [],
            image: [SVGTransform.SVG_TRANSFORM_SKEWX, SVGTransform.SVG_TRANSFORM_SKEWY]
        },
        decimalPrecisionKeyTime: 5,
        decimalPrecisionValue: 3,
        animateInterpolator: ''
    };
    public readonly eventOnly = true;

    private NODE_INSTANCE!: T;
    private SVG_INSTANCE!: $Svg;
    private VECTOR_DATA = new Map<string, GroupTemplateData>();
    private ANIMATE_DATA = new Map<string, AnimateGroup>();
    private IMAGE_DATA: SvgImage[] = [];
    private SYNCHRONIZE_MODE = 0;
    private NAMESPACE_AAPT = false;

    public beforeInit() {
        if ($SvgBuild) {
            if (TEMPLATES.ANIMATED === undefined) {
                TEMPLATES.ANIMATED = $xml.parseTemplate(ANIMATEDVECTOR_TMPL);
                TEMPLATES.LAYER_LIST = $xml.parseTemplate(LAYERLIST_TMPL);
                TEMPLATES.SET_OBJECTANIMATOR = $xml.parseTemplate(SETOBJECTANIMATOR_TMPL);
            }
            $SvgBuild.setName();
        }
        this.application.controllerHandler.localSettings.unsupported.tagName.delete('svg');
    }

    public afterResources() {
        for (const node of this.application.processing.cache) {
            if (node.svgElement) {
                const svg = new $Svg(<SVGSVGElement> node.element);
                const supportedKeyFrames = node.localSettings.targetAPI >= BUILD_ANDROID.MARSHMALLOW;
                this.NODE_INSTANCE = node;
                this.SVG_INSTANCE = svg;
                this.VECTOR_DATA.clear();
                this.ANIMATE_DATA.clear();
                this.IMAGE_DATA.length = 0;
                this.NAMESPACE_AAPT = false;
                this.SYNCHRONIZE_MODE = $constS.SYNCHRONIZE_MODE.FROMTO_ANIMATE | (supportedKeyFrames ? $constS.SYNCHRONIZE_MODE.KEYTIME_TRANSFORM : $constS.SYNCHRONIZE_MODE.IGNORE_TRANSFORM);
                svg.build(this.options.transformExclude, partitionTransforms, this.options.decimalPrecisionValue);
                svg.synchronize(this.SYNCHRONIZE_MODE, this.options.decimalPrecisionValue);
                this.parseVectorData(svg);
                this.queueAnimations(svg, svg.name, item => item.attributeName === 'opacity');
                const templateName = $util.convertWord(`${node.tagName}_${node.controlId}_viewbox`, true).toLowerCase();
                const getFilename = (prefix = '', suffix = '') => {
                    return templateName + (prefix !== '' ? `_${prefix}` : '') + (this.IMAGE_DATA.length ? '_vector' : '') + (suffix !== '' ? `_${suffix.toLowerCase()}` : '');
                };
                let drawable = '';
                let vectorName = '';
                {
                    const template = $xml.parseTemplate(VECTOR_TMPL);
                    let xml = $xml.createTemplate(template, <TemplateDataA> {
                        namespace: this.NAMESPACE_AAPT ? getXmlNs('aapt') : '',
                        name: svg.name,
                        width: $util.formatPX(svg.width),
                        height: $util.formatPX(svg.height),
                        viewportWidth: (svg.viewBox.width || svg.width).toString(),
                        viewportHeight: (svg.viewBox.height || svg.height).toString(),
                        alpha: parseFloat(svg.opacity) < 1 ? svg.opacity.toString() : '',
                        A: [],
                        B: [{ templateName: svg.name }]
                    });
                    const output = new Map<string, string>();
                    template['__ROOT__'] = template['A'];
                    for (const [name, data] of this.VECTOR_DATA.entries()) {
                        output.set(name, $xml.createTemplate(template, data));
                    }
                    const entries = Array.from(output.entries()).reverse();
                    for (let i = 0; i < entries.length; i++) {
                        let partial = entries[i][1];
                        for (let j = i; j < entries.length; j++) {
                            const hash = `!!${entries[j][0]}!!`;
                            if (partial.indexOf(hash) !== -1) {
                                partial = partial.replace(hash, entries[j][1]);
                                break;
                            }
                        }
                        xml = xml.replace(`!!${entries[i][0]}!!`, partial);
                    }
                    xml = $xml.formatTemplate(xml);
                    vectorName = Resource.getStoredName('drawables', xml);
                    if (vectorName === '') {
                        vectorName = getFilename();
                        STORED.drawables.set(vectorName, xml);
                    }
                }
                if (this.ANIMATE_DATA.size) {
                    const data: TemplateDataA = { vectorName, A: []
                    };
                    for (const [name, group] of this.ANIMATE_DATA.entries()) {
                        const targetData: AnimatedTargetData = { name };
                        const targetSetData: TemplateDataA = { A: [] };
                        const sequentialMap = new Map<string, $SvgAnimate[]>();
                        const transformMap = new Map<string, $SvgAnimateTransform[]>();
                        const together: $SvgAnimate[] = [];
                        const isolated: $SvgAnimate[] = [];
                        const togetherTargets: $SvgAnimate[][] = [];
                        const isolatedTargets: $SvgAnimate[][][] = [];
                        const transformTargets: $SvgAnimate[][] = [];
                        for (const item of group.animate as $SvgAnimate[]) {
                            const synchronized = item.synchronized;
                            if (synchronized) {
                                if ($SvgBuild.asAnimateTransform(item)) {
                                    const values = transformMap.get(synchronized.value) || [];
                                    values.push(item);
                                    transformMap.set(synchronized.value, values);
                                }
                                else {
                                    const values = sequentialMap.get(synchronized.value) || [];
                                    values.push(item);
                                    sequentialMap.set(synchronized.value, values);
                                }
                            }
                            else {
                                if (item.setterType) {
                                    if (ATTRIBUTE_ANDROID[item.attributeName] && $util.hasValue(item.to)) {
                                        if (item.duration > 0 && item.fillReplace) {
                                            isolated.push(item);
                                        }
                                        else {
                                            together.push(item);
                                        }
                                    }
                                }
                                else {
                                    if ($SvgBuild.asAnimateTransform(item)) {
                                        item.expandToValues();
                                    }
                                    if (item.iterationCount === -1) {
                                        isolated.push(item);
                                    }
                                    else if ((!item.fromToType || $SvgBuild.asAnimateTransform(item) && item.transformOrigin) && !(supportedKeyFrames && getValueType(item.attributeName) !== 'pathType')) {
                                        togetherTargets.push([item]);
                                    }
                                    else if (item.fillReplace) {
                                        isolated.push(item);
                                    }
                                    else {
                                        together.push(item);
                                    }
                                }
                            }
                        }
                        if (together.length) {
                            togetherTargets.push(together);
                        }
                        for (const item of sequentialMap.values()) {
                            togetherTargets.push(item.sort((a, b) => a.synchronized && b.synchronized && a.synchronized.index >= b.synchronized.index ? 1 : -1));
                        }
                        for (const item of transformMap.values()) {
                            transformTargets.push(item.sort((a, b) => a.synchronized && b.synchronized && a.synchronized.index >= b.synchronized.index ? 1 : -1));
                        }
                        for (const item of isolated) {
                            isolatedTargets.push([[item]]);
                        }
                        [togetherTargets, transformTargets, ...isolatedTargets].forEach((targets, index) => {
                            const setData: SetTemplateData = {
                                ordering: index === 0 || targets.length === 1 ? '' : 'sequentially',
                                AA: [],
                                BB: []
                            };
                            for (const items of targets) {
                                let ordering: string;
                                let synchronized: boolean;
                                let requireFill: boolean;
                                let fillBefore: boolean;
                                let useKeyFrames: boolean;
                                if (items.every(item => item.synchronized !== undefined && item.synchronized.value !== '')) {
                                    ordering = $SvgBuild.asAnimateTransform(items[0]) ? '' : 'sequentially';
                                    synchronized = true;
                                    requireFill = false;
                                    fillBefore = false;
                                    useKeyFrames = false;
                                }
                                else if (items.every(item => item.synchronized !== undefined && item.synchronized.value === '')) {
                                    ordering = 'sequentially';
                                    synchronized = true;
                                    requireFill = false;
                                    fillBefore = true;
                                    useKeyFrames = true;
                                }
                                else {
                                    ordering = index === 0 ? '' : 'sequentially';
                                    synchronized = false;
                                    requireFill = true;
                                    fillBefore = index > 1 && $SvgBuild.asAnimateTransform(items[0]);
                                    useKeyFrames = true;
                                }
                                const animatorData: AnimatorTemplateData = {
                                    ordering,
                                    fillBefore: [],
                                    repeating: [],
                                    fillCustom: [],
                                    fillAfter: []
                                };
                                const fillBeforeData: FillTemplateData = { values: [] };
                                const fillCustomData: FillTemplateData = { values: [] };
                                const fillAfterData: FillTemplateData = { values: [] };
                                const togetherData: TogetherTemplateData = { together: [] };
                                (synchronized ? $util.partitionArray(items, animate => animate.iterationCount !== -1) : [items]).forEach((partition, section) => {
                                    if (section === 1 && partition.length > 1) {
                                        fillCustomData.ordering = 'sequentially';
                                    }
                                    const animatorMap = new Map<string, PropertyValueHolder[]>();
                                    for (const item of partition) {
                                        const valueType = getValueType(item.attributeName);
                                        let transforming = false;
                                        let transformOrigin: Point[] | undefined;
                                        const getFillAfter = (propertyName: string, lastValue?: PropertyValue, startOffset?: number) => {
                                            if (!synchronized && item.fillReplace) {
                                                let valueTo = item.replaceValue;
                                                if (valueTo === undefined) {
                                                    if (transforming) {
                                                        valueTo = getTransformInitialValue(propertyName);
                                                    }
                                                    else if (item.parent && $SvgBuild.isShape(item.parent) && item.parent.path) {
                                                        switch (propertyName) {
                                                            case 'pathData':
                                                                valueTo = item.parent.path.value;
                                                                break;
                                                            case 'trimPathOffset':
                                                                valueTo = '0';
                                                                break;
                                                            case 'trimPathStart':
                                                            case 'trimPathEnd':
                                                                break;
                                                            default:
                                                                valueTo = item.parent.path[getPaintAttribute(propertyName)];
                                                                break;
                                                        }
                                                    }
                                                    if (valueTo === undefined) {
                                                        valueTo = item.baseValue;
                                                    }
                                                }
                                                const result: PropertyValue[] = [];
                                                let previousValue: string | undefined;
                                                if (lastValue) {
                                                    if ($util.isArray(lastValue.propertyValues)) {
                                                        const propertyValue = lastValue.propertyValues[lastValue.propertyValues.length - 1];
                                                        previousValue = propertyValue.keyframes[propertyValue.keyframes.length - 1].value;
                                                    }
                                                    else {
                                                        previousValue = lastValue.valueTo;
                                                    }
                                                }
                                                if ($util.isString(valueTo) && valueTo !== previousValue) {
                                                    valueTo = checkColorType(item, valueTo);
                                                    let duration: string | undefined;
                                                    switch (propertyName) {
                                                        case 'trimPathStart':
                                                        case 'trimPathEnd':
                                                            valueTo = valueTo.split(' ')[propertyName === 'trimPathStart' ? 0 : 1];
                                                        case 'fillColor':
                                                        case 'strokeColor':
                                                            duration = '1';
                                                            break;
                                                    }
                                                    result.push(this.createPropertyValue(propertyName, valueTo, duration, valueType, valueType === 'pathType' ? valueTo : '', startOffset ? startOffset.toString() : ''));
                                                }
                                                if (transformOrigin) {
                                                    if (propertyName.endsWith('X')) {
                                                        result.push(this.createPropertyValue('translateX'));
                                                    }
                                                    else if (propertyName.endsWith('Y')) {
                                                        result.push(this.createPropertyValue('translateY'));
                                                    }
                                                }
                                                return result;
                                            }
                                            return undefined;
                                        };
                                        if ($SvgBuild.asSet(item)) {
                                            const propertyNames = getAttributePropertyName(item.attributeName);
                                            if (propertyNames) {
                                                let values: string[] | undefined;
                                                if (isColorType(item.attributeName)) {
                                                    const colorName = Resource.addColor(item.to);
                                                    if (colorName !== '') {
                                                        values = [`@color/${colorName}`];
                                                    }
                                                }
                                                else {
                                                    values = item.to.split(' ');
                                                }
                                                if (values && values.length === propertyNames.length) {
                                                    for (let i = 0; i < propertyNames.length; i++) {
                                                        let valueFrom: string | undefined;
                                                        if (item.delay > 0 && item.baseValue) {
                                                            valueFrom = checkColorType(item, item.baseValue.split(' ')[i]);
                                                        }
                                                        else if (valueType === 'pathType') {
                                                            valueFrom = values[i];
                                                        }
                                                        const propertyValue = this.createPropertyValue(propertyNames[i], values[i], '0', valueType, valueFrom, item.delay > 0 ? item.delay.toString() : '');
                                                        if (index > 1) {
                                                            fillCustomData.values.push(propertyValue);
                                                            const fillAfter = getFillAfter(propertyNames[i], undefined, index > 1 ? item.duration : 0);
                                                            if (fillAfter) {
                                                                fillAfterData.values.push(...fillAfter);
                                                            }
                                                        }
                                                        else {
                                                            togetherData.together.push(propertyValue);
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                        else if (valueType !== undefined) {
                                            let repeatCount: string;
                                            if (section === 1) {
                                                repeatCount = partition.length > 1 ? '0' : '-1';
                                            }
                                            else {
                                                repeatCount = item.iterationCount !== -1 ? Math.ceil(item.iterationCount - 1).toString() : '-1';
                                            }
                                            const options = this.createPropertyValue('', '', item.duration.toString(), valueType, '', item.delay > 0 ? item.delay.toString() : '', repeatCount);
                                            if (item.keySplines === undefined) {
                                                if (item.timingFunction) {
                                                    options.interpolator = createPathInterpolator(item.timingFunction);
                                                }
                                                else if (this.options.animateInterpolator !== '') {
                                                    options.interpolator = this.options.animateInterpolator;
                                                }
                                            }
                                            let propertyNames: string[] | undefined;
                                            let values: string[] | number[][] | undefined;
                                            let beforeValues: string[] | undefined;
                                            const insertBeforeValue = (attr: string, value = '0', startOffset?: number) => {
                                                if (fillBeforeData.values.find(before => before.propertyName === attr) === undefined) {
                                                    fillBeforeData.values.push(this.createPropertyValue(attr, value, '0', '', '', startOffset ? startOffset.toString() : ''));
                                                }
                                            };
                                            if ($SvgBuild.asAnimateTransform(item)) {
                                                propertyNames = getTransformPropertyName(item.type);
                                                values = getTransformValues(item);
                                                if (fillBefore && propertyNames) {
                                                    beforeValues = $util.objectMap<string, string>(propertyNames, value => getTransformInitialValue(value) || '0');
                                                }
                                                transformOrigin = item.transformOrigin;
                                                transforming = true;
                                            }
                                            else if (options.valueType === 'pathType') {
                                                if (group.pathData) {
                                                    propertyNames = ['pathData'];
                                                    values = item.values.slice(0);
                                                    if (item.attributeName === 'points') {
                                                        for (let i = 0; i < values.length; i++) {
                                                            if (values[i] !== '') {
                                                                const points = $SvgBuild.convertNumbers($SvgBuild.toNumberList(values[i]));
                                                                if (points.length) {
                                                                    values[i] = item.parent && item.parent.element.tagName === 'polygon' ? $SvgBuild.drawPolygon(points, this.options.decimalPrecisionValue) : $SvgBuild.drawPolyline(points, this.options.decimalPrecisionValue);
                                                                }
                                                                else {
                                                                    values = undefined;
                                                                    break;
                                                                }
                                                            }
                                                        }
                                                    }
                                                    else if (item.attributeName !== 'd') {
                                                        for (let i = 0; i < values.length; i++) {
                                                            const value = values[i];
                                                            if (value !== '') {
                                                                const commands = $SvgBuild.getPathCommands(group.pathData);
                                                                if (commands.length <= 1) {
                                                                    values = undefined;
                                                                    break;
                                                                }
                                                                let x: number | undefined;
                                                                let y: number | undefined;
                                                                let rx: number | undefined;
                                                                let ry: number | undefined;
                                                                let width: number | undefined;
                                                                let height: number | undefined;
                                                                switch (item.attributeName) {
                                                                    case 'x':
                                                                    case 'x1':
                                                                    case 'x2':
                                                                    case 'cx':
                                                                        x = parseFloat(value);
                                                                        break;
                                                                    case 'y':
                                                                    case 'y1':
                                                                    case 'y2':
                                                                    case 'cy':
                                                                        y = parseFloat(value);
                                                                        break;
                                                                    case 'r':
                                                                        rx = parseFloat(value);
                                                                        ry = rx;
                                                                        break;
                                                                    case 'rx':
                                                                        rx = parseFloat(value);
                                                                        break;
                                                                    case 'ry':
                                                                        ry = parseFloat(value);
                                                                    case 'width':
                                                                        width = parseFloat(value);
                                                                        break;
                                                                    case 'height':
                                                                        height = parseFloat(value);
                                                                        break;
                                                                }
                                                                if (x !== undefined && !isNaN(x) || y !== undefined && !isNaN(y)) {
                                                                    const commandA = commands[0];
                                                                    const commandB = commands[commands.length - 1];
                                                                    const pointA = commandA.value[0];
                                                                    const pointB = commandB.value[commandB.value.length - 1];
                                                                    let recalibrate = false;
                                                                    if (x !== undefined) {
                                                                        switch (item.attributeName) {
                                                                            case 'x':
                                                                                x -= pointA.x;
                                                                                recalibrate = true;
                                                                                break;
                                                                            case 'x1':
                                                                            case 'cx':
                                                                                pointA.x = x;
                                                                                commandA.coordinates[0] = x;
                                                                                break;
                                                                            case 'x2':
                                                                                pointB.x = x;
                                                                                commandB.coordinates[0] = x;
                                                                                break;
                                                                        }
                                                                    }
                                                                    if (y !== undefined) {
                                                                        switch (item.attributeName) {
                                                                            case 'y':
                                                                                y -= pointA.y;
                                                                                recalibrate = true;
                                                                                break;
                                                                            case 'y1':
                                                                            case 'cy':
                                                                                pointA.y = y;
                                                                                commandA.coordinates[1] = y;
                                                                                break;
                                                                            case 'y2':
                                                                                pointB.y = y;
                                                                                commandB.coordinates[1] = y;
                                                                                break;
                                                                        }
                                                                    }
                                                                    if (recalibrate) {
                                                                        for (const path of commands) {
                                                                            if (!path.relative) {
                                                                                for (let j = 0, k = 0; j < path.coordinates.length; j += 2, k++) {
                                                                                    const pt = path.value[k];
                                                                                    if (x !== undefined) {
                                                                                        path.coordinates[j] += x;
                                                                                        pt.x += x;
                                                                                    }
                                                                                    if (y !== undefined) {
                                                                                        path.coordinates[j + 1] += y;
                                                                                        pt.y += y;
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                                else if (rx !== undefined && !isNaN(rx) || ry !== undefined && !isNaN(ry)) {
                                                                    for (const path of commands) {
                                                                        if (path.name.toUpperCase() === 'A') {
                                                                            if (rx !== undefined) {
                                                                                path.radiusX = rx;
                                                                                path.coordinates[0] = rx * 2 * (path.coordinates[0] < 0 ? -1 : 1);
                                                                            }
                                                                            if (ry !== undefined) {
                                                                                path.radiusY = ry;
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                                else if (width !== undefined && !isNaN(width)) {
                                                                    for (const path of commands) {
                                                                        if (path.name === 'h') {
                                                                            path.coordinates[0] = width * (path.coordinates[0] < 0 ? -1 : 1);
                                                                        }
                                                                    }
                                                                }
                                                                else if (height !== undefined && !isNaN(height)) {
                                                                    for (const path of commands) {
                                                                        if (path.name === 'v') {
                                                                            path.coordinates[1] = height;
                                                                        }
                                                                    }
                                                                }
                                                                else {
                                                                    values[i] = values[i - 1] || group.pathData;
                                                                    continue;
                                                                }
                                                                values[i] = $SvgBuild.drawPath(commands, this.options.decimalPrecisionValue);
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                            else {
                                                propertyNames = getAttributePropertyName(item.attributeName);
                                                switch (options.valueType) {
                                                    case 'intType':
                                                        values = $util.objectMap<string, string>(item.values, value => $util.convertInt(value).toString());
                                                        break;
                                                    case 'floatType':
                                                        switch (item.attributeName) {
                                                            case 'stroke-dasharray':
                                                                values = $util.objectMap<string, number[]>(item.values, value => $util.replaceMap<string, number>(value.split(' '), fraction => parseFloat(fraction)));
                                                                if (item.delay > 0 && item.baseValue) {
                                                                    beforeValues = $util.replaceMap<string, string>(item.baseValue.split(' '), fraction => parseFloat(fraction).toString());
                                                                }
                                                                break;
                                                            default:
                                                                values = item.values;
                                                                break;
                                                        }
                                                        break;
                                                    default:
                                                        values = item.values.slice(0);
                                                        if (isColorType(item.attributeName)) {
                                                            for (let i = 0; i < values.length; i++) {
                                                                if (values[i] !== '') {
                                                                    const colorName = Resource.addColor(values[i]);
                                                                    if (colorName !== '') {
                                                                        values[i] = `@color/${colorName}`;
                                                                    }
                                                                }
                                                            }
                                                        }
                                                        break;
                                                }
                                            }
                                            if (values && propertyNames) {
                                                const keyName =  item.synchronized ? item.synchronized.index + item.synchronized.value : (index !== 0 || propertyNames.length > 1 ? JSON.stringify(options) : '');
                                                for (let i = 0; i < propertyNames.length; i++) {
                                                    const propertyName = propertyNames[i];
                                                    if (beforeValues && beforeValues[i]) {
                                                        insertBeforeValue(propertyName, beforeValues[i]);
                                                    }
                                                    if (values.length === 1 && item.duration === 0) {
                                                        insertBeforeValue(propertyName, Array.isArray(values[0]) ? values[values.length - 1][i].toString() : values[values.length - 1].toString(), item.delay);
                                                    }
                                                    else if (useKeyFrames && item.keyTimes.length > 1) {
                                                        if (supportedKeyFrames && options.valueType !== 'pathType') {
                                                            const propertyValues = animatorMap.get(keyName) || [];
                                                            const keyframes: KeyFrame[] = [];
                                                            for (let j = 0; j < item.keyTimes.length; j++) {
                                                                let value = getPropertyValue(values, j, i, true);
                                                                if (value !== '') {
                                                                    value = $math.truncateString(value, this.options.decimalPrecisionValue);
                                                                }
                                                                keyframes.push({
                                                                    interpolator: j > 0 && value !== '' && propertyName !== 'pivotX' && propertyName !== 'pivotY' ? this.getPathInterpolator(item.keySplines, j - 1) : '',
                                                                    fraction: item.keyTimes[j] === 0 && value === '' ? '' : $math.truncateRange(item.keyTimes[j], this.options.decimalPrecisionKeyTime),
                                                                    value
                                                                });
                                                            }
                                                            if (keyframes.length) {
                                                                propertyValues.push({ propertyName, keyframes });
                                                                if (!animatorMap.has(keyName)) {
                                                                    if (keyName !== '') {
                                                                        animatorMap.set(keyName, propertyValues);
                                                                    }
                                                                    (section === 0 ? animatorData.repeating : fillCustomData.values).push({ ...options, propertyValues });
                                                                }
                                                            }
                                                            transformOrigin = undefined;
                                                        }
                                                        else {
                                                            const propertyData: AnimatorTemplateData = {
                                                                ordering: 'sequentially',
                                                                fillBefore: false,
                                                                repeating: [],
                                                                fillCustom: false,
                                                                fillAfter: false
                                                            };
                                                            const translateData: AnimatorTemplateData = {
                                                                ordering: 'sequentially',
                                                                fillBefore: false,
                                                                repeating: [],
                                                                fillCustom: false,
                                                                fillAfter: false
                                                            };
                                                            for (let j = 0; j < item.keyTimes.length; j++) {
                                                                const propertyOptions: PropertyValue = {
                                                                    ...options,
                                                                    propertyName,
                                                                    startOffset: j === 0 ? (item.delay + (item.keyTimes[j] > 0 ? Math.floor(item.keyTimes[j] * item.duration) : 0)).toString() : '',
                                                                    propertyValues: false
                                                                };
                                                                const valueTo = getPropertyValue(values, j, i, false, options.valueType === 'pathType' ? group.pathData : item.baseValue);
                                                                if (valueTo) {
                                                                    if (options.valueType === 'pathType') {
                                                                        const pathData = j === 0 ? group.pathData : getPropertyValue(values, j - 1, i);
                                                                        if (pathData) {
                                                                            propertyOptions.valueFrom = pathData;
                                                                        }
                                                                        else {
                                                                            continue;
                                                                        }
                                                                    }
                                                                    const duration = j === 0 ? 0 : Math.floor((item.keyTimes[j] - (j > 0 ? item.keyTimes[j - 1] : 0)) * item.duration);
                                                                    if (transformOrigin && transformOrigin[j]) {
                                                                        let direction: string | undefined;
                                                                        let translateTo = 0;
                                                                        if (propertyName.endsWith('X')) {
                                                                            direction = 'translateX';
                                                                            translateTo = transformOrigin[j].x;
                                                                        }
                                                                        else if (propertyName.endsWith('Y')) {
                                                                            direction = 'translateY';
                                                                            translateTo = transformOrigin[j].y;
                                                                        }
                                                                        if (direction) {
                                                                            const valueData = this.createPropertyValue(direction, translateTo.toString(), duration.toString(), 'floatType');
                                                                            valueData.interpolator = createPathInterpolator($constS.KEYSPLINE_NAME['step']);
                                                                            translateData.repeating.push(valueData);
                                                                        }
                                                                    }
                                                                    propertyOptions.interpolator = j > 0 ? this.getPathInterpolator(item.keySplines, j - 1) : '';
                                                                    propertyOptions.duration = duration.toString();
                                                                    propertyOptions.valueTo = valueTo;
                                                                    propertyData.repeating.push(propertyOptions);
                                                                }
                                                            }
                                                            if (requireFill && section === 0) {
                                                                const fillAfter = getFillAfter(propertyName, propertyData.repeating[propertyData.repeating.length - 1]);
                                                                if (fillAfter) {
                                                                    if (fillAfter.length === 1) {
                                                                        propertyData.repeating.push(fillAfter[0]);
                                                                    }
                                                                    else {
                                                                        propertyData.fillAfter = [{ values: fillAfter }];
                                                                    }
                                                                }
                                                            }
                                                            if (translateData.repeating.length) {
                                                                setData.AA.push(translateData);
                                                            }
                                                            setData.AA.push(propertyData);
                                                            continue;
                                                        }
                                                    }
                                                    else {
                                                        const propertyOptions: PropertyValue = {
                                                            ...options,
                                                            propertyName,
                                                            interpolator: item.duration > 1 ? this.getPathInterpolator(item.keySplines, 0) : '',
                                                            propertyValues: false
                                                        };
                                                        if (Array.isArray(values[0])) {
                                                            const valueTo = values[values.length - 1][i];
                                                            if (values.length > 1) {
                                                                const from = values[0][i];
                                                                if (from !== valueTo) {
                                                                    propertyOptions.valueFrom = from.toString();
                                                                }
                                                            }
                                                            propertyOptions.valueTo = valueTo.toString();
                                                        }
                                                        else {
                                                            let valueFrom: string | undefined;
                                                            if (values.length > 1) {
                                                                valueFrom = values[0].toString();
                                                                propertyOptions.valueTo = values[values.length - 1].toString();
                                                            }
                                                            else {
                                                                valueFrom = item.from;
                                                                propertyOptions.valueTo = item.to;
                                                            }
                                                            if (options.valueType === 'pathType') {
                                                                propertyOptions.valueFrom = valueFrom || group.pathData || propertyOptions.valueTo;
                                                            }
                                                            else if (propertyOptions.valueFrom !== propertyOptions.valueTo) {
                                                                propertyOptions.valueFrom = checkColorType(item, valueFrom);
                                                            }
                                                        }
                                                        if (propertyOptions.valueTo) {
                                                            (section === 0 ? animatorData.repeating : fillCustomData.values).push(propertyOptions);
                                                        }
                                                    }
                                                    if (requireFill && section === 0) {
                                                        const fillAfter = getFillAfter(propertyName, animatorData.repeating[animatorData.repeating.length - 1]);
                                                        if (fillAfter) {
                                                            fillAfterData.values.push(...fillAfter);
                                                        }
                                                    }
                                                }
                                                if (transformOrigin && transformOrigin.length) {
                                                    insertBeforeValue('translateX');
                                                    insertBeforeValue('translateY');
                                                }
                                            }
                                        }
                                    }
                                });
                                const valid = animatorData.repeating.length > 0 || fillCustomData.values.length > 0;
                                if (valid && animatorData.fillBefore) {
                                    switch (fillBeforeData.values.length) {
                                        case 0:
                                            animatorData.fillBefore = false;
                                            break;
                                        case 1:
                                            animatorData.repeating.unshift(fillBeforeData.values[0]);
                                            break;
                                        default:
                                            animatorData.fillBefore.push(fillBeforeData);
                                            break;
                                    }
                                }
                                if (animatorData.fillCustom) {
                                    switch (fillCustomData.values.length) {
                                        case 0:
                                            animatorData.fillCustom = false;
                                            break;
                                        case 1:
                                            animatorData.repeating.push(fillCustomData.values[0]);
                                            break;
                                        default:
                                            animatorData.fillCustom.push(fillCustomData);
                                            break;
                                    }
                                }
                                if (valid && animatorData.fillAfter) {
                                    switch (fillAfterData.values.length) {
                                        case 0:
                                            animatorData.fillAfter = false;
                                            break;
                                        case 1:
                                            animatorData.repeating.push(fillAfterData.values[0]);
                                            break;
                                        default:
                                            animatorData.fillAfter.push(fillAfterData);
                                            break;
                                    }
                                }
                                const filled = animatorData.fillBefore || animatorData.fillCustom || animatorData.fillAfter;
                                if (!filled && animatorData.ordering === 'sequentially' && animatorData.repeating.length === 1) {
                                    animatorData.ordering = '';
                                }
                                if (!filled && setData.ordering !== 'sequentially' && animatorData.ordering !== 'sequentially' && animatorData.repeating.every(repeat => repeat.propertyValues === false || Array.isArray(repeat.propertyValues) && repeat.propertyValues.length === 0)) {
                                    togetherData.together.push(...animatorData.repeating);
                                    animatorData.repeating.length = 0;
                                }
                                else if (valid) {
                                    setData.AA.push(animatorData);
                                }
                                if (togetherData.together.length) {
                                    setData.BB.push(togetherData);
                                }
                            }
                            if (setData.AA.length || setData.BB.length) {
                                targetSetData.A.push(setData);
                            }
                        });
                        if (targetSetData.A.length) {
                            const xml = $xml.createTemplate(TEMPLATES.SET_OBJECTANIMATOR, targetSetData);
                            targetData.animationName = Resource.getStoredName('animators', xml);
                            if (targetData.animationName === '') {
                                targetData.animationName = getFilename('animation', name);
                                STORED.animators.set(targetData.animationName, xml);
                            }
                            data.A.push(targetData);
                        }
                    }
                    if (data.A.length) {
                        const xml = $xml.createTemplate(TEMPLATES.ANIMATED, data);
                        vectorName = Resource.getStoredName('drawables', xml);
                        if (vectorName === '') {
                            vectorName = getFilename('animation');
                            STORED.drawables.set(vectorName, xml);
                        }
                    }
                }
                if (this.IMAGE_DATA.length) {
                    const D: StringMap[] = [];
                    for (const item of this.IMAGE_DATA) {
                        const scaleX = svg.width / svg.viewBox.width;
                        const scaleY = svg.height / svg.viewBox.height;
                        let x = item.getBaseValue('x', 0) * scaleX;
                        let y = item.getBaseValue('y', 0) * scaleY;
                        let width: number = item.getBaseValue('width', 0);
                        let height: number = item.getBaseValue('height', 0);
                        const offset = getParentOffset(item.element, <SVGSVGElement> svg.element);
                        x += offset.x;
                        y += offset.y;
                        width *= scaleX;
                        height *= scaleY;
                        const data: ExternalData = {
                            width: $util.formatPX(width),
                            height: $util.formatPX(height),
                            left: x !== 0 ? $util.formatPX(x) : '',
                            top: y !== 0 ? $util.formatPX(y) : '',
                            src: Resource.addImage({ mdpi: item.href }),
                            rotate: []
                        };
                        if (item.rotateAngle) {
                            data.rotate.push({
                                src: data.src,
                                fromDegrees: item.rotateAngle.toString(),
                                visible: item.visible ? 'true' : 'false'
                            });
                            data.src = '';
                        }
                        else if (!item.visible) {
                            continue;
                        }
                        D.push(data);
                    }
                    const xml = $xml.formatTemplate(
                        $xml.createTemplate(TEMPLATES.LAYER_LIST, <TemplateDataA> {
                            A: [],
                            B: false,
                            C: [{ src: vectorName }],
                            D,
                            E: false,
                            F: false
                        })
                    );
                    drawable = Resource.getStoredName('drawables', xml);
                    if (drawable === '') {
                        drawable = templateName;
                        STORED.drawables.set(drawable, xml);
                    }
                }
                else {
                    drawable = vectorName;
                }
                if (drawable !== '') {
                    if (node.localSettings.targetAPI >= BUILD_ANDROID.LOLLIPOP) {
                        node.android('src', `@drawable/${drawable}`);
                    }
                    else {
                        node.app('srcCompat', `@drawable/${drawable}`);
                    }
                }
                if (!node.hasWidth) {
                    node.android('layout_width', 'wrap_content');
                }
                if (!node.hasHeight) {
                    node.android('layout_height', 'wrap_content');
                }
            }
        }
    }

    public afterFinalize() {
        this.application.controllerHandler.localSettings.unsupported.tagName.add('svg');
    }

    private parseVectorData(group: SvgGroup) {
        const groupData = this.createGroup(group);
        for (const item of group) {
            const CCC: ExternalData[] = [];
            const DDD: StringMap[] = [];
            const render: TransformData[][] = [[]];
            const clipGroup: StringMap[] = [];
            if ($SvgBuild.isShape(item)) {
                if (item.visible && item.path && item.path.value) {
                    const pathData = this.createPath(item, item.path, render);
                    if (pathData.strokeWidth && (pathData.strokeDasharray || pathData.strokeDashoffset)) {
                        const animateData = this.ANIMATE_DATA.get(item.name);
                        if (animateData === undefined || animateData.animate.every(animate => animate.attributeName.startsWith('stroke-dash'))) {
                            const [strokeDash, pathValue, clipPathData] = item.path.extractStrokeDash(animateData && animateData.animate, this.options.decimalPrecisionValue);
                            if (strokeDash) {
                                const groupName = getVectorName(item, 'stroke');
                                if (pathValue && clipPathData) {
                                    pathData.value = pathValue;
                                    clipGroup.push({ clipPathData });
                                }
                                for (let i = 0; i < strokeDash.length; i++) {
                                    const pathObject = i === 0 ? pathData : Object.assign({}, pathData);
                                    pathObject.name = `${groupName}_${i}`;
                                    if (animateData) {
                                        this.ANIMATE_DATA.set(pathObject.name, {
                                            element: animateData.element,
                                            animate: $util.filterArray(animateData.animate, data => data.id === undefined || data.id === i)
                                        });
                                    }
                                    pathObject.trimPathStart = $math.truncateRange(strokeDash[i].start, this.options.decimalPrecisionValue);
                                    pathObject.trimPathEnd = $math.truncateRange(strokeDash[i].end, this.options.decimalPrecisionValue);
                                    CCC.push(pathObject);
                                }
                                if (animateData) {
                                    this.ANIMATE_DATA.delete(item.name);
                                }
                                render[0].push({ groupName });
                            }
                        }
                    }
                    if (CCC.length === 0) {
                        CCC.push(pathData);
                    }
                }
                else {
                    continue;
                }
            }
            else if ($SvgBuild.asImage(item)) {
                if (!$SvgBuild.asPattern(group)) {
                    if (item.width === 0 || item.height === 0) {
                        const image = this.application.session.image.get(item.href);
                        if (image && image.width > 0 && image.height > 0) {
                            item.width = image.width;
                            item.height = image.height;
                            item.setRect();
                        }
                    }
                    item.extract(this.options.transformExclude.image);
                    if (item.visible || item.rotateAngle !== undefined) {
                        this.IMAGE_DATA.push(item);
                    }
                }
                continue;
            }
            else if ($SvgBuild.isContainer(item)) {
                if (item.visible && item.length) {
                    this.parseVectorData(<SvgGroup> item);
                    DDD.push({ templateName: item.name });
                }
                else {
                    continue;
                }
            }
            groupData.BB.push({ render, clipGroup, CCC, DDD });
        }
        this.VECTOR_DATA.set(group.name, groupData);
    }

    private createGroup(target: SvgGroup) {
        const region: TransformData[][] = [[]];
        const clipRegion: StringMap[] = [];
        const path: TransformData[][] = [[]];
        const clipPath: StringMap[] = [];
        const result: GroupTemplateData = {
            region,
            clipRegion,
            path,
            clipPath,
            BB: []
        };
        const groupData: TransformData = {};
        if ((target !== this.SVG_INSTANCE && $SvgBuild.asSvg(target) || $SvgBuild.asUseSymbol(target) || $SvgBuild.asUsePattern(target)) && (target.x !== 0 || target.y !== 0)) {
            groupData.groupName = getVectorName(target, 'main');
            groupData.translateX = target.x.toString();
            groupData.translateY = target.y.toString();
        }
        if (target.clipRegion !== '') {
            this.createClipPath(target, clipRegion, target.clipRegion);
        }
        if (clipRegion.length || Object.keys(groupData).length) {
            region[0].push(groupData);
        }
        if (target !== this.SVG_INSTANCE) {
            const baseData: TransformData = {};
            const [transformHost] = segmentTransforms(target.element, target.transforms, true);
            const groupName = getVectorName(target, 'animate');
            if (($SvgBuild.asG(target) || $SvgBuild.asUseSymbol(target)) && $util.hasValue(target.clipPath) && this.createClipPath(target, clipPath, target.clipPath)) {
                baseData.groupName = groupName;
            }
            if (this.queueAnimations(target, groupName, item => $SvgBuild.asAnimateTransform(item))) {
                baseData.groupName = groupName;
            }
            if (Object.keys(baseData).length) {
                path[0].push(baseData);
            }
            if (transformHost.length) {
                const transformed: SvgTransform[] = [];
                for (const data of transformHost) {
                    path[0].push(createTransformData(data));
                    transformed.push(...data);
                }
                target.transformed = transformed.reverse();
            }
        }
        return result;
    }

    private createPath(target: $SvgShape, path: SvgPath, render: TransformData[][]) {
        const clipElement: StringMap[] = [];
        const result: PathTemplateData = {
            name: target.name,
            clipElement,
            fillPattern: false
        };
        const setColorPattern = (attr: string, checkPattern = false) => {
            if (checkPattern) {
                const pattern = `${attr}Pattern`;
                const value = result[pattern];
                if (value) {
                    const gradient = this.SVG_INSTANCE.definitions.gradient.get(value);
                    if (gradient) {
                        switch (path.element.tagName) {
                            case 'path':
                                if (!/[zZ]\s*$/.test(path.value)) {
                                    break;
                                }
                            case 'rect':
                            case 'polygon':
                            case 'polyline':
                            case 'circle':
                            case 'ellipse': {
                                const gradients = Resource.createBackgroundGradient(this.NODE_INSTANCE, [gradient], path);
                                if (gradients.length) {
                                    result[attr] = '';
                                    result[pattern] = [{ gradients }];
                                    this.NAMESPACE_AAPT = true;
                                    return;
                                }
                                break;
                            }
                        }
                    }
                    result[pattern] = false;
                }
            }
            const colorName = Resource.addColor(result[attr]);
            if (colorName !== '') {
                result[attr] = `@color/${colorName}`;
            }
        };
        if ($SvgBuild.asUse(target) && $util.hasValue(target.clipPath)) {
            this.createClipPath(target, clipElement, target.clipPath);
        }
        if ($util.hasValue(path.clipPath)) {
            const shape = new $SvgShape(path.element);
            shape.build(this.options.transformExclude, partitionTransforms);
            shape.synchronize(this.SYNCHRONIZE_MODE, this.options.decimalPrecisionValue);
            this.createClipPath(shape, clipElement, path.clipPath);
        }
        const baseData: TransformData = {};
        const groupName = getVectorName(target, 'group');
        if (this.queueAnimations(target, groupName, item => $SvgBuild.asAnimateTransform(item))) {
            baseData.groupName = groupName;
        }
        else if (clipElement.length) {
            baseData.groupName = '';
        }
        if ($SvgBuild.asUse(target) && (target.x !== 0 || target.y !== 0)) {
            baseData.translateX = target.x.toString();
            baseData.translateY = target.y.toString();
        }
        if (Object.keys(baseData).length) {
            render[0].push(baseData);
        }
        if (path.transformResidual) {
            for (const item of path.transformResidual) {
                render[0].push(createTransformData(item));
            }
        }
        const opacity = getOuterOpacity(target);
        for (const attr in path) {
            let value = path[attr];
            if ($util.isString(value)) {
                switch (attr) {
                    case 'fillRule':
                        if (value === 'evenodd') {
                            value = 'evenOdd';
                        }
                        else {
                            continue;
                        }
                        break;
                    case 'strokeWidth':
                        if (value === '0') {
                            continue;
                        }
                        break;
                    case 'fillOpacity':
                    case 'strokeOpacity':
                        value = (parseFloat(value || '1') * opacity).toString();
                        if (value === '1') {
                            continue;
                        }
                        break;
                    case 'strokeLinecap':
                        if (value === 'butt') {
                            continue;
                        }
                        break;
                    case 'strokeLinejoin':
                        if (value === 'miter') {
                            continue;
                        }
                        break;
                    case 'strokeMiterlimit':
                        if (value === '4') {
                            continue;
                        }
                        break;
                }
                result[attr] = value;
            }
        }
        setColorPattern('fill', true);
        setColorPattern('stroke');
        const replaceMap = new Map<number, FillReplace>();
        const transformResult: $SvgAnimate[] = [];
        const replaceResult: $SvgAnimate[] = [];
        const pathData = path.value;
        let previousPathData = pathData;
        let index = 0;
        for (const item of target.animations) {
            if ($SvgBuild.asAnimateTransform(item) && !item.additiveSum && item.transformFrom) {
                let time = Math.max(0, item.delay - 1);
                replaceMap.set(time, {
                    index,
                    time,
                    to: item.transformFrom,
                    reset: false,
                    animate: item
                });
                if (item.iterationCount !== -1 && item.fillReplace) {
                    time = item.delay + item.iterationCount * item.duration;
                    if (!replaceMap.has(time)) {
                        replaceMap.set(time, {
                            index,
                            time,
                            to: pathData,
                            reset: true
                        });
                    }
                }
                index++;
            }
        }
        const replaceData = Array.from(replaceMap.values()).sort((a, b) => a.time < b.time ? -1 : 1);
        for (let i = 0; i < replaceData.length; i++) {
            const item = replaceData[i];
            if (!item.reset || item.to !== previousPathData) {
                let valid = true;
                if (item.reset) {
                    invalid: {
                        for (let j = 0; j < i; j++) {
                            const previous = replaceData[j];
                            if (!previous.reset) {
                                for (let k = i + 1; k < replaceData.length; k++) {
                                    switch (replaceData[k].index) {
                                        case previous.index:
                                            valid = false;
                                        case item.index:
                                            break invalid;
                                    }
                                }
                            }
                        }
                    }
                }
                else {
                    const itemTotal: (number | undefined)[] = [];
                    const previousType = new Set<number>();
                    for (let j = 0; j < i; j++) {
                        const previous = replaceData[j];
                        itemTotal[previous.index] = itemTotal[previous.index] ? 2 : 1;
                    }
                    for (let j = 0; j < itemTotal.length; j++) {
                        if (itemTotal[j] === 1) {
                            const transform = replaceData.find(data => data.index === j && data.animate !== undefined);
                            if (transform && transform.animate) {
                                previousType.add(transform.animate.type);
                            }
                        }
                    }
                    for (const type of previousType) {
                        const propertyName = getTransformPropertyName(type);
                        if (propertyName) {
                            const initialValue = $utilS.TRANSFORM.typeAsValue(type).split(' ');
                            for (let j = 0; j < initialValue.length; j++) {
                                transformResult.push(createAnimateFromTo(propertyName[j], item.time, initialValue[j], ''));
                            }
                        }
                    }
                }
                if (valid) {
                    replaceResult.push(createAnimateFromTo('d', item.time, item.to));
                    previousPathData = item.to;
                }
            }
        }
        if (!this.queueAnimations(target, result.name, item => ($SvgBuild.asAnimate(item) || $SvgBuild.asSet(item)) && item.attributeName !== 'clip-path', pathData) && replaceResult.length === 0) {
            result.name = '';
        }
        if (transformResult.length) {
            const data = this.ANIMATE_DATA.get(groupName);
            if (data) {
                data.animate.push(...transformResult);
            }
        }
        if (replaceResult.length) {
            const data = this.ANIMATE_DATA.get(result.name);
            if (data) {
                data.animate.push(...replaceResult);
            }
            else {
                this.ANIMATE_DATA.set(result.name, {
                    element: target.element,
                    animate: replaceResult,
                    pathData
                });
            }
        }
        return result;
    }

    private createClipPath(target: SvgView, clipArray: StringMap[], clipPath: string) {
        let result = 0;
        clipPath.split(';').forEach((value, index, array) => {
            if (value.charAt(0) === '#') {
                const element = this.SVG_INSTANCE.definitions.clipPath.get(value);
                if (element) {
                    const g = new $SvgG(element);
                    g.build(this.options.transformExclude, partitionTransforms);
                    g.synchronize(this.SYNCHRONIZE_MODE, this.options.decimalPrecisionValue);
                    g.each((child: $SvgShape) => {
                        if (child.path && child.path.value) {
                            let clipName = getVectorName(child, 'clip_path', array.length > 1 ? index + 1 : -1);
                            if (!this.queueAnimations(child, clipName, item => $SvgBuild.asAnimate(item) || $SvgBuild.asSet(item), child.path.value)) {
                                clipName = '';
                            }
                            clipArray.push({ clipName, clipPathData: child.path.value });
                        }
                    });
                }
                result++;
            }
            else {
                let clipName = getVectorName(target, 'clip_path', array.length > 1 ? index + 1 : -1);
                if (!this.queueAnimations(target, clipName, item => ($SvgBuild.asAnimate(item) || $SvgBuild.asSet(item)) && item.attributeName === 'clip-path', value)) {
                    clipName = '';
                }
                clipArray.push({ clipName, clipPathData: value });
                result++;
            }
        });
        return result > 0;
    }

    private queueAnimations(svg: SvgView, name: string, predicate: IteratorPredicate<SvgAnimation, boolean>, pathData = '') {
        if (svg.animations.length) {
            const animate = $util.filterArray(svg.animations, (item, index, array) => !item.paused && (item.duration > 0 || item.setterType) && predicate(item, index, array));
            if (animate.length) {
                this.ANIMATE_DATA.set(name, {
                    element: svg.element,
                    animate,
                    pathData
                });
                return true;
            }
        }
        return false;
    }

    private createPropertyValue(propertyName: string, valueTo = '0', duration = '0', valueType = 'floatType', valueFrom = '', startOffset = '', repeatCount = '0'): PropertyValue {
        return {
            propertyName,
            startOffset,
            duration,
            repeatCount,
            valueType,
            valueFrom: $util.isNumber(valueFrom) ? $math.truncateString(valueFrom, this.options.decimalPrecisionValue) : valueFrom,
            valueTo: $util.isNumber(valueTo) ? $math.truncateString(valueTo, this.options.decimalPrecisionValue) : valueTo,
            propertyValues: false
        };
    }

    private getPathInterpolator(keySplines: string[] | undefined, index: number) {
        if (keySplines && keySplines[index]) {
            return INTERPOLATOR_ANDROID[keySplines[index]] || createPathInterpolator(keySplines[index]);
        }
        return '';
    }
}