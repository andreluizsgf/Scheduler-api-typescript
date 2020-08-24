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
    const singleOccurrency = {date: "23-08-2020", intervals: [{start: "10:30", end: "11:30"}, {start: "15:30", end: "16:00"}]}
    RuleController.store(singleOccurrency, rulesDatabase);
    expect(rulesDatabase.size).toEqual(2) // In this case we create 2 intervals for the specific day 23-08-2020, wich is a sunday.
    dropDatabase()
  })
    
  test('should create weekly rule', () => {
    const weekly = {days: [0,2,4], intervals: [{start: "10:30", end: "11:30"}, {start: "15:30", end: "16:00"}]}
    RuleController.store(weekly, rulesDatabase);
    expect(rulesDatabase.size).toEqual(6) // In this case we create 2 intervals for the days [0, 2, 4].
    dropDatabase()
  })
  
  test('should create daily rule', () => {
    const daily = {intervals: [{start: "10:30", end: "11:30"}, {start: "15:30", end: "16:00"}]}
    RuleController.store(daily, rulesDatabase);
    expect(rulesDatabase.size).toEqual(14) // In this case we create 2 intervals for each day of the week. [0, 1, 2, 3, 4, 5, 6].
    dropDatabase()
  })

  test('should not create conflict dates', () => {
    const singleOccurrency = {date: "23-08-2020", intervals: [{start: "10:10", end: "10:31"}, {start: "11:00", end: "16:00"}]} //23-08-2020 is a Sunday
    RuleController.store(singleOccurrency, rulesDatabase);
    const conflictData = {days:[0], intervals: [{start: "10:05", end: "10:20"}, {start: "11:30", end: "15:00"}, {start: "10:10", end: "10:40"}, {start: "16:00", end: "16:01"},]} 
    RuleController.store(conflictData, rulesDatabase);
    expect(rulesDatabase.size).toEqual(3)
    dropDatabase()
  })

  test('should not create rule with end greater than start', () => {
    const singleOccurrency = {date: "23-08-2020", intervals: [{start: "15:00", end: "10:31"}, {start: "17:00", end: "16:00"}]}
    RuleController.store(singleOccurrency, rulesDatabase);
    expect(RuleController.store(singleOccurrency, rulesDatabase).size).toEqual(0)
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

describe('Available hours', () => {
  test('should get available hours within date range', () => {
    const weekly = {"days": [6], intervals: [{start: "15:00", end: "16:00"}, {start: "17:00", end: "18:00"}]}
    const singleOccurrency = {date: "23-08-2020", intervals: [{start: "15:00", end: "16:00"}, {start: "17:00", end: "18:00"}]}
    RuleController.store(weekly, rulesDatabase);
    RuleController.store(singleOccurrency, rulesDatabase);
    expect(RuleController.availableHours(rulesDatabase, '20-08-2020', '23-08-2020')).toEqual([
      {"day": "20-08-2020","intervals":[{"start": "00:00","end": "23:59"}]},
      {"day": "21-08-2020","intervals":[{"start": "00:00","end": "23:59"}]},
      {"day": "22-08-2020","intervals":[{"start": "00:00","end": "15:00"},{"start":"16:00", "end":"17:00"},{"start":"18:00", "end":"23:59"}]},
      {"day": "23-08-2020","intervals":[{"start": "00:00","end": "15:00"},{"start":"16:00", "end":"17:00"},{"start":"18:00", "end":"23:59"}]}
    ])
    dropDatabase()
  })

  test('should get error when try to get available hours without firstDay', () => {
    expect(RuleController.availableHours(rulesDatabase, '20-08-2020', undefined)).toEqual('Please inform valid firstDate and lastDate values.')
    expect(RuleController.availableHours(rulesDatabase, undefined, '23-08-2020')).toEqual('Please inform valid firstDate and lastDate values.')
    expect(RuleController.availableHours(rulesDatabase, undefined, undefined)).toEqual('Please inform valid firstDate and lastDate values.')
  })
})

describe('Rules delete', () => {
  test('should delete rule given ID', () => {
    const singleOccurrency = {date: "23-08-2020", intervals: [{start: "10:10", end: "10:31"}, {start: "11:00", end: "16:00"}]} //23-08-2020 is a Sunday
    RuleController.store(singleOccurrency, rulesDatabase);
    expect(RuleController.destroy(rulesDatabase, 1)).toEqual("Rule successfully deleted.")
    expect(rulesDatabase.size).toEqual(1)
    dropDatabase()
  })
  
  test('should not delete rule with wrong ID', () => {
    const singleOccurrency = {date: "23-08-2020", intervals: [{start: "10:10", end: "10:31"}, {start: "11:00", end: "16:00"}]} //23-08-2020 is a Sunday
    RuleController.store(singleOccurrency, rulesDatabase);
    expect(RuleController.destroy(rulesDatabase, 3)).toEqual("Rule not found. Enter a valid ID.")
    expect(rulesDatabase.size).toEqual(2)
    dropDatabase()
  })
})