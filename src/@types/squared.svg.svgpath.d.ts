import { SvgPoint, SvgTransform, SvgTransformExclusions, SvgTransformResidual } from '../svg/@types/object';

declare global {
    namespace squared.svg {
        interface SvgPath extends SvgBaseVal, SvgPaint, SvgTransformable, NameValue {
            value: string;
            transform: SvgTransform[];
            draw(transform?: SvgTransform[], residual?: SvgTransformResidual, save?: boolean): string;
            transformPoints(transform: SvgTransform[], points: SvgPoint[], center?: SvgPoint): SvgPoint[];
        }

        class SvgPath implements SvgPath {
            public static build(path: SvgPath, transform: SvgTransform[], exclusions?: SvgTransformExclusions, residual?: SvgTransformResidual): SvgPath;
            constructor(element: SVGGraphicsElement);
        }
    }
}

export = squared.svg.SvgElement;