import React from 'react'
import { Input } from './Input'

const Dropdown = ({options,placeholder,label,value,onChange}) => {
  return (
      <div className='mb-4 '>
          {label && <label className='block mb-1 py-2 font-medium text-left'>{label}</label>}
          <select className='w-full py-2 border border-slate-300 rounded text-black font-semibold pl-2' value={value} onChange={(e) => onChange(e.target.value)}><option value="">{placeholder || "Select an Option"}</option>
              {options.map((option, index) => (
              <option key={index} value={option.value}>{option.label}</option>
          ))}</select>
    </div>
  )
}

export default Dropdown