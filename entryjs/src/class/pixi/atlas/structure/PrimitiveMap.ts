declare let _:any;
export class PrimitiveMap<T> {

    private _map:{[key:string]:T} = {};

    add(key:string|number, value:T) {
        this._map[key] = value;
    }

    getValue(key:string|number):T {
        return this._map[key];
    }

    hasValue(key:string|number):boolean {
        return Boolean(this._map[key]);
    }

    remove(key:string|number):T {
        var v:T = this._map[key];
        delete this._map[key];
        return v;
    }

    destroy():void {
        this._map = null;
    }

    each(f:(value:T, key:string|number)=>void):void {
        _.each(this._map, f);
    }

}