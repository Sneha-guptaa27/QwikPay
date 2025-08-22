import React from 'react'
import image from "../Assets/Images/bill.jpg"


const SideCard = () => {
  return (
      <div className="w-[350px] h-[500px] bg-gradient-to-r from-primary to-third  mt-[10px] ml-[40px] rounded-2xl border-2 border-third">
          <div className='flex flex-col justify-items-center'>
              <div className='flex justify-center'><img src={image} className='h-[300px] w-[330px] p-[30px]'></img></div>
              <div className='flex justify-start ml-[30px] text-2xl font-bold text-white'>QwikSPLIT</div>
              <div className='flex justify-start ml-[30px] text-xl mt-[20px] font-medium'>Split Bills on One Tap</div>
              <div className='flex justify-center p-[25px] '><button className='h-[60px] w-[200px] border-2 bg-primary rounded-2xl font-bold'>GET STARTED</button></div>
          </div>
          
      </div>
  )
}

export default SideCard;