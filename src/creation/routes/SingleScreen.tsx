import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { ProjectSlim } from "./Projects"
import { db } from "../../firebaseConfig";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import styled from '@emotion/styled';
import { screenDBKey, Screen } from "./SingleChapter";
import RepliesCreator, { Reply } from "../replies/RepliesCreator";

export const repliesDBKey = 'replies';

interface SingleScreenProps {
    activeProject: ProjectSlim | undefined;
}
const SingleChapter: React.FC<SingleScreenProps> = ({ activeProject }) => {
    const { chapterId, screenId } = useParams<{ chapterId: string, screenId: string }>();
    const [screen, setScreen] = useState<Screen>();
    const [replies, setReplies] = useState<Reply[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (chapterId && screenId) {
            getScreenById();
        }
    }, [chapterId, screenId]);

    const getScreenById = async () => {
        if (screenId) {
            try {
                const screenRef = doc(db, screenDBKey, screenId);
                const screenSnap = await getDoc(screenRef);

                if (screenSnap.exists()) {
                    const screenData = { id: screenSnap.id, ...screenSnap.data() };
                    setScreen(screenData as Screen);
                    try {
                        const q = query(collection(db, repliesDBKey), where("screenId", "==", screenData.id));
                        const querySnapshot = await getDocs(q);
                        const repliesList = querySnapshot.docs.map((doc) => ({
                            id: doc.id,
                            ...doc.data(),
                        })) as Reply[];
                        if (repliesList.length) {
                            const sorted = repliesList.sort((a, b) => a.order - b.order);
                            setReplies(sorted);
                        } else {
                            addReply();
                        }
                    } catch (e) {
                        console.error('Error fetching related screens ' + e);
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
                await updateDoc(doc(db, screenDBKey, s.id), {...s});
                repls.forEach( async (r) => {
                    if ( r.id ) {
                        await updateDoc(doc(db, repliesDBKey, r.id), {...r});
                    } else {
                        await addDoc(collection(db, repliesDBKey), r);
                    }
                })
                navigate(`/chapters/${chapterId}`);
            } catch (e) {
                console.error(e);
            }
        }
    }

    const addReply = async() => {
        const newReply = {text: '', screenId: screenId, order: replies.length + 1, requirements: [], effects: []};
        const replyData = await addDoc(collection(db, repliesDBKey), newReply);
        const ret = await getDoc(replyData);
        const r = {...ret.data(), id: ret.id};
        setReplies([...replies, r as Reply ]);
    }

    const removeReply = async(id: string) => {
        const userConfirmed = window.confirm('Are you sure you want to delete this reply?');

        if (userConfirmed) {
            try {
                const replyRef = doc(db, repliesDBKey, id);
                await deleteDoc(replyRef);
                if (replies.length > 1) {
                    const repliesCopy = [...replies];
                    const filtered = repliesCopy.filter(r => r.id !== id);
                    filtered.forEach( async(r, idx) => await updateReplyOrder(r, idx));
                    setReplies(filtered);
                } else {
                    setReplies([]);
                }
                console.log(`Reply ${id} deleted.`);
            } catch (e) {
                console.error(e);
            }
        }
    }

    const updateReplyOrder = async( r: Reply, idx: number ) => {
        r.order = idx + 1;
        await updateDoc(doc(db, repliesDBKey, r.id), {...r});
    }

    return (
        <>
            <StyledLink to={`/chapters/${chapterId}`}>Back to List</StyledLink>
            {screen && <RepliesCreator
                addReply={addReply}
                removeReply={(id: string) => removeReply(id)}
                setReplies={setReplies}
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