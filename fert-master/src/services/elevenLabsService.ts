import { Conversation } from '@elevenlabs/client';

export type VoiceMessage = {
  source: 'user' | 'ai';
  message: string;
};

export class ElevenLabsService {
    private conversation: any = null;

    constructor(private agentId: string) { }

    public async start(
        onConnect: () => void,
        onDisconnect: () => void,
        onError: (error: string) => void,
        onModeChange: (mode: { mode: 'speaking' | 'listening' }) => void,
        onMessage: (msg: VoiceMessage) => void,
    ) {
        try {
            // Request microphone permission
            await navigator.mediaDevices.getUserMedia({ audio: true });

            // Get a signed URL from the backend so the ElevenLabs API key
            // never leaves the server.
            let sessionOptions: Record<string, unknown>;
            try {
                const tokenRes = await fetch('/api/assistant/elevenlabs-token');
                const tokenData = await tokenRes.json();
                if (tokenRes.ok && tokenData?.signedUrl) {
                    sessionOptions = { signedUrl: tokenData.signedUrl };
                } else {
                    console.warn('Could not get signed URL, falling back to agentId:', tokenData?.message);
                    sessionOptions = { agentId: this.agentId };
                }
            } catch {
                sessionOptions = { agentId: this.agentId };
            }

            this.conversation = await Conversation.startSession({
                ...sessionOptions,
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
                onMessage: (msg: VoiceMessage) => {
                    console.log('ElevenLabs Message:', msg);
                    onMessage(msg);
                },
            } as any);
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
