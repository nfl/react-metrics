export function addChildToNode(node, {tagName, attrs, content}) {
    const child = document.createElement(tagName);
    if (attrs) {
        Object.keys(attrs).forEach(key => {
            child.setAttribute(key, attrs[key]);
        });
    }
    if (content) {
        child.innerHTML = content;
    }
    node.appendChild(child);
    return node;
}

export function removeChildFromNode(node) {
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}
