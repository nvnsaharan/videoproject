import React from 'react'
import './thanks.scss'
import { FrownOutlined, MehOutlined, SmileOutlined } from '@ant-design/icons';
import { Rate } from 'antd';

const customIcons: Record<number, React.ReactNode> = {
  1: <FrownOutlined />,
  2: <MehOutlined />,
  3: <SmileOutlined />
};

function Thanks() {
  return (
    <div className='main-page'>
      <h1 className='thanks-text'>Thank you for joining the session!</h1>
      <Rate character={({ index }: { index: number }) => customIcons[index + 1]} />
    </div>
  )
}

export default Thanks