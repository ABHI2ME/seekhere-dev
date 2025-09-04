import { Kafka , CompressionTypes } from 'kafkajs'

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9092'],
})

export default {kafka  , CompressionTypes};