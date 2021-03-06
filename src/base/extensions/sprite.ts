import { ImageAsset } from '../@types/application';

import Extension from '../extension';
import Node from '../node';

import { EXT_NAME } from '../lib/constant';

const $dom = squared.lib.dom;
const $util = squared.lib.util;

export default abstract class Sprite<T extends Node> extends Extension<T> {
    public condition(node: T) {
        let valid = false;
        if (node.hasWidth && node.hasHeight && node.length === 0 && !node.inlineText) {
            let url = node.css('backgroundImage');
            if (!$util.hasValue(url) || url === 'none') {
                url = '';
                const match = $util.REGEXP_PATTERN.URL.exec(node.css('background'));
                if (match) {
                    url = match[0];
                }
            }
            if (url !== '') {
                url = $dom.cssResolveUrl(url);
                const image = <ImageAsset> this.application.session.image.get(url);
                if (image) {
                    const fontSize = node.fontSize;
                    const width = $util.convertPercentPX(node.has('width') ? node.css('width') : node.css('minWidth'), node.bounds.width, fontSize);
                    const height = $util.convertPercentPX(node.has('height') ? node.css('width') : node.css('minHeight'), node.bounds.height, fontSize);
                    const position = $dom.getBackgroundPosition(`${node.css('backgroundPositionX')} ${node.css('backgroundPositionY')}`, node.bounds, fontSize);
                    if (position.left <= 0 && position.top <= 0 && image.width > width && image.height > height) {
                        image.position = { x: position.left, y: position.top };
                        node.data(EXT_NAME.SPRITE, 'mainData', image);
                        valid = true;
                    }
                }
            }
        }
        return valid && (!$util.hasValue(node.dataset.use) || this.included(<HTMLElement> node.element));
    }
}