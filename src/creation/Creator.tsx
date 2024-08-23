import { useState } from "react";
import FormSections from "./FormSections";
import styled from '@emotion/styled';
import ChapterSelector from "./ChapterSelector";
import RepliesCreator from "./RepliesCreator";
import AddOns from "./AddOns";

export interface SelectedSection {
    id: string;
    text: string;
}

const Creator: React.FC = () => {
    const [currentImages, setCurrentImages] = useState<string[]>([]);
    const [selectedChapter, setSelectedChapter] = useState<string>('');
    const [selectedSection, setSelectedSection] = useState<SelectedSection>();

    return (
        <>
            <AddOns />
            {!selectedSection && <Base>
                <ChapterSelector setSelectionId={setSelectedChapter} isSelectingChapter={true} isSelectingSection={false}/>
                <FormSections selectedChapter={selectedChapter} currentImages={currentImages} setCurrentImages={setCurrentImages} setSelectedSection={setSelectedSection} />
                {currentImages && currentImages.map( (image, imgIndex) => (
                    <ImageThumbnail key={imgIndex+'sidebar'} src={image} alt={`Image ${imgIndex + 1}`} />
                ) )}
            </Base>}
            {selectedSection && <Base>
                <RepliesCreator id={selectedSection.id} text={selectedSection.text}></RepliesCreator>
            </Base>}
        </>
    )
}

export default Creator;

const Base = styled.div`
    display: flex;
    justify-content: space-between;
    max-width: 1100px;
`;

const ImageThumbnail = styled.img`
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #ccc;
`;