import React, { useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import Message from './Message'


const Chatbox = () => {

    const {selectedChat, theme} = useAppContext()

    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(false)

      useEffect(()=> {
        if(selectedChat){
            setMessages(selectedChat.messages)
        }
      },[selectedChat])
  return (
    <div className='flex-1 flex flex-col justify-between m-5 md:m-10 xl:mx-30 max-md:mt-14 2xl:pr-40'>
      
       {/* Chat Messages */}
        <div className='flex-1 mb-5 overflow-y-scroll'>
            {messages.length === 0 && (
                <div className='h-full flex flex-col items-center justify-center gap-2'>
                    <img 
                        src={theme === 'dark' ? assets.banner_dark : assets.banner} 
                        alt="Echo AI Chatbot" 
                        className='w-full max-w-3xl md:max-w-5xl' 
                    />
                </div>
            )}
            {messages.map((message, index)=> <Message key={index} message={message} />)}
        </div>

        {/* Prompt Input Box */}
        <form>

        </form>

    </div>
  )
}

export default Chatbox