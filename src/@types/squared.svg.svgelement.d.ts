import { SvgTransformExclude, SvgTransformResidual } from '../svg/@types/object';

declare global {
    namespace squared.svg {
        interface SvgElement {
            viewport?: Svg;
            parent?: SvgContainer;
            readonly element: SVGGraphicsElement;
            readonly instanceType: number;
            build(exclude?: SvgTransformExclude, residual?: SvgTransformResidual, precision?: number, element?: Element, initPath?: boolean): void;
            synchronize(keyTimeMode?: number, precision?: number): void;
        }

        interface SvgShape extends SvgElement, SvgView, SvgSynchronize {
            path?: SvgPath;
            readonly element: SVGGeometryElement | SVGUseElement;
            setPath(): void;
            synchronize(keyTimeMode?: number, precision?: number, element?: SVGGraphicsElement): void;
        }

        interface SvgImage extends SvgElement, SvgView, SvgViewRect, SvgBaseVal, SvgTransformable {
            readonly element: SVGImageElement | SVGUseElement;
            readonly href: string;
            extract(exclude?: number[]): void;
        }

        interface SvgUse extends SvgShape, SvgViewRect, SvgBaseVal, SvgPaint {
            readonly element: SVGUseElement;
            shapeElement: SVGGeometryElement;
            synchronize(keyTimeMode?: number, precision?: number, element?: SVGGraphicsElement): void;
        }

        class SvgElement implements SvgElement {
            constructor(element: SVGGraphicsElement);
        }

        class SvgShape implements SvgShape {
            constructor(element: SVGGraphicsElement, initPath?: boolean);
        }

        class SvgImage implements SvgImage {
            constructor(element: SVGImageElement | SVGUseElement, imageElement?: SVGImageElement);
        }

        class SvgUse implements SvgUse {
            constructor(element: SVGUseElement, shapeElement: SVGGraphicsElement, initPath?: boolean);
        }
    }
}

export = squared.svg.SvgElement;