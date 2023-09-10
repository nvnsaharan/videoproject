import React from 'react';
import { Tag } from 'antd';

import './chat.scss';
interface ChatProps {
  chatUser:Number;
}

const doctorConsultationLines = [
  "Hello, I'm Naveen, how can I help you today?",
  "Please tell me more about your symptoms and when they started.",
  "Have you experienced any changes in your medical history since our last visit?",
  "Let's discuss any medications or treatments you're currently using.",
  "Are you experiencing any pain or discomfort? If so, please describe it.",
  "It's important to understand your concerns fully, so please feel free to ask any questions.",
  "Based on your symptoms, I'm considering [possible diagnosis].",
  "Here are the treatment options available, and we can discuss the pros and cons of each.",
  "Let's create a personalized care plan tailored to your needs and preferences.",
  "Remember, I'm here to support you, so don't hesitate to reach out if you have any concerns or if your condition changes."
];

const ChatContainer : React.FunctionComponent<ChatProps> = (props) => {
  const { chatUser } = props
  return (
    <div className="chat-wrap">
      <div className='chat-user-detail'>
        <div className='chat-user-bio'>
          <h2>Naveen</h2>
          <div>
            <Tag color="magenta">Pregnant</Tag>
            <Tag color="red">Depressed</Tag>
            <Tag color="volcano">Disgusted</Tag>
          </div>
        </div>
        <ol className='user-problem-list'>
          <li>- Preparing for a baby can be financially challenging</li>
          <li>- Hormonal changes during pregnancy can influence mood.</li>
          <li>- Physical discomforts, such as morning sickness, fatigue, and back pain, can contribute to feelings of frustration or depression.</li>
        </ol>
      </div>
      <div className='chat-suggestion-message'>
        {doctorConsultationLines.map((line, index) => <div className='suggested-text' key={index}>{line}</div>)}
      </div>
      
    </div>
  );
};

export default ChatContainer;
