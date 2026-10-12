import React, { useEffect, useRef, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import Message from './Message'
import toast from 'react-hot-toast'


const Chatbox = () => {

    const containerRef = useRef(null)

    const {selectedChat, theme, user, axios, token, setUser} = useAppContext()

    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(false)

    const [prompt, setPrompt] = useState('')
    const [mode, setMode] = useState('text')
    const [isPublished, setIsPublished] = useState(false)

     const onSubmit = async (e) => {
        e.preventDefault()
        try {
            e.preventDefault()
            if (!user) return toast('Login to send the message')
                setLoading(true)
                const promptCopy = prompt
                setPrompt('')
                setMessages(prev => [...prev, {role: 'user', content: prompt, timestamp: Date.now(), isImage: false}])

                const { data } = await axios.post(
                `/api/message/${mode}`,
                { chatId: selectedChat._id, prompt: promptCopy, isPublished },
                { headers: { Authorization: token } }
)
                if(data.success){
                    setMessages(prev => [...prev, data.reply])
                    // decrease credits
                    if(mode==='image'){
                        setUser(prev => ({...prev, credits: prev.credits - 2}))
                    }else{
                        setUser(prev => ({...prev, credits: prev.credits - 1}))
                    }
                }else{
                    toast.error(data.message)
                    setPrompt(promptCopy)
                }
        }catch (error){
            toast.error(error.message)
        }finally{
            setPrompt('')
            setLoading(false)
        }
     }



      useEffect(()=> {
        if(selectedChat){
            setMessages(selectedChat.messages)
        }
      },[selectedChat])

      useEffect(()=>{
        if(containerRef.current){
            containerRef.current.scrollTo({
                top: containerRef.current.scrollHeight,
                behavior: "smooth",
            })
        }
      },[messages])

  return (
    <div className='flex-1 flex flex-col justify-between m-5 md:m-10 xl:mx-30 max-md:mt-14 2xl:pr-40'>
      
       {/* Chat Messages */}
        <div ref={containerRef} className='flex-1 mb-5 overflow-y-scroll'>
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

            {/* Three Dots Loading */}
            {
                loading && <div className='loader flex items-center gap-1.5'>
                    <div className='w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce'></div>
                    <div className='w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce'></div>
                    <div className='w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce'></div>

                </div>
            }
        </div>

        {mode === 'image' && (
            <label className='inline-flex items-center gap-2 mb-3 text-sm mx-auto cursor-pointer'>
                <p className='text-xs dark:text-[#e6f7f7]'>Publish Generated Image to Community</p>
                <input
                    type="checkbox"
                    className='cursor-pointer accent-[#0a9090]'
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                />
            </label>
        )}

        {/* Prompt Input Box */}
        <form onSubmit={onSubmit} className='bg-primary/20 dark:bg-[#0a9090]/30 border border-primary dark:border-[#0097b2]/30 rounded-full w-full max-w-2xl pl-4 pr-2 py-2 mx-auto flex gap-4 items-center'>
            <select onChange={(e)=> setMode(e.target.value)} value={mode} className='text-sm pl-3 pr-2 outline-none dark:text-white'>
                <option value="text" className='dark:bg-green-900'>Text</option>
                <option value="image" className='dark:bg-green-900'>Image</option>
            </select>
            <input onChange={(e)=>setPrompt(e.target.value)} value={prompt} type="text" placeholder='Type your prompt here ...' className='flex-1 w-full text-sm outline-none dark:text-white' required />
            <button disabled={loading}>
                <img src={loading ? assets.stop_icon : assets.send_icon} alt="" className='w-8 cursor-pointer' />
            </button>
        </form>

    </div>
  )
}

export default Chatbox