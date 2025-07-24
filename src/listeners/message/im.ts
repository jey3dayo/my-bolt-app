import { createChatHandler, imPreProcessor } from "../../lib/chat-handler.js";

const imCallback = createChatHandler<"message">("[IM]", imPreProcessor);

export default imCallback;
