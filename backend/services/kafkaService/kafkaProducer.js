import {kafka , CompressionTypes} from "../../libs/kafka.js";


const producer = kafka.producer({
        maxInFlightRequests: 1,
     }) ;

     const buffer = [];
     const LINGER_MS = 10;          // small wait to batch (tune 5–50ms)
     const MAX_BATCH = 1000;   
     let timer = null;

export const start = async () =>{
     await producer.connect();
     console.log('connected to the producer') ;
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
        await producer.send({
            topic : "postLike" , 
            compression : CompressionTypes.GZIP, 
            messaages : batch 
        })

     }


