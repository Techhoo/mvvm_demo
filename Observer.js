class Observer {
    constructor(data) {
        if (typeof data !== 'object') {
            console.log('data值必须为对象');
            return
        }
        
        this.observe(data);
    }

    observe(data) {
        Object.keys(data).forEach(key => {
            if (typeof data[key] === 'object') {
                this.observe(data[key]);
            }
            this.defineReactive(data, key, data[key])
        })
    }

    //设置属性为响应式属性
    defineReactive(data, key, val) {
        //每个属性都有个dep容器,用来存储watcher
        const dep = new Dep();
        Object.defineProperty(data, key, {
            configurable: false,
            enumerable: true,
            get() {
                Dep.target && dep.addSub(Dep.target)
                console.log(dep);
                return val;
            },
            set(newVal) {
                console.log('set', key);
                if (val !== newVal) {
                    val = newVal;
                    if (typeof newVal === 'object') {
                        this.observe(newVal);
                    }
                    //通知对应watcher更新
                    dep.notify();
                }
            }
        })
    }
}

//watcher容器
class Dep {
    constructor() {
        this.subs = [];
    }

    addSub(watcher) {
        this.subs.push(watcher)
    }

    notify() {
        this.subs.forEach(watcher => watcher.update())
    }
}