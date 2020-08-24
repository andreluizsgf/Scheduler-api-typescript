import * as RuleController from "./controllers/RuleController"
import Rule from "../models/Rule.model";

const rulesDatabase: Map<number, Rule> = new Map()

const dropDatabase = () => {
  rulesDatabase.clear()
}

test('should index all rules', () => {
    const rule: Rule = {day: 0, interval: {start: "10:30", end: "11:30"}}
    rulesDatabase.set(1, rule)
    expect(RuleController.index(rulesDatabase)).toEqual([{"day": 0, "interval": {"end": "11:30", "start": "10:30"}}]);
})

describe('Rules creation', () => {
  test('should create single occurrency rule', () => {
    const data = {date: "23-08-2020", intervals: [{start: "10:30", end: "11:30"}, {start: "15:30", end: "16:00"}]}
    RuleController.store(data, rulesDatabase);
    expect(rulesDatabase.size).toEqual(2)
    dropDatabase()
  })
    
  test('should create weekly rule', () => {
    const data = {days: [0,2,4], intervals: [{start: "10:30", end: "11:30"}, {start: "15:30", end: "16:00"}]}
    RuleController.store(data, rulesDatabase);
    expect(rulesDatabase.size).toEqual(6)
    dropDatabase()
  })
  
  test('should create daily rule', () => {
    const data = {intervals: [{start: "10:30", end: "11:30"}, {start: "15:30", end: "16:00"}]}
    RuleController.store(data, rulesDatabase);
    expect(rulesDatabase.size).toEqual(14)
    dropDatabase()
  })

  test('should not create conflict dates', () => {
    const data = {date: "23-08-2020", intervals: [{start: "10:10", end: "10:31"}, {start: "11:00", end: "16:00"}]} //23-08-2020 is a Sunday
    RuleController.store(data, rulesDatabase);
    const conflictData = {days:[0], intervals: [{start: "10:05", end: "10:20"}, {start: "11:30", end: "15:00"}, {start: "10:10", end: "10:40"}, {start: "16:00", end: "16:01"},]} 
    RuleController.store(conflictData, rulesDatabase);
    expect(rulesDatabase.size).toEqual(3)
    dropDatabase()
  })

  test('should not create rule with end greater than start', () => {
    const data = {date: "23-08-2020", intervals: [{start: "15:00", end: "10:31"}, {start: "17:00", end: "16:00"}]}
    RuleController.store(data, rulesDatabase);
    expect(RuleController.store(data, rulesDatabase).size).toEqual(0)
    dropDatabase()
  })

  test('should not create rule with end equal to start', () => {
    const singleOccurrency = {date: "23-08-2020", intervals: [{start: "15:00", end: "15:00"}, {start: "17:00", end: "17:00"}]}
    const daily = {intervals: [{start: "15:00", end: "15:00"}, {start: "17:00", end: "17:00"}]}
    const weekly = {"days": [0,1], intervals: [{start: "15:00", end: "15:00"}, {start: "17:00", end: "17:00"}]}
    RuleController.store(singleOccurrency, rulesDatabase);
    RuleController.store(daily, rulesDatabase);
    RuleController.store(weekly, rulesDatabase);
    expect(rulesDatabase.size).toEqual(0)
    dropDatabase()
  })
})

  