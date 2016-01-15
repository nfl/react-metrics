const attr2obj = (elem, prefix = "data") => {
    const attrs = elem.attributes;
    const dataAttrs = {};
    const rdashAlpha = /-([\da-z])/gi;
    const fcamelCase = (all, letter) => {
        return letter.toUpperCase();
    };
    const camelCase = string => {
        return string.replace(rdashAlpha, fcamelCase);
    };

    if (elem.nodeType === 1) {
        let i = attrs.length;
        while (i--) {
            const name = attrs[i].name;
            if (name.indexOf(`${prefix}-`) === 0) {
                const camelName = camelCase(name.slice(prefix.length + 1));
                dataAttrs[camelName] = elem.getAttribute(name);
            }
        }
    }
    return dataAttrs;
};

export default attr2obj;
