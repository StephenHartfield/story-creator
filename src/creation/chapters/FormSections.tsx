import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { Screen, screenDBKey } from '../routes/SingleChapter';
import { Chapter } from '../routes/Chapters';
import { Link, useNavigate } from 'react-router-dom';
import { ProjectSlim } from '../routes/Projects';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

interface FSProps {
  chapter: Chapter;
  screens: Screen[];
  submit: (screens: Screen[], chapter: Chapter) => void;
  activeProject: ProjectSlim;
  addImageFile: (file: File) => void;
  addScreen: () => {};
  removeScreen: (id: string) => {};
}

const FormSections: React.FC<FSProps> = ({ chapter, screens, submit, activeProject, addImageFile, addScreen, removeScreen }) => {
  const [title, setTitle] = useState<string>('');
  const [chImage, setChImage] = useState<string>('');
  const [chImageLocal, setChImageLocal] = useState<string>('');
  const [sections, setSections] = useState<Screen[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (chapter && !title) {
      setTitle(chapter.title);
    }
    if (chapter.imageLocal && !chImageLocal) {
      setChImageLocal(chapter.imageLocal);
    }
    if (screens.length) {
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
      addImageFile(event.target.files[0]);
      const imageUrl = URL.createObjectURL(event.target.files[0]);
      if (index === 999) {
        setChImage(`${activeProject.id}/${event.target.files[0].name}`);
        setChImageLocal(imageUrl);
        return;
      }
      const newSections = [...sections];
      newSections[index].imageLocal = imageUrl;
      newSections[index].image = `${activeProject.id}/${event.target.files[0].name}`;
      setSections(newSections);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ch = { ...chapter, title: title, image: chImage };
    submit(sections, ch);
  };

  const addReplies = (id: string) => {
    navigate(`screens/${id}`);
  };

  const onDeleteImage = async(index: number) => {
    const copySections = [...sections];
    const copySingle = copySections[index];
    copySingle.imageLocal = '';
    copySingle.image = '';
    await updateDoc(doc(db, screenDBKey, copySingle.id), {...copySingle});
    copySections[index] = copySingle;
    setSections(copySections);
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
        <ActionButtons>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(999, e)}
            style={{ display: 'none' }}
            id="upload-chapter"
          />
          <ActionButton as="label" htmlFor={'upload-chapter'}>
            Default Chapter Image
          </ActionButton>
          <ActionButton as="label">
            Default Sound
          </ActionButton>
          {chImageLocal && <img src={chImageLocal} style={{ width: '40px' }} />}
        </ActionButtons>
        <Link to={`/settings/chapters/${chapter.id}`}>Settings</Link>
      </FormGroup>

      <SectionsContainer>
        {sections.map((section, index) => (
          <SectionGroup key={index}>
            <h2>Screen {index + 1}</h2>
            <TextArea
              value={section.text}
              onChange={(e) => handleSectionChange(index, e.target.value)}
              rows={6}
              placeholder={`Screen ${index + 1}`}
            />
            <ActionButtons>
              <input
                type="file"
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
              <Link to={`/testing/${section.id}`}>Test</Link>
              <Link to={`/settings/screens/${section.id}`}>Settings</Link>
              <RemoveButton type="button" onClick={() => removeScreen(section.id)}>
                <DeleteIcon />
              </RemoveButton>
            </ActionButtons>
            <ImageList>
              {section.imageLocal && (
                <ImageContainer>
                  <StyledImg src={section.imageLocal} alt={`Section ${index + 1} Image`} />
                  <DeleteButton onClick={() => onDeleteImage(index)}>
                    <DeleteIcon />
                  </DeleteButton>
                </ImageContainer>
              )}
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
  width: 700px;
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
  width: 700px;
`;

const SectionGroup = styled.div`
  background-color: #e6e6e6;
  width: 650px;
  max-width: 650px;
  padding: 15px 15px 30px;
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
  justify-content: flex-start;
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

const ImageContainer = styled.div`
  position: relative;
  display: inline-block;
  width: 150px;
  height: 150px;

  &:hover button {
    display: block;
  }
`;

const StyledImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
`;

const DeleteButton = styled.button`
  display: none;
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(255, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  padding: 5px;
  font-size: 16px;

  &:hover {
    background-color: rgba(255, 0, 0, 1);
  }
`;
