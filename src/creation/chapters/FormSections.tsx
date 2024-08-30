import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { Screen } from '../routes/SingleChapter';
import { Chapter } from '../routes/Chapters';
import { useNavigate } from 'react-router-dom';

interface FSProps {
  chapter: Chapter;
  screens: Screen[];
  submit: (screens: Screen[], chapter: Chapter) => void;
  addScreen: () => {};
  removeScreen: (id: string) => {};
}

const FormSections: React.FC<FSProps> = ({ chapter, screens, submit, addScreen, removeScreen }) => {
  const [title, setTitle] = useState<string>('');
  const [sections, setSections] = useState<Screen[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (chapter && !title) {
      setTitle(chapter.title);
    }
    if ( screens.length ) {
      setSections(screens);
    }
  }, [chapter, screens]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleSectionChange = (index: number, value: string) => {
    const newSections = [...sections];
    newSections[index].text = value;
    setSections(newSections);
  };

  const handleImageUpload = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newSections = [...sections];
      const imageUrls = Array.from(event.target.files).map(file => URL.createObjectURL(file));
      newSections[index].image = imageUrls[0];
      setSections(newSections);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ch = {...chapter, title: title};
    submit(sections, ch);
  };

  const addReplies = (id: string) => {
    navigate(`screens/${id}`);
  };

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
              rows={6}
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
              <ActionButton onClick={() => addReplies(section.id)}>Add Replies</ActionButton>
              <RemoveButton type="button" onClick={() => removeScreen(section.id)}>
                <DeleteIcon />
              </RemoveButton>
            </ActionButtons>
            <ImageList>
              <ImageThumbnail src={section.image} alt={`Section ${index + 1} Image`} />
            </ImageList>
          </SectionGroup>
        ))}
        <AddButton type="button" onClick={addScreen}>
          <AddIcon />
        </AddButton>
      </SectionsContainer>

      <SubmitButton type="submit">Submit</SubmitButton>
    </FormContainer>
  );
};

export default FormSections;

const FormContainer = styled.form`
  max-width: 800px;
  width: 50%;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-weight: bold;
  margin-bottom: 8px;
`;

const Input = styled.input`
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const SectionsContainer = styled.div`
  margin-bottom: 20px;
`;

const SectionGroup = styled.div`
  background-color: #e6e6e6;
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border-radius: 5px;
  border: 1px solid #ccc;
  margin-bottom: 10px;
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
`;

const Button = styled.button`
  padding: 10px 15px;
  font-size: 14px;
  border-radius: 5px;
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

  &:hover {
    background-color: #0056b3;
  }
`;

const SubmitButton = styled(Button)`
  background-color: #28a745;
  color: white;
  width: 100%;

  &:hover {
    background-color: #218838;
  }
`;

const ImageList = styled.div`
  margin-top: 10px;
`;

const ImageThumbnail = styled.img`
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #ccc;
`;
