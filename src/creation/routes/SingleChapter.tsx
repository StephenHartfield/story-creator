import FormSections from "../chapters/FormSections";
import { ProjectSlim } from "./Projects"

interface SingleChapterProps {
    activeProject: ProjectSlim | undefined;
}
const SingleChapter: React.FC<SingleChapterProps> = ({activeProject}) => {

    return (
        <FormSections />
    )
}

export default SingleChapter;