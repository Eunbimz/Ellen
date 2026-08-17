export type Message = {
    role: "user" | "assistant";
    content: string;
};

export type Conversation = {
    id: string;
    title: string;
    created_at: string;
    updated_at: string;
};
