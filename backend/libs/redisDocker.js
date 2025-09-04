import Redis from 'ioredis' ;

const redisClient = new Redis("redis://redis:6379") ;

redisClient.on("connect" , ()=>{
    console.log("redis from docker connected") ;
}) ;

redisClient.on("error" , (error)=>{
    console.log("error connecting to the docker redis " , error) ;
}) ;

export default redisClient ;

