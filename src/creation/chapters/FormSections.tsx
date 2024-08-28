import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import styled from '@emotion/styled';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
// import { Chapter } from './ChapterSelector';
import { SelectedSection } from '../Creator';

interface Section {
  text: string;
  image: string;
}


const FormSections = () => {
  const [title, setTitle] = useState<string>('');
  const [sections, setSections] = useState<Section[]>([{ text: '', image: '' }]);
  // const [chapterData, setChapterData] = useState<Chapter>();

  // useEffect(() => {
    //get cselected chapter id from route.
    // if ( props.selectedChapter ) {
    //   const matched = chaptersData.find( ch => ch.id===props.selectedChapter );
    //   if ( matched?.id ) {
    //     setChapterData(matched);
    //     setTitle(matched.title);
    //     setSections(matched.sections.map( s => ({text: s.text, image: s.image}) )); 
    //   }
    // }
  // }, [props.selectedChapter]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleSectionChange = (index: number, value: string) => {
    const newSections = [...sections];
    newSections[index].text = value;
    setSections(newSections);
  };

  const addSection = () => {
    setSections([...sections, { text: '', image: '' }]);
  };

  const removeSection = (index: number) => {
    const newSections = sections.filter((_, i) => i !== index);
    setSections(newSections);
  };

  const handleImageUpload = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newSections = [...sections];
      const imageUrls = Array.from(event.target.files).map(file => URL.createObjectURL(file));
      // props.setCurrentImages([...props.currentImages, imageUrls[0]]);
      newSections[index].image = imageUrls[0];
      setSections(newSections);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Title:', title);
    console.log('Sections:', sections);
  };

  const addReplies = ( index: number ) => {
    // possible if they're just creating it, then section won't have an id
    // if (!chapterData) {
      // create id by saving the chapter/section
    // }
    // const matchedSection = chapterData?.sections.find( (_, i) => i===index );
    // if( matchedSection?.id ) {
    //   props.setSelectedSection({id: matchedSection.id, text: matchedSection.text});
    // } else {
      // test purposes only
      // props.setSelectedSection({id: 'mocktestid', text: sections[0].text})
    // }
  }

  return (
    <FormContainer onSubmit={handleSubmit}>
      <FormGroup>
        <Label htmlFor="title">Title:</Label>
        <Input
          type="text"
          id="title"
          value={title}
          onChange={handleTitleChange}
        />
      </FormGroup>
      
      <SectionsContainer>
        {sections.map((section, index) => (
          <SectionGroup key={index}>
            <TextArea
              value={section.text}
              onChange={(e) => handleSectionChange(index, e.target.value)}
              rows={4}
              placeholder={`Screen ${index + 1}`}
            />
            <ActionButtons>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleImageUpload(index, e)}
                style={{ display: 'none' }}
                id={`upload-${index}`}
              />
              <ActionButton as="label" htmlFor={`upload-${index}`}>
                Add Image
              </ActionButton>
              <ActionButton type="button">Add Sound</ActionButton>
              <ActionButton onClick={() => addReplies(index)}>Add Replies</ActionButton>
              <RemoveButton type="button" onClick={() => removeSection(index)}>
                <DeleteIcon />
              </RemoveButton>
            </ActionButtons>
            <ImageList>
                <ImageThumbnail src={section.image} alt={`Section ${index + 1} Image`} />
            </ImageList>
          </SectionGroup>
        ))}
        <AddButton type="button" onClick={addSection}>
          <AddIcon />
        </AddButton>
      </SectionsContainer>

      <SubmitButton type="submit">Submit</SubmitButton>
    </FormContainer>
  );
};

export default FormSections;

// Styled-components with Emotion

const FormContainer = styled.form`
  max-width: 600px;
  width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f4f4f4;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Label = styled.label`
  margin-bottom: 5px;
  font-weight: bold;
  text-align: center;
`;

const Input = styled.input`
  width: 100%;
  max-width: 400px;
  padding: 10px;
  font-size: 16px;
  border-radius: 4px;
  border: 1px solid #ccc;
`;

const SectionsContainer = styled.div`
  width: 100%;
  margin-bottom: 20px;
`;

const SectionGroup = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
`;

const TextArea = styled.textarea`
  flex-grow: 1;
  padding: 10px;
  font-size: 16px;
  border-radius: 4px;
  border: 1px solid #ccc;
  margin-right: 10px;
`;

const ActionButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Button = styled.button`
  padding: 10px;
  font-size: 14px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
`;

const ActionButton = styled(Button)`
  background-color: #17a2b8;
  color: white;

  &:hover {
    background-color: #138496;
  }
`;

const RemoveButton = styled(Button)`
  background-color: #dc3545;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #c82333;
  }
`;

const AddButton = styled(Button)`
  background-color: #007bff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;

  &:hover {
    background-color: #0056b3;
  }
`;

const SubmitButton = styled(Button)`
  background-color: #28a745;
  color: white;

  &:hover {
    background-color: #218838;
  }
`;

const ImageList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-left: 20px;
`;

const ImageThumbnail = styled.img`
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #ccc;
`;
