import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Box, Button, IconButton, Modal } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import styled from "@emotion/styled";
import ChapterSelector from "../chapters/ChapterSelector";
import ReplyRow from "./ReplyRow";
import Loading from "../../Loading";
import useChapterStore from "../stores/ChapterStore";
import { Screen } from "../stores/ScreenStore";
import useCurrencyStore from "../stores/CurrencyStore";
import useReplyStore, { Reply } from "../stores/ReplyStore";
import parse from "html-react-parser";
import DOMPurify from "dompurify";

interface RepliesCProps {
  submit: (repls: Reply[], scrn: Screen) => Promise<void>;
  screen: Screen;
  replies: Reply[];
  activeProjectId: string;
  addReply: () => {};
  removeReply: (id: string) => {};
  setReplies: Dispatch<SetStateAction<Reply[]>>;
}

export interface Option {
  value: string;
  label: string;
}

const RepliesCreator: React.FC<RepliesCProps> = (props: RepliesCProps) => {
  const [replies, setReplies] = useState<Reply[]>([]);
  const [screen, setScreen] = useState<Screen>();
  const [chapterSelectorOpen, setChapterSelectorOpen] = useState<boolean>(false);
  const [indexToAddLinkTo, setIndexToAddLinkTo] = useState<number>();
  const [currencyOpts, setCurrencyOpts] = useState<Option[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { chapters } = useChapterStore();
  const { currencies } = useCurrencyStore();
  const { updateReply } = useReplyStore();

  useEffect(() => {
    getCurrencies();
  }, []);

  useEffect(() => {
    setReplies(props.replies);
    if (props.screen?.id) {
      setScreen(props.screen);
    }
  }, [props.replies, props.screen]);

  const getCurrencies = async () => {
    setCurrencyOpts(currencies.map((c) => ({ value: c.keyWord, label: c.displayName })));
  };

  const toggleChapterSelector = async (index?: number) => {
    if (index !== null && index !== undefined) {
      setIndexToAddLinkTo(index);
    }
    setChapterSelectorOpen(!chapterSelectorOpen);
  };

  const setLinkTo = async (id: string) => {
    if (indexToAddLinkTo !== undefined) {
      const updatedReplies = [...replies];
      updatedReplies[indexToAddLinkTo].linkToSectionId = id;
      await updateReply(updatedReplies[indexToAddLinkTo], false);
      props.setReplies(updatedReplies);
      setChapterSelectorOpen(!chapterSelectorOpen);
      setIsLoading(false);
    }
  };

  const updateReplyHandle = async (rep: Reply, index: number) => {
    const updatedReplies = [...replies];
    updatedReplies[index] = rep;
    await updateReply(rep, false);
    props.setReplies(updatedReplies);
  };

  return (
    <Wrapper>
      <Loading isLoading={isLoading} />
      <RepliesCreatorContainer>
        {/* Section Text */}
        <SectionText>{parse(DOMPurify.sanitize(props.screen?.text, { USE_PROFILES: { html: true } }))}</SectionText>

        {/* Dynamic Replies */}
        {replies.map((reply, index) => (
          <ReplyContainer key={index}>
            <ReplyRow
              currencies={currencyOpts}
              updateReply={(rep: Reply) => updateReplyHandle(rep, index)}
              index={index}
              reply={reply}
              toggleChapterSelector={() => toggleChapterSelector(index)}
            />
            <RemoveButton onClick={() => props.removeReply(reply.id)}>
              <DeleteIcon />
            </RemoveButton>
          </ReplyContainer>
        ))}
        <IconButton onClick={props.addReply}>
          <AddIcon />
        </IconButton>
        {screen && screen.id && (
          <SubmitButton onClick={() => props.submit(replies, screen)} variant="outlined">
            Submit Replies
          </SubmitButton>
        )}
      </RepliesCreatorContainer>
      {chapterSelectorOpen && chapters?.length && (
        <Modal open={chapterSelectorOpen} onClose={toggleChapterSelector} aria-labelledby="modal-title" aria-describedby="modal-description">
          <Box sx={style}>
            <ChapterSelector setSelectionId={(id: string) => setLinkTo(id)} chapters={chapters} isSelectingChapter={false} isSelectingSection={true} />
          </Box>
        </Modal>
      )}
    </Wrapper>
  );
};

export default RepliesCreator;

const style = {
  position: "absolute" as "absolute",
  top: "55%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 800,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: "8px",
  display: "flex",
  justifyContent: "center",
};

const RepliesCreatorContainer = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
`;

const SubmitButton = styled(Button)`
  background-color: lightgreen;
  color: purple;
  margin-top: 20px;
  margin: 0 auto;
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

const SectionText = styled.h2`
  font-size: 18px;
  margin-bottom: 20px;
`;

const ReplyContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

const Wrapper = styled.div`
  display: flex;
`;
