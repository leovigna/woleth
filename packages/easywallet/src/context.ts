/* eslint-disable @typescript-eslint/no-empty-interface */
import { type Conversation, type ConversationFlavor } from "@grammyjs/conversations";
import { Context } from "grammy";
import { Command } from "./commands.js";

export interface ChatMessage {}
export interface ChatRoom {}
export interface ChatRoomId {}
export interface User {}

export interface MySessionState {
    //cached user
    user?: User;
    //cached chat room
    chatRoom?: ChatRoomId & ChatRoom;
    //cached chat history
    chatHistory: ChatMessage[];
    command?: Command;
    step: "idle"; //| typeof CHANGE_CHAT_MODE | typeof CREATE_ERC20_WITH_PARAMS;
}

export interface MySessionStateDefined {
    //cached user
    user: User;
    //cached chat room
    chatRoom: ChatRoomId & ChatRoom;
    //cached chat history
    chatHistory: ChatMessage[];
    command?: Command;
}

// For conversation support, you need to define a custom context type
export type MyContext = Context &
    ConversationFlavor & {
        session: MySessionState;
    };

//Context after `updateCtx()` has been called
export type MyContextDefined = Context &
    ConversationFlavor & {
        session: MySessionStateDefined;
    };
// Define the conversation type
export type MyConversation = Conversation<MyContext>;
