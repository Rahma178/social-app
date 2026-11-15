
import { createClient, type RedisClientType } from "redis"
import { REDIS_URL } from "../config/config.service";

export class RedisService {

  private readonly redis_client: RedisClientType
  constructor() {
    this.redis_client = createClient({
      url: REDIS_URL
    });
    this.handleEvent()
  }


  handleEvent(){
    this.redis_client.on("error", (error)=>{
        console.log(`Redis Error: ${error.message}`);
        
    })
  }

  async connect() {
    this.redis_client.connect()
    console.log("Redis connected Successfully");
  }


  setValue = async ({ key, value, ttl } : {key:string, value:string, ttl:number}) => {
      try {
          value = typeof value == "string" ? value : JSON.stringify(value)
          ttl ?
              await this.redis_client.set(key, value, { EX: ttl }) :
              await this.redis_client.set(key, value)
      } catch (error) {
          console.log(error, "\nredis setValue failed");
      }
  }
  
  update = async ({ key, value, ttl } : {key:string, value:string, ttl:number}) => {
      try {
          if (!await this.redis_client.exists(key)) return 0
          await this.redis_client.set(key, value, { EX: ttl })
      } catch (error) {
          console.log(error, "\nredis update failed");
      }
  }
  
  getValue = async (key:string) => {
      try {
          try {
              return JSON.parse(await this.redis_client.get(key) as string)
          } catch (error) {
              return await this.redis_client.get(key)
          }
  
      } catch (error) {
          console.log(error, "\nredis get failed");
      }
  }
  
  
  ttl = async (key:string) => {
      try {
          return await this.redis_client.ttl(key)
      } catch (error) {
          console.log(error, "\nredis ttl failed");
      }
  }
  
  exists = async (key:string) => {
      try {
          return await this.redis_client.exists(key)
      } catch (error) {
          console.log(error, "\nredis exists failed");
      }
  }
  
  expire = async ({ key, ttl }: {key:string,  ttl:number}) => {
      try {
          return await this.redis_client.expire(key, ttl)
      } catch (error) {
          console.log(error, "\nredis expire failed");
      }
  }
  
  deleteKey = async (key:string) => {
      try {
          if (!key?.length) return 0
          return await this.redis_client.del(key)
      } catch (error) {
          console.log(error, "\nredis deleteKey failed");
      }
  }
  
  
  keys = async (key:string) => {
      try {
          return await this.redis_client.keys(`${key}*`)
      } catch (error) {
          console.log(error, "\nredis keys failed");
      }
  }
  
  incr = async (key:string) => {
      try {
          return await this.redis_client.incr(key)
      } catch (error) {
          console.log(error, "\nredis incr failed");
      }
  }

}

export default new RedisService()