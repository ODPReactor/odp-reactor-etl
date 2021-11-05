export class ProgressCounter {

    private currentCount: number

    constructor(private initialCount : number, private totalCount : number) {
        this.currentCount = initialCount
    }

    updateProgress(quantity: number) : number {
        if (this.currentCount === this.totalCount) {
            return this.currentCount
        }
        if (this.currentCount + quantity < this.totalCount) { 
            this.currentCount += quantity 
        }
        else {
            this.currentCount = this.totalCount
        }
        return this.currentCount
    }

    getProgress(percentage=true, int=true, decimals=2) {
        const progress = this.currentCount / this.totalCount
        const progressToReturn =  percentage ?  progress * 100 : progress
        return percentage && int ? Math.round(progressToReturn) : toFixedNumber(progressToReturn, 2, 10)
    }
}

function toFixedNumber(num : number, digits : number, base : number){
    var pow = Math.pow(base||10, digits);
    return Math.round(num*pow) / pow;
  }