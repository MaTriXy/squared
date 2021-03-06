/* android.widget 0.6.2
   https://github.com/anpham6/squared */

this.android = this.android || {};
this.android.widget = this.android.widget || {};
this.android.widget.bottomnavigation = (function () {
    'use strict';

    var $Resource = android.base.Resource;
    const $enum = squared.base.lib.enumeration;
    const $util = squared.lib.util;
    const $constA = android.lib.constant;
    const $enumA = android.lib.enumeration;
    const $utilA = android.lib.util;
    class BottomNavigation extends squared.base.Extension {
        constructor(name, framework, tagNames, options) {
            super(name, framework, tagNames, options);
            this.require("android.widget.menu" /* MENU */);
        }
        processNode(node, parent) {
            const options = $utilA.createViewAttribute(node.element ? this.options[node.element.id] : undefined);
            $util.defaultWhenNull(options, 'android', 'background', `?android:attr/windowBackground`);
            for (let i = 5; i < node.length; i++) {
                const item = node.item(i);
                item.hide();
                item.cascade().forEach(child => child.hide());
            }
            node.setControlType($constA.SUPPORT_ANDROID.BOTTOM_NAVIGATION, $enumA.CONTAINER_NODE.BLOCK);
            node.exclude({ resource: $enum.NODE_RESOURCE.ASSET });
            node.render(parent);
            const output = this.application.controllerHandler.renderNodeStatic($constA.SUPPORT_ANDROID.BOTTOM_NAVIGATION, node.renderDepth, $Resource.formatOptions(options, this.application.extensionManager.optionValueAsBoolean($constA.EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue')), 'match_parent', 'wrap_content', node);
            node.cascade().forEach(item => this.subscribersChild.add(item));
            this.setStyleTheme();
            return { output, complete: true };
        }
        postBaseLayout(node) {
            const renderParent = node.renderParent;
            if (renderParent) {
                if (!renderParent.has('width')) {
                    renderParent.android('layout_width', 'match_parent');
                }
                if (!renderParent.has('height')) {
                    renderParent.android('layout_height', 'match_parent');
                }
            }
            const menu = $util.optionalAsString(BottomNavigation.findNestedByName(node.element, "android.widget.menu" /* MENU */), 'dataset.layoutName');
            if (menu !== '') {
                const options = $utilA.createViewAttribute(node.element ? this.options[node.element.id] : undefined);
                $util.defaultWhenNull(options, 'app', 'menu', `@menu/${menu}`);
                node.app('menu', options.app.menu);
            }
        }
        setStyleTheme() {
            const options = $utilA.createStyleAttribute(Object.assign({}, this.options.resource));
            $util.defaultWhenNull(options, 'parent', 'Theme.AppCompat.Light.DarkActionBar');
            $Resource.addTheme(options);
        }
    }

    const bottomNavigation = new BottomNavigation("android.widget.bottomnavigation" /* BOTTOM_NAVIGATION */, 2 /* ANDROID */);
    if (squared) {
        squared.includeAsync(bottomNavigation);
    }

    return bottomNavigation;

}());
