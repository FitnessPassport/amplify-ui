import { AIConversation, ConversationMessage } from '@aws-amplify/ui-react-ai';
import '@aws-amplify/ui-react/styles.css';

const messages: ConversationMessage[] = [
  {
    role: 'user',
    content: [
      {
        text: 'hello',
      },
      {
        image: {
          format: 'png',
          source: {
            bytes: new Uint8Array([
              137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0,
              0, 0, 28, 0, 0, 0, 28, 8, 3, 0, 0, 0, 69, 211, 47, 166, 0, 0, 0,
              168, 80, 76, 84, 69, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64,
              0, 51, 51, 26, 26, 26, 23, 23, 46, 20, 20, 39, 18, 18, 36, 12, 24,
              36, 9, 26, 35, 15, 23, 38, 15, 29, 36, 12, 23, 41, 11, 28, 40, 13,
              26, 38, 12, 27, 39, 15, 26, 36, 14, 25, 39, 14, 24, 38, 13, 26,
              36, 13, 27, 38, 12, 27, 39, 12, 27, 37, 12, 27, 37, 12, 27, 39,
              12, 26, 38, 14, 26, 38, 13, 26, 38, 12, 26, 39, 13, 27, 38, 13,
              27, 38, 12, 26, 39, 14, 26, 38, 13, 26, 38, 13, 26, 38, 13, 26,
              38, 13, 26, 38, 13, 26, 38, 13, 26, 38, 13, 26, 38, 13, 27, 38,
              12, 26, 39, 14, 26, 38, 13, 26, 38, 13, 26, 38, 13, 26, 38, 12,
              26, 39, 13, 26, 38, 13, 26, 38, 13, 26, 38, 13, 26, 38, 13, 26,
              38, 13, 26, 38, 255, 255, 255, 26, 7, 228, 96, 0, 0, 0, 54, 116,
              82, 78, 83, 0, 1, 2, 3, 4, 5, 10, 11, 13, 14, 21, 29, 34, 35, 44,
              45, 60, 65, 70, 72, 73, 77, 95, 105, 123, 124, 125, 126, 128, 135,
              145, 153, 162, 165, 170, 174, 175, 176, 179, 209, 215, 220, 221,
              225, 226, 228, 229, 243, 245, 247, 249, 250, 252, 253, 138, 189,
              133, 44, 0, 0, 0, 1, 98, 75, 71, 68, 55, 48, 184, 184, 71, 0, 0,
              0, 214, 73, 68, 65, 84, 40, 207, 125, 147, 233, 22, 130, 32, 16,
              133, 49, 181, 210, 74, 203, 74, 219, 168, 44, 91, 21, 211, 22,
              222, 255, 209, 82, 212, 57, 160, 232, 253, 197, 229, 67, 206, 48,
              115, 69, 136, 147, 110, 219, 26, 146, 75, 245, 98, 74, 137, 167,
              202, 216, 236, 70, 153, 238, 139, 6, 26, 29, 41, 232, 58, 17, 208,
              96, 151, 82, 78, 159, 189, 1, 72, 113, 227, 114, 55, 140, 202, 69,
              236, 42, 101, 141, 151, 234, 139, 196, 52, 147, 106, 29, 232, 12,
              110, 225, 58, 31, 33, 31, 204, 154, 193, 39, 120, 7, 33, 7, 204,
              131, 193, 95, 101, 73, 246, 68, 149, 84, 238, 203, 32, 156, 197,
              185, 195, 96, 121, 72, 240, 48, 119, 6, 38, 117, 152, 158, 150,
              208, 213, 222, 244, 240, 226, 97, 104, 138, 253, 50, 35, 14, 70,
              93, 176, 243, 218, 162, 32, 163, 165, 160, 214, 167, 116, 54, 161,
              179, 125, 27, 121, 227, 87, 197, 200, 2, 217, 200, 206, 122, 125,
              216, 81, 99, 216, 153, 250, 98, 76, 222, 92, 76, 26, 1, 27, 183,
              71, 115, 46, 15, 53, 105, 13, 117, 38, 205, 178, 132, 223, 225,
              15, 14, 216, 81, 244, 178, 122, 71, 86, 0, 0, 0, 0, 73, 69, 78,
              68, 174, 66, 96, 130,
            ]),
          },
        },
      },
    ],
    conversationId: '1',
    id: '2',
    createdAt: new Date(2023, 4, 21, 15, 24).toDateString(),
  },
  {
    role: 'assistant',
    content: [
      {
        toolUse: {
          name: 'AMPLIFY_UI_foobar',
          input: { foo: 'bar' },
          toolUseId: '1234',
        },
      },
    ],
    conversationId: '1',
    id: '2',
    createdAt: new Date(2023, 4, 21, 15, 24).toDateString(),
  },
];

export default function Example() {
  return <AIConversation messages={messages} handleSendMessage={() => {}} />;
}
