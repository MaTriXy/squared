import { SvgAspectRatio, SvgPathCommand, SvgPoint, SvgRect, SvgTransform } from '../svg/@types/object';

declare global {
    namespace squared.svg {
        interface SvgView extends SvgElement {
            name: string;
            opacity: string;
            visible: boolean;
            transformed: SvgTransform[] | null;
            translationOffset?: Point;
            readonly transforms: SvgTransform[];
            readonly animations: SvgAnimation[];
            getTransforms(companion?: SVGGraphicsElement): SvgTransform[];
            getAnimations(companion?: SVGGraphicsElement): SvgAnimation[];
        }

        interface SvgTransformable {
            transformed: SvgTransform[] | null;
            rotateAngle?: number;
            transformResidual?: SvgTransform[][];
        }

        interface SvgSynchronize {
            getAnimateShape(element: SVGGraphicsElement, animations?: SvgAnimation[]): SvgAnimate[];
            getAnimateViewRect(animations?: SvgAnimation[]): SvgAnimate[];
            getAnimateTransform(animations?: SvgAnimation[]): SvgAnimateTransform[];
            mergeAnimations(animations?: SvgAnimation[], transformations?: SvgAnimateTransform[], keyTimeMode?: number, precision?: number, path?: SvgPath): void;
        }

        interface SvgViewRect extends SvgRect, SvgBaseVal {
            setRect(): void;
        }

        interface SvgBaseVal extends SvgElement {
            setBaseValue(attr: string, value?: any): boolean;
            getBaseValue(attr: string, defaultValue?: any): any;
            refitBaseValue(x: number, y: number, precision?: number, scaleX?: number, scaleY?: number): void;
            verifyBaseValue(attr: string, value?: any): boolean | undefined;
        }

        interface SvgViewBox {
            viewBox: DOMRect;
        }

        interface SvgPaint {
            color: string;
            fill: string;
            fillPattern: string;
            fillOpacity: string;
            fillRule: string;
            stroke: string;
            strokeWidth: string;
            strokePattern: string;
            strokeOpacity: string;
            strokeLinecap: string;
            strokeLinejoin: string;
            strokeMiterlimit: string;
            strokeDasharray: string;
            strokeDashoffset: string;
            clipPath: string;
            clipRule: string;
            useParent?: SvgUse | SvgUseSymbol;
            patternParent?: SvgShapePattern;
            setPaint(d?: string[], precision?: number): void;
            setAttribute(attr: string, computed?: boolean): void;
            getAttribute(attr: string, computed?: boolean, inherited?: boolean): string;
            resetPaint(): void;
        }

        class SvgBuild {
            public static isContainer(object: SvgElement): object is SvgGroup;
            public static isElement(object: SvgElement): object is SvgElement;
            public static isShape(object: SvgElement): object is SvgShape;
            public static isAnimate(object: SvgAnimation): object is SvgAnimate;
            public static asSvg(object: SvgElement): object is Svg;
            public static asG(object: SvgElement): object is SvgG;
            public static asPattern(object: SvgElement): object is SvgPattern;
            public static asShapePattern(object: SvgElement): object is SvgShapePattern;
            public static asUsePattern(object: SvgElement): object is SvgUsePattern;
            public static asImage(object: SvgElement): object is SvgImage;
            public static asUse(object: SvgElement): object is SvgUse;
            public static asUseSymbol(object: SvgElement): object is SvgUseSymbol;
            public static asSet(object: SvgAnimation): boolean;
            public static asAnimate(object: SvgAnimation): object is SvgAnimate;
            public static asAnimateTransform(object: SvgAnimation): object is SvgAnimateTransform;
            public static asAnimateMotion(object: SvgAnimation): object is SvgAnimateMotion;
            public static setName(element?: SVGElement): string;
            public static drawLine(x1: number, y1: number, x2?: number, y2?: number, precision?: number): string;
            public static drawRect(width: number, height: number, x?: number, y?: number, precision?: number): string;
            public static drawCircle(cx: number, cy: number, r: number, precision?: number): string;
            public static drawEllipse(cx: number, cy: number, rx: number, ry?: number, precision?: number): string;
            public static drawPolygon(values: Point[] | DOMPoint[], precision?: number): string;
            public static drawPolyline(values: Point[] | DOMPoint[], precision?: number): string;
            public static drawPath(values: SvgPathCommand[], precision?: number): string;
            public static getPathCommands(value: string): SvgPathCommand[];
            public static filterTransforms(transforms: SvgTransform[], exclude?: number[]): SvgTransform[];
            public static applyTransforms(transforms: SvgTransform[], values: Point[], aspectRatio?: SvgAspectRatio, origin?: Point): SvgPoint[];
            public static convertTransforms(transforms: SVGTransformList): SvgTransform[];
            public static clonePoints(values: SvgPoint[] | SVGPointList): SvgPoint[];
            public static minMaxPoints(values: Point[]): number[];
            public static centerPoints(values: Point[]): Point[];
            public static convertNumbers(values: number[]): Point[];
            public static getPathPoints(values: SvgPathCommand[], radius?: boolean): SvgPoint[];
            public static bindPathPoints(values: SvgPathCommand[], points: SvgPoint[]): SvgPathCommand[];
            public static toPointList(value: string): Point[];
            public static toNumberList(value: string): number[];
            public static toBoxRect(value: string): BoxRect;
        }
    }
}

export = squared.svg.Svg;