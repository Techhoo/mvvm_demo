class Watcher {
    constructor(exp, data, cb) {
        this.exp = exp;
        this.cb = cb;
        this.data = data;
        Dep.target = this;
        this.get();
        Dep.target = null;
    }

    get() {
        let val = this.data;
        const arr = this.exp.split('.');
        arr.forEach(key => {
            val = val[key];
        })

        return val;
    }

    update() {
        const val = this.get();
        this.cb(val);
    }
}




