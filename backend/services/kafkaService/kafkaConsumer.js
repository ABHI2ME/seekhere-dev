import {kafka} from "../../libs/kafka.js";
import redisClient from "../../libs/redisDocker.js";
import prisma from "../../libs/prisma.js";

const kafkaConsumerRun = async () =>{
    const consumer = kafka.consumer({
        groupId:"kafka-consumers" ,
        sessionTimeout: 30000,       // default ~30s
        heartbeatInterval: 3000,     // default ~3s
        rebalanceTimeout: 60000 
    });
    await consumer.connect();
    console.log("consumer connected") ;
    await consumer.subscribe({topic: "post-like" ,fromBeginning : true}) ;

    await consumer.run({
        eachBatch : async ({batch, resolveOffset, heartbeat, commitOffsetsIfNecessary }) => {
            const updates = [] ;

            for(const message of batch.messages){
                const evt = JSON.parse(message.value.toString()) ;
                updates.push(evt) ;
                resolveOffset(message.offset) ;
                await heartbeat() ; 
            }

            if(updates.length){
                await prisma.$transaction(
                    updates.map((evt)=>{
                        return prisma.PostLikes.upsert({
                            where : {postId_userId: { postId: evt.postId, userId: evt.userId }} ,
                            create : {userId : evt.userId , postId : evt.postId , liked : evt.action === "LIKE"} ,
                            update : {liked : evt.action === "LIKE"},
                        })
                    }) 
                ) ;


                const pipeline = await redisClient.pipeline() ;
                for(const evt of updates){
                    const key = `post:${evt.postId}:likes` ;
                    if(evt.action === "LIKE"){
                        pipeline.incr(key) ;
                    }
                    else{
                        pipeline.decr(key) ;
                    }
                    pipeline.expire(key, 604800); // for the 7 days :) 
                }
                await pipeline.exec() ;


            };

            await commitOffsetsIfNecessary();
             
        }
    }) ;

}

export default kafkaConsumerRun ;
