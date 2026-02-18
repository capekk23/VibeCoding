import { useState, useEffect, useRef } from 'react';
import PublicChat from './chat/PublicChat';
import Rooms from './chat/Rooms';
import DirectMessages from './chat/DirectMessages';

export default function Chat({ user, chatType }) {
  if (chatType === 'public') {
    return <PublicChat user={user} />;
  } else if (chatType === 'rooms') {
    return <Rooms user={user} />;
  } else if (chatType === 'dm') {
    return <DirectMessages user={user} />;
  }

  return null;
}
