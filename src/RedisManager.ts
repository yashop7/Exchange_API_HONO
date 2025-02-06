
import { createClient } from "redis";
import type { RedisClientType } from "redis";
import type { MessageFromOrderbook } from "./types";
import type { MessageToEngine } from "./types/to";

export class RedisManager {
    private client: RedisClientType; //Client is our PubSub
    private publisher: RedisClientType; //here the Publisher is the Queue
    private static instance: RedisManager;

    private constructor() {
        const redisUrl = process.env.UPSTASH_REDIS_REST_URL; // Your Upstash Redis URL
        const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN; // Your Upstash Redis token

        if (!redisUrl || !redisToken) {
            throw new Error("Redis URL and token must be provided in environment variables.");
        }


        this.client = createClient({
            url: redisUrl,
            password: redisToken
        });

        this.publisher = createClient({
            url: redisUrl,
            password: redisToken
        });

        this.client.connect();
        this.publisher.connect();
    }

    public static getInstance() {
        if (!this.instance)  {
            this.instance = new RedisManager();
        }
        return this.instance;
    }

    public sendAndAwait(message: MessageToEngine) {
        console.log("message: ", message.data);

        return new Promise<MessageFromOrderbook>((resolve) => { 
            //This Resolve is a Function which is called when we want something that promise need to return
            const id = this.getRandomClientId();
            console.log("id: ", id);
            this.client.subscribe(id, (message: string) => { //Before adding to the Queue, It is Subscribing the User to the PubSub
                this.client.unsubscribe(id); // When we get the Message from the PubSub then we UnSubscribes from the PubSub
                resolve(JSON.parse(message)); // message received will be returned to the user
            });
            //We will send the ID of PubSub to the Engine via Queue
            this.publisher.lPush("messages", JSON.stringify({ clientId: id, message })); //Here the Api Server adding the User in the Queue
        });
    }

    public getRandomClientId() { //This is the orderId of the Order
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

}