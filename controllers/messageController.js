import Chat from "../models/Chat.js";
import axios from "axios";
import User from "../models/User.js";
import imagekit from "../configs/imageKit.js";
import openai from "../configs/openai.js";


// Text-based AI Chat Message controller
export const textMessageController = async (req, res)=>{
    try {
        const userId = req.user._id;

         // check credits
        if(req.user.credits < 1){
            return res.json({success: false, message: " You dont have the enough credits to use this feature"})
        }

        const {chatId, prompt} = req.body;

        const chat = await Chat.findOne({userId, _id: chatId})
        chat.messages.push({role: "user", content: prompt, timestamp: Date.now(),
       isImage: false})

       const {choices} = await openai.chat.completions.create({
    model: "gemini-2.5-flash",
    messages: [
        {
            role: "user",
            content: prompt,
        },
    ],
});

  const reply = {...choices[0].message,  timestamp: Date.now(),isImage: false}
      res.json({success: true, reply})

       
        chat.messages.push(reply)
       await chat.save();
       await User.updateOne({_id: userId},{$inc: {credits: -1}})

    } catch (error) {
        res.json({success: false, message: error})
    }
}

// Image generation message controller
export const imageMessageController = async (req, res)=>{
    try {
        const userId = req.user._id;
        // check credits
        if(req.user.credits < 2){
            return res.json({success: false, message: " You dont have the enough credits to use this feature"})
        }
        const {prompt, chatId, isPublished} = req.body;
        // Find chat
        const chat = await Chat.findOne({userId, _id: chatId})

        // Push user message
        chat.messages.push({
            role: "user", 
            content:prompt, 
            timestamp:Date.now(), 
            isImage: false});

            // Generate image using Pollinations.ai (free, no API key needed)
            const encodedPrompt = encodeURIComponent(prompt);
            const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true`;
            
            // Fetch the generated image
            const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            
            // Convert to base64
            const base64Image = `data:image/png;base64,${Buffer.from(imageResponse.data, 'binary').toString('base64')}`;
            
            // Upload to ImageKit
            const uploadResponse = await imagekit.upload({
                file: base64Image,
                fileName: `${Date.now()}.png`,
                folder: "quickgpt"
            });
            
            const reply = {
                role: 'assistant',
                content: uploadResponse.url,
                timestamp: Date.now(),
                isImage: true, 
                isPublished
            };
            
            res.json({success: true, reply});
            
            chat.messages.push(reply);
            await chat.save();
            await User.updateOne({_id: userId}, {$inc: {credits: -2}});

    } catch (error) {
        res.json({success: false, message: error.message})
    }
}


// API to get published images
