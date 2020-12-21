class MVVM {
    constructor(options) {
        this.$options = options;
        let data = this._data = options.data;

        //vm代理vm._data
        this._proxy(data)

        //data数据劫持/监听  实现数据绑定
        new Observer(data)

        //模板编译
        new Compile(options);
        // const el = options.el;
        // this.$el = this.isElement(el) ? el : document.querySelector(el);
        // this.compile(this.$el);
    }

    observe(data) {
        Object.keys(data).forEach( key => {
            if (typeof data[key] === 'object') {
                this.observe(data[key]);
            }
            //每个属性有个dep容器,用来存储watcher
            const dep = new Dep();
            //存储val
            let val = data[key];
            Object.defineProperty(data, key, {
                configurable: false,
                enumerable: true,
                get() {
                    Dep.target && dep.addSub(Dep.target)
                    console.log('get了_data上的属性', key );
                    return val;
                },
                set(newVal) {
                    console.log('set了_data上的属性', key, newVal);
                    if (val !== newVal) {
                        if (typeof newVal === 'object') {
                            this.observe(newVal);
                        }
                        val = newVal;
                        dep.notify();
                    }
                }
            }) 
        })
    }

    //节点判断
    isElement(el) {
        return el.nodeType === 1
    }

    //编译模板
    compile(el) {
        //节点添加到fragment
        const fragment = this.element2Fragment(el);
        //替换遍历
        this.compile_init(fragment);
        //节点添加回页面
        el.appendChild(fragment);
    }

    //模板中表达式替换
    compile_init(node) {
        const nodes = node.childNodes;
        Array.from(nodes).forEach(node => {
            if (this.isElement(node) && node.childNodes.length) {
                this.compile_init(node);
            }
            const reg = /\{\{(.*)\}\}/;
            if (node.nodeType === 1 && node.childNodes.length === 0) {
                Array.from(node.attributes).forEach(attribute => {
                    if (attribute.name.startsWith ('v-')) {
                        const attVal = node.getAttribute(attribute.name)
                        if (attribute.name.slice(2) === 'model') {
                            //更改节点
                            const val = this.getDataValByExp(attVal)
                            node.value = val;
                            node.addEventListener('input', event => {
                                this[attVal] = event.target.value;
                            } );
                            node.removeAttribute('v-model');
                            // new Watcher(attVal, this._data, function (val) {
                            //     node.value = val;
                            // });
                        }
                        
                    }
                })
            }
            if (node.nodeType === 3 && reg.test(node.textContent)) {
                //根据表达式获取值
                const val = this.getDataValByExp(RegExp.$1)
                //替换值
                node.textContent = val;
                new Watcher(RegExp.$1, this._data, function (val) {
                    node.textContent = val;
                });
            }
        })
    }


    getDataValByExp(exp) {
        const arr = exp.split('.');
        //a.b.c  获取这样表达式的值
        const data = this._data;
        let val = data;
        arr.forEach( key => {
            val = val[key];
        })
        return val;
    }



    element2Fragment(el) {
        const fragment = document.createDocumentFragment();
        while(el.firstChild) {
            fragment.appendChild(el.firstChild)
        }
        return fragment
    }

    //数据代理
    _proxy(data) {
        Object.keys(data).forEach(key => {
            Object.defineProperty(this, key, {
                configurable: false,
                enumerable: true,
                get() {
                    return data[key]
                },
                set(newVal) {
                    data[key] = newVal
                }
            })
        })
    }
}