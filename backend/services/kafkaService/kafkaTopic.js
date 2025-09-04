import {kafka} from "../../libs/kafka.js";

const createTopic = async () => {
    const admin = kafka.admin() ;
    await admin.connect() ;
    console.log("kafka connected to the broker") ;

    await admin.createTopics({

    // waitForLeaders: true ,

    topics: [{
        topic: "postLike",
        numPartitions: 2,
        replicationFactor: 1,
        configEntries: [
          { name: "retention.ms", value: "600000" },   // 10 min retention
          { name: "retention.bytes", value: "10485760" } // 10MB retention
        ],
      }],
    }) ;

      console.log("Topic 'postLike' created");
      await admin.disconnect();
}

export default createTopic ;