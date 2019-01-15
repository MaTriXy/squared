import { convertClockTime, sortNumber } from './lib/util';

const $util = squared.lib.util;

export default class SvgAnimation implements squared.svg.SvgAnimation {
    public attributeName = '';
    public to = '';
    public begin = [0];
    public duration: number;
    public parent?: squared.svg.SvgView | squared.svg.SvgPath;

    constructor(public element: SVGAnimationElement) {
        this.setAttribute('attributeName');
        this.setAttribute('to');
        const begin = this.getAttribute('begin');
        const dur = this.getAttribute('dur');
        if (/^[a-zA-Z]+$/.test(begin)) {
            this.begin.length = 0;
        }
        else if (begin !== '') {
            this.begin = sortNumber(begin.split(';').map(value => convertClockTime(value)));
        }
        if (dur === ''  || dur === 'indefinite') {
            this.duration = -1;
        }
        else {
            this.duration = convertClockTime(dur);
        }
    }

    public setAttribute(attr: string, equality?: string) {
        const value = this.getAttribute(attr);
        if (value) {
            if (equality !== undefined) {
                this[attr + $util.capitalize(equality)] = value === equality;
            }
            else {
                this[attr] = value;
            }
        }
    }

    public getAttribute(attr: string) {
        const item = this.element.attributes.getNamedItem(attr);
        return item ? item.value.trim() : '';
    }
}