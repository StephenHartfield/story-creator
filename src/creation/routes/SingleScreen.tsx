import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import RepliesCreator from "../replies/RepliesCreator";
import useProjectStore from "../stores/ProjectStore";
import useScreenStore, { Screen } from "../stores/ScreenStore";
import useReplyStore, { Reply } from "../stores/ReplyStore";

interface ScreenProps {
  screenId: string;
  chapterId: string;
  toggleShowScreen: () => void;
}

const SingleScreen: React.FC<ScreenProps> = ({ screenId, chapterId, toggleShowScreen }) => {
  const [screen, setScreen] = useState<Screen>();
  const [replies, setReplies] = useState<Reply[]>([]);
  const navigate = useNavigate();
  const { activeProject } = useProjectStore();
  const { getScreenById, updateScreens } = useScreenStore();
  const { getRepliesByScreenId, addReply, updateReply, deleteReply } = useReplyStore();

  useEffect(() => {
    getScreenAndReplies();
  }, [chapterId, screenId]);

  const getScreenAndReplies = async () => {
    if (screenId) {
      try {
        const screen = await getScreenById(screenId);
        if (screen) {
          setScreen(screen);
          const repliesList = await getRepliesByScreenId(screen.id);
          if (repliesList.length) {
            setReplies(repliesList);
          } else {
            addReplyHandle();
          }
        } else {
          console.log("No such chapter found!");
        }
      } catch (error) {
        console.error("Error fetching chapter:", error);
      }
    }
  };

  const submitData = async (repls: Reply[], s: Screen) => {
    if (s.id) {
      try {
        await updateScreens([{ ...s }]);
        repls.forEach(async (r) => {
          if (r.id) {
            await updateReply({ ...r }, true);
          } else {
            await addReply(r);
          }
        });
        toggleShowScreen();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const addReplyHandle = async () => {
    const newReply: any = { text: "", screenId: screenId, order: replies.length + 1, requirements: [], effects: [] };
    await addReply(newReply);
    const newReplies = await getRepliesByScreenId(newReply.screenId);
    setReplies(newReplies);
  };

  const removeReply = async (id: string) => {
    const userConfirmed = window.confirm("Are you sure you want to delete this reply?");

    if (userConfirmed && screenId) {
      await deleteReply(id, screenId);
      const repliesCopy = await getRepliesByScreenId(screenId);
      setReplies(repliesCopy);
    }
  };

  return (
    <SScreen>
      <StyledTitle>Replies</StyledTitle>
      {activeProject && screen && (
        <RepliesCreator
          addReply={addReplyHandle}
          removeReply={(id: string) => removeReply(id)}
          setReplies={setReplies}
          activeProjectId={activeProject.id}
          submit={(repls: Reply[], scrn: Screen) => submitData(repls, scrn)}
          screen={screen}
          replies={replies}
        />
      )}
    </SScreen>
  );
};

export default SingleScreen;

const SScreen = styled.div`
  max-height: 450px;
  padding: 30px 10px;
  overflow-y: scroll;
`;

const StyledTitle = styled.h2`
  color: purple;
  border-radius: 8px;
  width: 150px;
  padding: 10px 25px;
  text-align: center;
  margin: 0 auto;
`;
