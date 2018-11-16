//@flow

export class Debounce{
    
    timeout: any;
    duration: number;

    constructor(duration: number){
        this.duration = duration;
    }

    run(fn: ()=>void){
        clearTimeout(this.timeout);
        this.timeout = setTimeout(fn, this.duration);
    }
}