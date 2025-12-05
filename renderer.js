"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReactorUMG = void 0;
const Reconciler = require("react-reconciler");
const UE = require("ue");
const converter_1 = require("./converter");
const REACT_ELEMENT_TYPE = typeof Symbol === 'function' ? Symbol.for('react.element') : 0;
function isReactElement(value) {
    return value && typeof value === 'object' && value.$$typeof === REACT_ELEMENT_TYPE;
}
function isPlainObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function normalizeComparableChildren(value) {
    if (value === undefined || value === null) {
        return [];
    }
    const arrayified = Array.isArray(value) ? value : [value];
    return arrayified.filter((item) => !isReactElement(item));
}
/**
 * Compares two values for deep equality.
 *
 * Mirrors the semantics used by findChangedProps so React props trigger updates
 * only when a meaningful difference is detected.
 */
function deepEquals(x, y) {
    const seen = new WeakMap();
    const hasOwn = Object.prototype.hasOwnProperty;
    const equals = (left, right) => {
        if (left === right) {
            return true;
        }
        // functions always considered different to force updates
        if (typeof left === 'function' || typeof right === 'function') {
            return false;
        }
        if (left === null || right === null || left === undefined || right === undefined) {
            return left === right;
        }
        if (Array.isArray(left) && Array.isArray(right)) {
            if (left.length !== right.length) {
                return false;
            }
            for (let i = 0; i < left.length; i++) {
                if (!equals(left[i], right[i])) {
                    return false;
                }
            }
            return true;
        }
        if (isPlainObject(left) && isPlainObject(right)) {
            let set = seen.get(left);
            if (!set) {
                set = new WeakSet();
                seen.set(left, set);
            }
            if (set.has(right)) {
                return true; // already compared this pair
            }
            set.add(right);
            const leftKeys = Object.keys(left);
            const rightKeys = Object.keys(right);
            let normalizedLeftChildren;
            let normalizedRightChildren;
            for (const key of leftKeys) {
                if (key.startsWith('_') || key.startsWith('$$')) {
                    continue;
                }
                if (key === 'children') {
                    normalizedLeftChildren ??= normalizeComparableChildren(left[key]);
                    normalizedRightChildren ??= normalizeComparableChildren(right[key]);
                    if (normalizedLeftChildren.length !== normalizedRightChildren.length) {
                        return false;
                    }
                    for (let i = 0; i < normalizedLeftChildren.length; i++) {
                        if (!equals(normalizedLeftChildren[i], normalizedRightChildren[i])) {
                            return false;
                        }
                    }
                    continue;
                }
                if (!hasOwn.call(right, key)) {
                    return false;
                }
                if (!equals(left[key], right[key])) {
                    return false;
                }
            }
            for (const key of rightKeys) {
                if (key.startsWith('_') || key.startsWith('$$')) {
                    continue;
                }
                if (!hasOwn.call(left, key)) {
                    if (key === 'children') {
                        normalizedRightChildren ??= normalizeComparableChildren(right[key]);
                        return normalizedRightChildren.length === 0;
                    }
                    return false;
                }
                if (key === 'children' && normalizedLeftChildren === undefined) {
                    normalizedLeftChildren = normalizeComparableChildren(left[key]);
                    normalizedRightChildren = normalizeComparableChildren(right[key]);
                    if (normalizedLeftChildren.length !== normalizedRightChildren.length) {
                        return false;
                    }
                    for (let i = 0; i < normalizedLeftChildren.length; i++) {
                        if (!equals(normalizedLeftChildren[i], normalizedRightChildren[i])) {
                            return false;
                        }
                    }
                }
            }
            return true;
        }
        return false;
    };
    return equals(x, y);
}
class UMGWidget {
    native;
    typeName;
    props;
    rootContainer;
    // isContainer: boolean;
    converter;
    parentFiber;
    parentProps;
    constructor(typeName, props, rootContainer, parentFiber) {
        this.typeName = typeName;
        this.rootContainer = rootContainer;
        this.parentFiber = parentFiber;
        this.parentProps = this.getParentProps();
        this.props = { ...props, __parentProps: this.parentProps };
        this.init();
    }
    init() {
        try {
            const WidgetTreeOuter = this.rootContainer.widgetTree;
            this.converter = (0, converter_1.createElementConverter)(this.typeName, this.props, WidgetTreeOuter);
            this.native = this.converter.createWidget();
            const shouldIgnore = this.converter?.ignore === true;
            if (this.native === null && !shouldIgnore) {
                console.warn("Not supported widget: " + this.typeName);
            }
        }
        catch (e) {
            console.error("Failed to create widget: " + this.typeName + ", error: " + e);
            console.error(e.stack);
        }
    }
    update(oldProps, newProps) {
        if (this.native !== null) {
            this.props = { ...newProps, __parentProps: this.parentProps };
            this.converter.updateWidget(this.native, oldProps, newProps);
        }
    }
    appendChild(child) {
        const shouldForceAppend = child.converter?.forceAppend === true;
        if ((shouldForceAppend && this.native && child)
            || (this.native && child && child.native)) {
            this.converter.appendChild(this.native, child.native, child.typeName, child.props);
        }
    }
    removeChild(child) {
        const shouldForceAppend = child.converter?.forceAppend === true;
        if ((shouldForceAppend && this.native && child) ||
            (this.native && child && child.native)) {
            this.converter.removeChild(this.native, child.native);
        }
    }
    getParentProps() {
        if (this.parentFiber) {
            const memoizedProps = this.parentFiber.memoizedProps ?? this.parentFiber.memorizedProps;
            if (memoizedProps) {
                return memoizedProps;
            }
        }
        return {};
    }
}
class RootContainer {
    widgetTree;
    reconcilerContainer;
    constructor(nativePtr) {
        this.widgetTree = nativePtr;
    }
    appendChild(child) {
        if (child?.native) {
            UE.UMGManager.AddRootWidgetToWidgetTree(this.widgetTree, child.native);
        }
    }
    removeChild(child) {
        if (child?.native) {
            UE.UMGManager.RemoveRootWidgetFromWidgetTree(this.widgetTree, child.native);
        }
    }
    clearAllWidgets() {
        this.widgetTree.RootWidget = null;
    }
}
const hostConfig = {
    getRootHostContext() { return {}; },
    //CanvasPanel()的parentHostContext是getRootHostContext返回值; 累加父元素class以便后代样式解析
    getChildHostContext(parentHostContext, _type, props) {
        return {};
    },
    appendInitialChild(parent, child) { parent.appendChild(child); },
    appendChildToContainer(container, child) { container.appendChild(child); },
    appendChild(parent, child) { parent.appendChild(child); },
    createInstance(type, props, rootContainer, hostContext, internalHandle) {
        return new UMGWidget(type, props, rootContainer, internalHandle.return ?? null);
    },
    createTextInstance(text, rootContainer, hostContext, internalHandle) {
        return new UMGWidget("text", { text: text, _children_text_instance: true }, rootContainer, internalHandle.return ?? null);
    },
    finalizeInitialChildren() { return false; },
    getPublicInstance(instance) { return instance.native; },
    prepareForCommit(containerInfo) { },
    resetAfterCommit(container) { },
    resetTextContent(instance) { },
    shouldSetTextContent(type, props) {
        const textContainers = new Set([
            'text', 'span', 'p', 'textarea', 'label', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'
        ]);
        const children = props && props.children;
        return textContainers.has(type) && (typeof children === 'string' || typeof children === 'number');
    },
    commitTextUpdate(textInstance, oldText, newText) {
        if (textInstance != null && oldText != newText) {
            textInstance.update({}, { text: newText });
        }
    },
    prepareUpdate(instance, type, oldProps, newProps) {
        try {
            return !deepEquals(oldProps, newProps);
        }
        catch (e) {
            console.error(e.message);
            return true;
        }
    },
    commitUpdate(instance, updatePayload, type, oldProps, newProps) {
        try {
            instance.update(oldProps, newProps);
        }
        catch (e) {
            console.error("commitUpdate fail!, " + e + "\n" + e.stack);
        }
    },
    removeChildFromContainer(container, child) { container.removeChild(child); },
    removeChild(parent, child) {
        parent.removeChild(child);
    },
    clearContainer(container) { },
    getCurrentEventPriority() { return 0; },
    getInstanceFromNode(node) { return undefined; },
    beforeActiveInstanceBlur() { },
    afterActiveInstanceBlur() { },
    prepareScopeUpdate(scopeInstance, instance) { },
    getInstanceFromScope(scopeInstance) { return null; },
    detachDeletedInstance(node) { },
    supportsMutation: true,
    isPrimaryRenderer: true,
    supportsPersistence: false,
    supportsHydration: false,
    noTimeout: undefined,
    preparePortalMount() { },
    scheduleTimeout: setTimeout,
    cancelTimeout: clearTimeout
    //useSyncScheduling: true,
    // scheduleDeferredCallback: undefined,
    // shouldDeprioritizeSubtree: undefined,
    // setTimeout: undefined,
    // clearTimeout: undefined,
    // cancelDeferredCallback: undefined,
};
const reconciler = Reconciler(hostConfig);
exports.ReactorUMG = {
    render: function (inWidgetTree, reactElement) {
        if (inWidgetTree == undefined) {
            throw new Error("init with ReactorUIWidget first!");
        }
        const root = new RootContainer(inWidgetTree);
        const container = reconciler.createContainer(root, 0, null, false, false, "", null, null);
        root.reconcilerContainer = container;
        reconciler.updateContainer(reactElement, container, null, null);
        return root;
    },
    release: function (root) {
        reconciler.updateContainer(null, root.reconcilerContainer, null, null);
    }
};
//# sourceMappingURL=renderer.js.map