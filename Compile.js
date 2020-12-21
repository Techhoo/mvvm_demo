class Compile {
    constructor(options) {
        const el = options.el;
        this.$el = el.nodeType === 1 ? el : document.querySelector(el);
        this.data = options.data;
        //真实dom添加到fragment中
        const fragment = this.element2Fragment(this.$el);

        //数据处理
        this.compile_init(fragment)

        //文档碎片添会到dom中
        this.$el.appendChild(fragment);
    }

    //模板中表达式替换
    compile_init(node) {
        const nodes = node.childNodes;
        Array.from(nodes).forEach(node => {
            //递归遍历所有子节点
            if (node.nodeType === 1 && node.childNodes.length) {
                this.compile_init(node);
            }
            const reg = /\{\{(.*)\}\}/;
            if (node.nodeType === 1 && node.childNodes.length === 0) {
                Array.from(node.attributes).forEach(attribute => {
                    if (attribute.name.startsWith('v-')) {
                        const attVal = node.getAttribute(attribute.name)
                        if (attribute.name.slice(2) === 'model') {
                            //更改节点
                            const val = this.getDataValByExp(attVal)
                            node.value = val;
                            node.addEventListener('input', event => {
                                this.data[attVal] = event.target.value;
                            });
                            node.removeAttribute('v-model');
                        }

                    }
                })
            }
            if (node.nodeType === 3 && reg.test(node.textContent)) {
                //根据表达式获取值
                const val = this.getDataValByExp(RegExp.$1)
                //替换值
                node.textContent = val;
                new Watcher(RegExp.$1, this.data, function (val) {
                    node.textContent = val;
                });
            }
        })
    }


    getDataValByExp(exp) {
        const arr = exp.split('.');
        //a.b.c  获取这样表达式的值
        const data = this.data;
        let val = data;
        arr.forEach(key => {
            val = val[key];
        })
        return val;
    }



    element2Fragment(el) {
        const fragment = document.createDocumentFragment();
        while (el.firstChild) {
            fragment.appendChild(el.firstChild)
        }
        return fragment
    }


}