import React, { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";
import { filesQuery } from "./Files";
import Preview from "./Preview";
import styled from 'styled-components';

const DropZone = styled.div`
  height: 40vh;
  background-color: green;
  border-radius: 25px;
  padding: 15px 25px;
  text-align: center;
  margin-bottom: 10px;
`;

const DropMessage = styled.p`
  margin: 0;
  line-height: 40vh;
`;

const THUMBS = styled.ul`
display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    margin-top: 16px;
`;

const uploadFileMutation = gql`
  mutation UploadFile($file: Upload!, $description: String!) {
    uploadFile(file: $file, desc: $description)
  }
`;

const uploadFilesMutation = gql`
  mutation UploadFiles($files: [Upload], $data: [String]) {
    uploadFile(files: $files, data: $data)
  }
`;

export const Upload = () => {
  const [files, setFiles] = useState([]);
  const [rawFiles, setRawFiles] = useState([]);

  const [uploadFiles] = useMutation(uploadFilesMutation, {
    refetchQueries: [{ query: filesQuery }]
  });

  const submit = async () => {
    console.log(files);
    const d = files.map((file) => {
      console.log('preupload', file);
      return file.description;
    });
    await Promise.all(d);
    uploadFiles({ variables:  {files: rawFiles, data: d} });
setRawFiles([]);
    setFiles([]);
  }
  const onDrop = useCallback(
    (acceptedFiles) => {
      setRawFiles([...acceptedFiles, ...rawFiles])
      setFiles(
        acceptedFiles.map((file, i) => Object.assign({id: i}, file, {description: ""}, {
          preview: URL.createObjectURL(file)
        }))
        );
       
    },
    [uploadFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: 'image/*',
    onDrop: onDrop
  });

  useEffect(() => () => {
    // Make sure to revoke the data uris to avoid memory leaks
    files.forEach(file => URL.revokeObjectURL(file.preview));
  }, [files]);

  return (
    <>
      <DropZone {...getRootProps()}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <DropMessage>Drop the files here ...</DropMessage>
        ) : (
            <DropMessage>Drag 'n' drop some files here, or click to select files</DropMessage>
          )}
      </DropZone>
      <ul>
        {
          files.map(file => <Preview file={file} />)
        }
      </ul>
      <button onClick={() => submit()}>Submit</button>
    </>
  );
};
