import Interval from './Interval.model'

export default interface Rule {
    date?: string,
    day: number;
    interval: Interval;
}
