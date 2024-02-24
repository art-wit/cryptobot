import { Mongo } from 'meteor/mongo';
import { Enum } from 'meteor/jagi:astronomy';
import Future from 'fibers/future';
import { Record } from './model';

export const CandlePeriod = Enum.create({
  name: 'RangeRecordPeriod',
  identifiers: {
    ONE_MINUTE: '1min',
    FIVE_MINUTE: '5min',
    FIVETEEN_MINUTE: '15min',
    THIRTY_MINUTE: '30min',
    SIXTY_MINUTE: '60min',
    ONE_HOUR: '1hour',
    FOUR_HOUR: '4hour',
    ONE_DAY: '1day',
    ONE_WEEK: '1week',
    ONE_MONTH: '1mon',
    ONE_YEAR: '1year',
  },
});

export const CandleRecord = Record.inherit({
  name: 'CandleRecord',
  collection: new Mongo.Collection('record.candles'),
  fields: {
    'period': CandlePeriod,
    // Opening price during the interval
    'open': {
      type: Number,
      validators: [{
        type: 'gte',
        param: 0,
      }],
    },
    // Closing price during the interval
    'close': {
      type: Number,
      validators: [{
        type: 'gte',
        param: 0,
      }],
    },
    // Low price during the interval
    'low': {
      type: Number,
      validators: [{
        type: 'gte',
        param: 0,
      }],
    },
    // High price during the interval
    'high': {
      type: Number,
      validators: [{
        type: 'gte',
        param: 0,
      }],
    },
    // Aggregated trading volume during the interval (in base currency)
    'amount': {
      type: Number,
      validators: [{
        type: 'gte',
        param: 0,
      }],
    },
    // Aggregated trading value during the interval (in quote currency)
    'volume': {
      type: Number,
      validators: [{
        type: 'gte',
        param: 0,
      }],
    },
    // Number of trades during the interval
    'count': {
      type: Number,
      validators: [{
        type: 'integer',
      }],
    },
  },
  helpers: {
    diff() {
      return (this.close - this.open) / this.open;
    },
  },
  indexes: {
    'period_pair_timestamp': {
      fields: {
        'period': 1,
        'pair': 1,
        'timestamp': 1,
      },
      options: {
        unique: true,
      },
    },
  },
});

CandleRecord.touch = function(data) {
  const collection = this.getCollection().rawCollection();
  const result = collection.findOneAndUpdate({
    'period': data.period,
    'pair': data.pair,
    'timestamp': data.timestamp,
  }, {
    $set: data,
    $setOnInsert: {
      'createdAt': new Date(),
    },
  }, { upsert: true });
  Future.fromPromise(result).wait();
};