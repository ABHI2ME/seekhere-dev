import {kafka , CompressionTypes} from "../../libs/kafka.js";
import kafkaConsumerRun from "./kafkaConsumer.js";
import createTopic from "./kafkaTopic.js";


const producer = kafka.producer({
        idempotent: true, 
        maxInFlightRequests: 3,
        acks : "all" , 
          retry: {
          initialRetryTime: 300, // wait 300ms before first retry
          retries: 5             // attempt to retry 5 times
          } ,
     }) ;

     const buffer = [];
     const LINGER_MS = 10;          // small wait to batch (tune 5–50ms)
     const MAX_BATCH = 1000;   
     let timer = null;

export const start = async () =>{
     await producer.connect();
     await createTopic() ;
     await kafkaConsumerRun() ;
     console.log('connected to the producer and topic created') ;
}

export const  sendPostLike = async (evt)=>{
        buffer.push({
            key: String(evt.postId),
            value: JSON.stringify(evt),
            headers: { eventType: 'like' }
        }) ;
        if(buffer.length >= MAX_BATCH){
            flush() ;
        }
        else if(!timer){
             timer = setTimeout(() => {
                flush() ;
             } , LINGER_MS);
        }
     }

     async function flush(){
        if (!buffer.length) return;
        clearTimeout(timer);
        timer = null ;

        const batch = buffer.splice(0 , MAX_BATCH) ;
        console.log(batch) ;
        await producer.send({
            topic : "postLike" , 
            compression : CompressionTypes.GZIP, 
            messages : batch 
        })

     }


