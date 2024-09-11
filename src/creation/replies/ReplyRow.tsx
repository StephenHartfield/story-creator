import React, { useEffect, useState } from "react";
import { Button, TextField, Grid, Box, Typography } from "@mui/material";
import RequirementHandler from '../RequirementHandler';
import { Option } from "./RepliesCreator";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { Screen, screenDBKey } from "../stores/ScreenStore";
import { Reply, Requirement } from "../stores/ReplyStore";

interface ReplyRowProps {
  index: number;
  reply: Reply;
  currencies: Option[];
  toggleChapterSelector: () => void;
  updateReply: (rep: Reply) => void;
}

const ReplyRow: React.FC<ReplyRowProps> = (props: ReplyRowProps) => {
  const [linkedScreen, setLinkedScreen] = useState<Screen>();

  useEffect(() => {
    if (props.reply.linkToSectionId) {
      getSectionLinkedTo(props.reply.linkToSectionId)
    }
  }, [props.reply.linkToSectionId]);

  const getSectionLinkedTo = async(screenId: string) => {
    try {
      const screenRef = doc(db, screenDBKey, screenId);
      const screenSnap = await getDoc(screenRef);
  
      if (screenSnap.exists()) {
          const screenData = { id: screenSnap.id, ...screenSnap.data() } as Screen;
          setLinkedScreen(screenData);
      }
    } catch (e) {
      console.error(e);
    }
  }

  const handleTextChange = (text: string) => {
    const replyCopy = { ...props.reply };
    replyCopy.text = text;
    props.updateReply(replyCopy);
  };

  const updateRequirement = (requirement: Requirement) => {
    const replyCopy = { ...props.reply };
    if (requirement.addedAs === 'requirement') {
      replyCopy.requirements.push(requirement);
    } else {
      replyCopy.effects.push(requirement);
    }
    props.updateReply(replyCopy);
  };

  return (
    <Box
      sx={{
        p: 3,
        mb: 3,
        width: '650px',
        maxWidth: '650px',
        border: "2px solid #0066cc",
        borderRadius: "12px",
        backgroundColor: "#e6f7ff",
        margin: '20px auto'
      }}
    >
      <Grid container spacing={3} alignItems="center">
        <Grid item xs={12}>
          <TextField
            fullWidth
            label={`Reply ${props.index + 1}`}
            value={props.reply.text}
            onChange={(e) => handleTextChange(e.target.value)}
            multiline
            variant="outlined"
            minRows={4}
            sx={{
              backgroundColor: "#ffffff", // white background for text field
              borderColor: "#0066cc",
              borderRadius: '8px',
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#0066cc', // blue border for the input field
                },
                '&:hover fieldset': {
                  borderColor: '#004080', // darker blue border on hover
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#004080', // even darker blue when focused
                },
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={12} container justifyContent="flex-start" alignItems="center">
          {/* Links To button */}
          <Button
            variant="contained"
            onClick={props.toggleChapterSelector}
            sx={{
              backgroundColor: "#3399ff", // light blue button
              color: "#fff",
              '&:hover': {
                backgroundColor: "#0073e6", // darker blue on hover
              },
            }}
          >
            Links To
          </Button>
          {props.reply.linkToSectionId && (
            <Typography variant="body2" sx={{ ml: 2, color: "#004080" }}>
              {linkedScreen?.text}
            </Typography>
          )}
        </Grid>
      </Grid>

      <Box mt={3}>
        <RequirementHandler currencies={props.currencies} addRequirement={updateRequirement} />
      </Box>

      <Box mt={3}>
        {props.reply?.requirements?.length > 0 && (
          <Box mb={1}>
            <Typography variant="subtitle1" sx={{ color: "#004080" }}>Requirements:</Typography>
            {props.reply.requirements.map((req, index) => (
              <Typography key={`requirement${index}`} variant="body2" sx={{ color: "#333" }}>
                Required to have {req.type === 'item' ? (req.value ? 'in your possession' : 'not in your possession') : (typeof req.greaterThan !== 'undefined' && req.greaterThan ? 'greater than ' + req.value : 'less than ' + req.value)} {req.keyWord}
              </Typography>
            ))}
          </Box>
        )}

        {props.reply?.effects?.length > 0 && (
          <Box>
            <Typography variant="subtitle1" sx={{ color: "#004080" }}>Effects:</Typography>
            {props.reply.effects.map((ef, index) => (
              <Typography key={`effect${index}`} variant="body2" sx={{ color: "#333" }}>
                Causes user to {ef.value && typeof ef.value === 'number' ? (ef.value > 0 ? 'Gain' : 'Lose') : (ef.value ? 'Gain' : 'Lose')} {ef.type === 'currency' && ef.value} {ef.keyWord}
              </Typography>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ReplyRow;
