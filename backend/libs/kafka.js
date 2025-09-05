import { Kafka , CompressionTypes } from 'kafkajs';
import dotenv from 'dotenv' ;
dotenv.config() ;

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: process.env.KAFKA_BROKERS.split(","),
})

export  {kafka  , CompressionTypes};