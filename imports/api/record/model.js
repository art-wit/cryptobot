import { Class } from 'meteor/jagi:astronomy';

export const Record = Class.create({
  name: 'Record',
  fields: {
    // UNIX epoch timestamp in second as response id
    'timestamp': {
      type: Number,
      validators: [{
        type: 'integer',
      }],
    },
    // Currencies pair
    'pair': String,
  },
  behaviors: {
    timestamp: {
      hasCreatedField: true,
      createdFieldName: 'createdAt',
    },
  },
});
