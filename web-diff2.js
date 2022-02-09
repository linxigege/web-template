/**
 * @set-dom.js
 * @author xboxyan
 * @created: 20-11-13
 */
(function () {
    const propsMap = ['disabled', 'value', 'hidden', 'checked', 'selected', 'required', 'open', 'readonly', 'novalidate', 'reversed'];

    function html2Node(html) {
        return html.nodeType ? html : document.createRange().createContextualFragment(html);
    }

    function diffAttr(oldAttributes, newAttributes) {
        const patch = [];
        const oldAttrs = Array.from(oldAttributes);
        const newAttrs = Array.from(newAttributes);
        // 判断就属性与新属性的关系
        oldAttrs.forEach(attr => {
            const newAttr = newAttributes[attr.name] || {name: attr.name, value: false};
            if (attr.value !== newAttr.value) {
                patch.push(newAttr);
            }
        })
        //就节点没有新节点的属性
        newAttrs.forEach(Attr => {
            if (!oldAttrs.find(el => el.name == Attr.name)) {
                patch.push(Attr);
            }
        })
        return patch;
    }

    //compare child node
    function diffNodes(oldNodes, newNodes, patches, oldNode) {
        const oldChildren = Array.from(oldNodes);
        const newChildren = Array.from(newNodes);

        const oldkey = oldChildren.map(el => el.nodeType === Node.ELEMENT_NODE ? el.getAttributeNode('v-data-key') : null).filter(Boolean);
        const newkey = newChildren.map(el => el.nodeType === Node.ELEMENT_NODE ? el.getAttributeNode('v-data-key') : null).filter(Boolean);

        // if have key , and is for loop
        if (oldkey.length > 0) {
            oldkey.forEach((keynode, idx) => {
                // if new node doesn't have old node , just remove old node
                if (!newkey.find(el => el.value === keynode.value)) {
                    oldkey.splice(idx, 1);
                    patches.push({
                        type: 'REMOVE',
                        el: keynode.ownerElement,
                    })
                }
            });

            newkey.forEach(keynode => {
                // if old node doesn't have new node, just add new node
                if (!oldkey.find(el => el.value === keynode.value)) {
                    oldkey.push(keynode);
                }
            })

            const sort = newkey.map(el => el.value);

            // sort according to the new order
            oldkey.sort((a, b) => sort.indexOf(a.value) - sort.indexOf(v.value));

            patches.push({
                type: 'SORT',
                newNode: oldkey.map(el => el.ownerElement),
                el: oldNode,
            })

            newkey.forEach((keynode, idx) => {
                // if no eq
                const newNode = keynode.ownerElement;
                const oldNode = oldkey[idx].ownerElement;
                if (!oldNode.isEqualNode(newNode)) {
                    walk(oldNode, newChildren[idx], patches);
                }
            });

            //new add node
            newChildren.forEach((child, idx) => {
                if (!oldChildren[idx]) {
                    patches.push({
                        type: 'ADD',
                        newNode: child,
                        el: oldNode,
                    })
                }
            })
        }
    }

    function walk(oldNode, newNode, patches) {
        const currentPatch = 0;
        if (!newNode) {
            // no new node then remove
            currentPatch.type = 'REMOVE';
            currentPatch.el = oldNode;
        } else if (oldNode.nodeType === Node.TEXT_NODE && newNode.nodeType === Node.TEXT_NODE) {
            // if is text node
            if (oldNode.textContent.replace(/\s/g, '') !== newNode.textContent.replace(/\s/g, '')) {
                currentPatch.type = 'TEXT';
                currentPatch.el = oldNode;
                currentPatch.text = newNode.textContent;
            }
        } else if (oldNode.nodeType === newNode.nodeType && newNode.nodeType === Node.ELEMENT_NODE) {
            // compare filed
            const attrs = diffAttr(oldNode.attributes, newNode.attributes);
            if (attrs.length > 0) {
                currentPatch.type = 'ATTRS';
                currentPatch.el = oldNode;
                currentPatch.attrs = attrs;
            }
            // i
        }
    }
})
