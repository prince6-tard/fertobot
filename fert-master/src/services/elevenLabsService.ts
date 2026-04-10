import { Conversation } from '@elevenlabs/client';

export class ElevenLabsService {
    private conversation: any = null;

    constructor(private agentId: string) { }

    public async start(
        onConnect: () => void,
        onDisconnect: () => void,
        onError: (error: string) => void,
        onModeChange: (mode: { mode: 'speaking' | 'listening' }) => void,
    ) {
        try {
            // Request microphone permission
            await navigator.mediaDevices.getUserMedia({ audio: true });

            // Start the conversation
            this.conversation = await Conversation.startSession({
                agentId: this.agentId,
                // @ts-ignore
                connectionType: 'websocket', // Explicitly set connection type
                onConnect: () => {
                    console.log('ElevenLabs Connected');
                    onConnect();
                },
                onDisconnect: () => {
                    console.log('ElevenLabs Disconnected');
                    onDisconnect();
                },
                onError: (error: any) => {
                    console.error('ElevenLabs Error:', error);
                    onError(String(error));
                },
                onModeChange: (mode: { mode: 'speaking' | 'listening' }) => {
                    console.log('ElevenLabs Mode:', mode);
                    onModeChange(mode);
                },
            });
        } catch (error) {
            console.error('Failed to start conversation:', error);
            onError(String(error));
        }
    }

    public async stop() {
        if (this.conversation) {
            await this.conversation.endSession();
            this.conversation = null;
        }
    }
}
