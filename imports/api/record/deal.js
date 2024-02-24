import { Mongo } from 'meteor/mongo';
import { Random } from 'meteor/random';
import Future from 'fibers/future';
import { Record } from './model';

export const DealRecord = Record.inherit({
  name: 'DealRecord',
  collection: new Mongo.Collection('record.deals'),
  typeField: 'type',
  fields: {
    // Unique trade ID on the market
    'external': String,
    // Volume of the trade
    'amount': {
      type: Number,
      validators: [{
        type: 'gte',
        param: 0,
      }],
    },
    // Price of the trade
    'price': {
      type: Number,
      validators: [{
        type: 'gte',
        param: 0,
      }],
    },
  },
  indexes: {
    'pair_external': {
      fields: {
        'pair': 1,
        'external': 1,
      },
      options: {
        unique: true,
      },
    },
  },
});

DealRecord.touch = function(data) {
  this.insert(data);
  // const collection = this.getCollection().rawCollection();
  // const result = collection.findOneAndUpdate({
  //   'pair': data.pair,
  //   'external': data.external,
  // }, {
  //   $set: data,
  //   $setOnInsert: {
  //     '_id': Random.id(),
  //     'type': this.className,
  //     'createdAt': new Date(),
  //   },
  // }, { upsert: true });
  // Future.fromPromise(result).wait();
};

export const BuyDealRecord = DealRecord.inherit({
  name: 'BuyDealRecord',
});

export const SellDealRecord = DealRecord.inherit({
  name: 'SellDealRecord',
});
