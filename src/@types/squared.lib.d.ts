import * as $dom from '../lib/dom';
import * as $util from '../lib/util';

declare global {
    namespace squared.lib {
        namespace color {
            function getColorByName(value: string): Color | null;
            function getColorByShade(value: string): Color | null;
            function convertHex(value: string, opacity?: number): string;
            function convertRGBA(value: string): RGBA | null;
            function parseRGBA(value: string, opacity?: string): ColorData | null;
            function reduceRGBA(value: string, percent: number): ColorData | null;
        }

        namespace dom {
            export import USER_AGENT = $dom.USER_AGENT;
            export import ELEMENT_BLOCK = $dom.ELEMENT_BLOCK;
            export import ELEMENT_INLINE = $dom.ELEMENT_INLINE;
            function isUserAgent(value: string | number): boolean;
            function getDataSet(element: Element | null, prefix: string): StringMap;
            function newBoxRect(): BoxRect;
            function newRectDimensions(): RectDimensions;
            function newBoxModel(): BoxModel;
            function withinViewportOrigin(element: Element): boolean;
            function createElement(parent: Element | null, block?: boolean): HTMLElement;
            function removeElementsByClassName(className: string): void;
            function convertClientUnit(value: string, dimension: number, dpi: number, fontSize: number, percent?: boolean): number;
            function getRangeClientRect(element: Element): TextDimensions;
            function assignBounds(bounds: RectDimensions | DOMRect): RectDimensions;
            function getStyle(element: Element | null, cache?: boolean): CSSStyleDeclaration;
            function cssResolveUrl(value: string): string;
            function cssInherit(element: Element | null, attr: string, exclude?: string[], tagNames?: string[]): string;
            function cssParent(element: Element | null, attr: string, ...styles: string[]): boolean;
            function cssFromParent(element: Element | null, attr: string): boolean;
            function cssAttribute(element: Element, attr: string, computed?: boolean): string;
            function cssInline(element: Element, attr: string): string;
            function getBackgroundPosition(value: string, dimension: RectDimensions, dpi: number, fontSize: number, leftPerspective?: boolean, percent?: boolean): RectPosition;
            function getFirstChildElement(elements: Element | null, lineBreak?: boolean): Element | null;
            function getLastChildElement(elements: Element | null, lineBreak?: boolean): Element | null;
            function hasFreeFormText(element: Element, whiteSpace?: boolean): boolean;
            function isPlainText(element: Element, whiteSpace?: boolean): boolean;
            function hasLineBreak(element: Element | null, lineBreak?: boolean, trimString?: boolean): boolean;
            function isLineBreak(element: Element, excluded?: boolean): boolean;
            function getElementsBetween(elementStart: Element | null, elementEnd: Element, whiteSpace?: boolean, asNode?: boolean): Element[];
            function getPreviousElementSibling(element: Element | null): Element | null;
            function getNextElementSibling(element: Element | null): Element | null;
            function hasComputedStyle(element: UndefNull<Element>): element is HTMLElement;
            function hasVisibleDimensions(element: Element): boolean;
            function setElementCache(element: Element, attr: string, data: any): void;
            function getElementCache(element: Element, attr: string): any;
            function deleteElementCache(element: Element, ...attrs: string[]): void;
            function getElementAsNode<T>(element: Element): T | undefined;
        }

        namespace util {
            export import REGEX_PATTERN = $util.REGEX_PATTERN;
            function formatString(value: string, ...params: string[]): string;
            function capitalize(value: string, upper?: boolean): string;
            function convertUnderscore(value: string): string;
            function convertCamelCase(value: string, char?: string): string;
            function convertWord(value: string): string;
            function convertInt(value: string): number;
            function convertFloat(value: string): number;
            function convertPX(value: string, dpi: number, fontSize: number): string;
            function convertPercent(value: number, precision?: number): string;
            function convertAlpha(value: number): string;
            function convertRoman(value: number): string;
            function convertEnum(value: number, base: {}, derived: {}): string;
            function formatPX(value: string | number): string;
            function formatPercent(value: string | number): string;
            function hasBit(value: number, type: number): boolean;
            function isNumber(value: string | number): value is number;
            function isString(value: any): value is string;
            function isArray<T>(value: any): value is Array<T>;
            function isUnit(value: string): boolean;
            function isPercent(value: string): boolean;
            function includes(source: string | undefined, value: string, delimiter?: string): boolean;
            function cloneObject(data: {}): {};
            function optional(obj: UndefNull<object>, value: string, type?: string): any;
            function optionalAsObject(obj: UndefNull<object>, value: string): object;
            function optionalAsString(obj: UndefNull<object>, value: string): string;
            function optionalAsNumber(obj: UndefNull<object>, value: string): number;
            function optionalAsBoolean(obj: UndefNull<object>, value: string): boolean;
            function resolvePath(value: string): string;
            function trimNull(value: string | undefined): string;
            function trimString(value: string | undefined, char: string): string;
            function trimStart(value: string | undefined, char: string): string;
            function trimEnd(value: string | undefined, char: string): string;
            function repeat(many: number, value?: string): string;
            function indexOf(value: string, ...terms: string[]): number;
            function lastIndexOf(value: string, char?: string): string;
            function hasSameValue(obj1: {}, obj2: {}, ...attrs: string[]): boolean;
            function searchObject(obj: StringMap, value: string | StringMap): any[][];
            function hasValue(value: any): boolean;
            function withinRange(a: number, b: number, offset?: number): boolean;
            function withinFraction(lower: number, upper: number): boolean;
            function assignWhenNull(destination: {}, source: {}): void;
            function defaultWhenNull(options: {}, ...attrs: string[]): void;
            function minArray(list: number[]): number;
            function maxArray(list: number[]): number;
            function partitionArray<T>(list: T[], predicate: IteratorPredicate<T, boolean>): [T[], T[]];
            function retainArray<T>(list: T[], predicate: IteratorPredicate<T, boolean>): void;
            function spliceArray<T>(list: T[], item: T): boolean;
            function flatArray<T>(list: any[]): T[];
            function flatMap<T, U>(list: T[], predicate: IteratorPredicate<T, U>): U[];
            function sortArray<T>(list: T[], ascending: boolean, ...attrs: string[]): T[];
        }

        namespace xml {
            function formatPlaceholder(id: string | number, symbol?: string): string;
            function replacePlaceholder(value: string, id: string | number, content: string, before?: boolean): string;
            function replaceIndent(value: string, depth: number, pattern: RegExp): string;
            function replaceTab(value: string, spaces?: number, preserve?: boolean): string;
            function replaceEntity(value: string): string;
            function replaceCharacter(value: string): string;
            function parseTemplate(value: string): StringMap;
            function createTemplate(value: StringMap, data: ExternalData, index?: string): string;
        }
    }
}

export = squared.lib;