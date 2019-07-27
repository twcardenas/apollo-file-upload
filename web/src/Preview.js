import React, {useState} from 'react';
import styled from 'styled-components';

const LI = styled.li`
display: inline-flex;
border: 1px solid black;
border-radius: 2px;
margin-bottom: 8px;
margin-right: 8px;
width: 100%;
height: 100px;
padding: 4px;
box-sizing: border-box;
`;
const IMG = styled.img`
display: block;
width: auto;
height: 100%;
`;

export default function Preview({file}) {
  const [preview, setPreview] = useState(file);
  const [description, setDescription] = useState("")

  return (
    <LI key={`${file.id}-${file.path}`}>
       <IMG
          src={file.preview}
          />
      <label htmlFor="desc">Description</label>
      <textarea rows="25" cols="50" type="text"
        id="desc" onChange={e => file.description = (e.target.value)} />
    </LI>
  )
}