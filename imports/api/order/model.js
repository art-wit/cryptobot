import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Class } from 'meteor/jagi:astronomy';
import Future from 'fibers/future';
import moment from 'moment';

export const OrderDeal = Class.create({
  name: 'OrderDeal',
  fields: {
    'external': String,
    'price': Number,
    'amount': Number,
    'timestamp': {
      type: Number,
      validators: [{
        type: 'integer',
      }],
    },
    'addedAt': Date,
  },
});

export const Order = Class.create({
  name: 'Order',
  collection: new Mongo.Collection('orders'),
  typeField: 'type',
  fields: {
    'siblingIds': {
      type: [String],
      default: () => [],
    },
    'pair': String,
    'amount': Number,
    'price': Number,
    'deals': {
      type: [OrderDeal],
      default: () => [],
    },
    'expired': {
      type: Boolean,
      optional: true,
    },
    'expiresAt': {
      type: Date,
      optional: true,
    },
    'closedAt': {
      type: Date,
      optional: true,
      index: true,
    },
  },
  helpers: {
    siblings() {
      return Order.find({ '_id': { $in: this.siblingIds } }).fetch();
    },
    isClosed() {
      return Boolean(this.closedAt);
    },
    isActive() {
      return !this.closedAt;
    },
    isLocked() {
      return this.lock && moment(this.lock.expiresAt).isSameOrAfter();
    },
    isExpired() {
      return this.expired || (this.expiresAt && moment(this.expiresAt).isBefore());
    },
    close() {
      this.closedAt = new Date();
      return this;
    },
    rest() {
      //XXX: Could be very small but not considered to be 0
      const closed = this.deals.reduce((memo, { amount }) => memo + amount, 0);
      return this.amount - closed;
    },
    total() {
      return this.amount * this.price;
    },
    actualTotal() {
      return this.deals.reduce((memo, { amount, price }) => memo + amount * price, 0);
    },
    actualPrice() {
      const total = this.deals.reduce((memo, { price }) => memo + price, 0);
      return total / this.deals.length;
    },
    actualAmount() {
      return this.deals.reduce((memo, { amount }) => memo + amount, 0);
    },
    margin() {
      return this.actualTotal() - this.total();
    },
  },
  behaviors: {
    timestamp: {
      hasCreatedField: true,
      createdFieldName: 'createdAt',
    },
  },
  indexes: {
    'pair_closedAt': {
      fields: {
        'pair': 1,
        'closedAt': 1,
      },
    },
  },
  events: {
    afterSave(e) {
      const order = e.currentTarget;
      if (order.isActive() && order.rest() === 0) {
        order.close().save();
      }
    },
  },
});

if (Meteor.isServer) {
  Order.findOneAndUpdate = function findOneAndUpdate(query, modifier) {
    const result = this.getCollection().rawCollection().findOneAndUpdate(query, modifier);
    const { value } = Future.fromPromise(result).wait();
    return Boolean(value);
  };
}

export const BuyOrder = Order.inherit({
  name: 'BuyOrder',
});

export const SellOrder = Order.inherit({
  name: 'SellOrder',
});