import React from 'react';
import './LoginRegister.css'

const InputField = ({ type, value, onChange, placeholder, icon, innerRef }) => (
  <div className="input-box">
    <input
      ref={innerRef} 
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required
    />
    <img src={icon} alt={placeholder} width="18" height="18" />
  </div>
);

export default InputField;
