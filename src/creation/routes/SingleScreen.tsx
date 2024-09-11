import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import styled from '@emotion/styled';
import RepliesCreator from "../replies/RepliesCreator";
import useProjectStore from "../stores/ProjectStore";
import useScreenStore, { Screen } from "../stores/ScreenStore";
import useReplyStore, { Reply } from "../stores/ReplyStore";


const SingleChapter: React.FC = () => {
    const { chapterId, screenId } = useParams<{ chapterId: string, screenId: string }>();
    const [screen, setScreen] = useState<Screen>();
    const [replies, setReplies] = useState<Reply[]>([]);
    const navigate = useNavigate();
    const {activeProject} = useProjectStore();
    const {getScreenById, updateScreens} = useScreenStore();
    const {getRepliesByScreenId, addReply, updateReply, deleteReply} = useReplyStore();

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
                    console.log('No such chapter found!');
                }
            } catch (error) {
                console.error('Error fetching chapter:', error);
            }
        }
    };

    const submitData = async (repls: Reply[], s: Screen) => {
        if ( s.id ) {
            try {
                await updateScreens([{...s}]);
                repls.forEach( async (r) => {
                    if ( r.id ) {
                        await updateReply({...r}, true);
                    } else {
                        await addReply(r);
                    }
                })
                navigate(`/chapters/${chapterId}`);
            } catch (e) {
                console.error(e);
            }
        }
    }

    const addReplyHandle = async() => {
        const newReply: any = {text: '', screenId: screenId, order: replies.length + 1, requirements: [], effects: []};
        await addReply(newReply);
        const newReplies = await getRepliesByScreenId(newReply.screenId);
        console.log( newReplies );
        setReplies(newReplies);
    }

    const removeReply = async(id: string) => {
        const userConfirmed = window.confirm('Are you sure you want to delete this reply?');

        if (userConfirmed && screenId) {
            await deleteReply(id, screenId);
            const repliesCopy = await getRepliesByScreenId(screenId);
            setReplies(repliesCopy);
        }
    }

    return (
        <>
            <StyledLink to={`/chapters/${chapterId}`}>Back to List</StyledLink>
            {activeProject && screen && <RepliesCreator
                addReply={addReplyHandle}
                removeReply={(id: string) => removeReply(id)}
                setReplies={setReplies}
                activeProjectId={activeProject.id}
                submit={(repls: Reply[], scrn: Screen) => submitData(repls, scrn)}
                screen={screen}
                replies={replies} />}
        </>
    )
}

export default SingleChapter;

const StyledLink = styled(Link)`
    background-color: coral;
    border: 2px solid lightgreen;
    color: white !important;
    border-radius: 8px;
    width: 150px;
    padding: 10px 25px;
    text-align: center;
    margin-bottom: 20px;
    &:hover {
        background-color: lightgreen;
        border-color: coral;
    }
`;