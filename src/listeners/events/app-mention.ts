import { createChatHandler, appMentionPreProcessor } from "../../lib/chat-handler.js";

const appMentionCallback = createChatHandler<"app_mention">("[app_mention]", appMentionPreProcessor);

export default appMentionCallback;
