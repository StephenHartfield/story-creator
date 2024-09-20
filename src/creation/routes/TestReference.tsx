import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styled from "@emotion/styled";
import parse from "html-react-parser";
import DOMPurify from "dompurify";
import Loading from "../../Loading";
import useReferenceStore, { Reference } from "../stores/ReferenceStore";

interface ReferenceProps {
  referenceId: string;
}

const TestReference: React.FC<ReferenceProps> = ({ referenceId }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [imageBackground, setImageBackground] = useState<string>();
  const [reference, setReference] = useState<Reference>();
  const [defaultBg, setDefaultBackground] = useState<string>();
  const { getReferenceById } = useReferenceStore();

  useEffect(() => {
    const fetchScreen = async () => {
      setIsLoading(true);
      if (referenceId) {
        const reference = await getReferenceById(referenceId);
        if (reference) {
          // const setts = fetchSettings(screen);
          // if (setts && !screen.imageLocal) {
          //   setDefaultBg(setts.defaultBackground);
          // } else if (screen.imageLocal) {
          //   setImageBackground(screen.imageLocal);
          // }
          if (reference.imageLocal) {
            setImageBackground(reference.imageLocal);
          }
          setReference(reference);
          runFadeIn();
          setIsLoading(false);
        } else {
          console.error("Screen not found");
          setIsLoading(false);
        }
      }
    };
    fetchScreen();
  }, [referenceId]);

  // const fetchSettings = (scrn: Screen): Setting | null => {
  //   const sSetting = getSettingByScreenId(scrn.id);
  //   if (sSetting) {
  //     setSettings(sSetting);
  //     return sSetting;
  //   }
  //   }

  const runFadeIn = () => {
    if (screen) {
      setTimeout(() => {
        const element = document.getElementById("fade-in-reference");
        if (element) {
          const arr = Array.from(element.children);
          arr.forEach((el) => {
            el.classList.add("fade-out");
          });
          setTimeout(() => {
            setTimeout(() => {
              element.classList.add("ready");
            }, 50);
            recursiveAddClass(0, arr);
          }, 1000);
        }
      }, 1);
    }
  };

  const recursiveAddClass = (i: number, el: any[]) => {
    setTimeout(() => {
      if (i < el.length) {
        el[i].classList.add("fade-in");
        i++;
        recursiveAddClass(i, el);
      }
    }, i * 500);
  };

  const handleReplyClick = () => {};

  return (
    <>
      <Loading isLoading={isLoading} />
      {reference && (
        <ScreenContainer background={imageBackground} bgColor={defaultBg}>
          <ScreenContent key={reference.id}>
            <TextWrapper id="fade-in-reference">{parse(DOMPurify.sanitize(reference.text, { USE_PROFILES: { html: true } }))}</TextWrapper>
            <ReplySection id="replies-section">
              <ReplyButton onClick={handleReplyClick}></ReplyButton>
            </ReplySection>
          </ScreenContent>
        </ScreenContainer>
      )}
    </>
  );
};

export default TestReference;

const ScreenContainer = styled.div<{ background: string | undefined; bgColor: string | undefined }>`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 75vh;
  background-image: url(${(props) => props.background});
  background-color: ${(props) => props.bgColor};
  background-size: cover;
  background-position: center;
`;

const ScreenContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 90%;
  width: 450px;
  max-width: 450px;
  background: transparent;
  border-radius: 10px;
  padding: 20px;
`;

const CurrenciesWrapper = styled.div`
  position: absolute;
  top: 50px;
  left: 50px;
  border: 1px solid coral;
  color: darkgreen;
  font-weight: 700;
  border-radius: 10px;
  padding: 25px 15px;
`;

const CName = styled.span`
  color: black;
`;

const CValue = styled.span`
  color: purple;
`;

const ReferenceWrapper = styled.div`
  position: absolute;
  top: 50px;
  right: 150px;
  padding: 25px 15px;
`;

const TextWrapper = styled.div`
  height: 225px;
  max-height: 225px;
  opacity: 0;
  transition: opacity 0.5s ease-in-out;
  .fade-in {
    opacity: 1 !important;
  }
  .fade-out {
    opacity: 0;
    transition: opacity 1s ease-in-out;
  }
  &.ready {
    opacity: 1;
  }
`;

const FormContainer = styled.div`
  max-width: 400px;
  width: 100%;
  margin: 50px auto;
  padding: 30px;
  background-color: #f4f4f4;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormTitle = styled.h2`
  color: #ff6f61; /* Coral color */
  margin-bottom: 20px;
  font-size: 24px;
`;

const CurrencyRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
`;

const CurrencyLabel = styled.span`
  font-size: 16px;
  color: #6a1b9a; /* Purple color */
  flex: 1;
`;

const CurrencyInput = styled.input`
  width: 100px;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 16px;
  flex: 1;
  background-color: #e0f7e4; /* Light green background */
`;

const SubmitButton = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  background-color: #ff6f61; /* Coral color */
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #e65100; /* Darker coral on hover */
  }
`;

const ReplySection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
  opacity: 0;
  transition: opacity 1s ease-in-out;
  &.ready {
    opacity: 1;
  }
`;

const ReplyButton = styled.button`
  padding: 10px 20px;
  font-size: 18px;
  background-color: coral;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: darkorange;
  }
`;
