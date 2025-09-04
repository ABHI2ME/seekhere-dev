import client from "../libs/redis.js";

const generateCooldownTime = async (email) =>{
    const key = `coolDownOtp:${String(email).toLocaleLowerCase()}` ;
    await client.set(key , "1" , "EX" , 4 * 60 * 60 ) ;
}

export default generateCooldownTime ;