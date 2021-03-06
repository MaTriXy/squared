import { ResourceStoredMapAndroid } from '../../@types/application';

import Resource from '../../resource';
import View from '../../view';

import { createStyleAttribute } from '../../lib/util';

const $util = squared.lib.util;

const STORED = <ResourceStoredMapAndroid> Resource.STORED;

export default class ResourceStyles<T extends View> extends squared.base.Extension<T> {
    public readonly eventOnly = true;

    public afterProcedure() {
        const styles: ObjectMap<string[]> = {};
        for (const node of this.application.session.cache) {
            if (node.visible) {
                const children = node.renderChildren;
                if (node.controlId && children.length > 1) {
                    const attrMap = new Map<string, number>();
                    let style = '';
                    let valid = true;
                    for (let i = 0; i < children.length; i++) {
                        let found = false;
                        children[i].combine('_', 'android').some(value => {
                            if (value.startsWith('style=')) {
                                if (i === 0) {
                                    style = value;
                                }
                                else if (style === '' || value !== style) {
                                    valid = false;
                                    return true;
                                }
                                found = true;
                            }
                            else {
                                attrMap.set(value, (attrMap.get(value) || 0) + 1);
                            }
                            return false;
                        });
                        if (!valid || (style !== '' && !found)) {
                            valid = false;
                            break;
                        }
                    }
                    if (valid) {
                        for (const [attr, value] of attrMap.entries()) {
                            if (value !== children.length) {
                                attrMap.delete(attr);
                            }
                        }
                        if (attrMap.size > 1) {
                            if (style !== '') {
                                style = $util.trimString(style.substring(style.indexOf('/') + 1), '"');
                            }
                            const common: string[] = [];
                            for (const attr of attrMap.keys()) {
                                const match = attr.match(/(\w+):(\w+)="([^"]+)"/);
                                if (match) {
                                    for (const item of children) {
                                        item.delete(match[1], match[2]);
                                    }
                                    common.push(match[0]);
                                }
                            }
                            common.sort();
                            let name = '';
                            for (const index in styles) {
                                if (styles[index].join(';') === common.join(';')) {
                                    name = index;
                                    break;
                                }
                            }
                            if (!(name !== '' && style !== '' && name.startsWith(`${style}.`))) {
                                name = $util.convertCamelCase((style !== '' ? `${style}.` : '') + $util.capitalize(node.controlId), '_');
                                styles[name] = common;
                            }
                            for (const item of children) {
                                item.attr('_', 'style', `@style/${name}`);
                            }
                        }
                    }
                }
            }
        }
        for (const name in styles) {
            const items: NameValue[] = [];
            for (const attr in styles[name]) {
                const match = $util.REGEXP_PATTERN.ATTRIBUTE.exec(styles[name][attr]);
                if (match) {
                    items.push({ name: match[1], value: match[2] });
                }
            }
            STORED.styles.set(name, { ...createStyleAttribute(), name, items, ids: [] });
        }
    }
}