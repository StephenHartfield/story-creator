import React, { useEffect, useState } from "react";
import {
  BtnBold,
  BtnBulletList,
  BtnClearFormatting,
  BtnItalic,
  BtnNumberedList,
  BtnRedo,
  BtnStrikeThrough,
  BtnUnderline,
  BtnUndo,
  createButton,
  createDropdown,
  Editor,
  EditorProvider,
  HtmlButton,
  Separator,
  Toolbar,
} from "react-simple-wysiwyg";
import { FormatAlignCenter, FormatAlignLeft, FormatAlignRight, FormatAlignJustify, ArrowDropDown, ArrowDropUp } from "@mui/icons-material";
import ColorPicker from "@rc-component/color-picker";
import "@rc-component/color-picker/assets/index.css";
import { Button, Popover } from "@mui/material";
import styled from "@emotion/styled";
import { ProjectSlim } from "../stores/ProjectStore";

interface EditorProps {
  handleChange: (val: string) => void;
  activeProject: ProjectSlim;
  value: string;
  colorsToUse: string[];
  addColor: (val: string) => void;
}

const ScreenTextEditor: React.FC<EditorProps> = ({ handleChange, activeProject, value, colorsToUse, addColor }) => {
  const [html, setHtml] = useState("<div>Start</div>");
  const BtnAlignCenter = createButton("Align center", <FormatAlignCenter style={{ height: "16px" }} />, "justifyCenter");
  const BtnAlignLeft = createButton("Align center", <FormatAlignLeft style={{ height: "16px" }} />, "justifyLeft");
  const BtnAlignRight = createButton("Align center", <FormatAlignRight style={{ height: "16px" }} />, "justifyRight");
  const BtnAlignJustify = createButton("Align justify", <FormatAlignJustify style={{ height: "16px" }} />, "justifyFull");
  const BtnStyles = createDropdown("Styles", [
    ["Normal", "formatBlock", "DIV"],
    ["𝗛𝗲𝗮𝗱𝗲𝗿 𝟭", "formatBlock", "H1"],
    ["Header 2", "formatBlock", "H2"],
    ["Header 3", "formatBlock", "H3"],
    ["Header 4", "formatBlock", "H4"],
    ["Header 5", "formatBlock", "H5"],
    ["Header 6", "formatBlock", "H6"],
  ]);
  const [themeColorOpts, setThemeColorOpts] = useState<string[]>([]);
  const [pickedColor, setPickedColor] = useState<string>("white");
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [showToolbar, setShowToolbar] = useState<boolean>(true);

  useEffect(() => {
    if (colorsToUse) {
      setThemeColorOpts(colorsToUse);
      setPickedColor(colorsToUse[0]);
    }
  }, [colorsToUse]);

  useEffect(() => {
    if (value) {
      setHtml(value);
    }
  }, [value]);

  const handleFontFamily = (fontFamily: string) => {
    document.execCommand("fontName", false, fontFamily);
  };
  const handleFontColor = (fontColor: string, e: any) => {
    e.preventDefault();
    document.execCommand("styleWithCSS", false, true);
    document.execCommand("foreColor", false, fontColor);
  };

  const onChange = (e) => {
    setHtml(e.target.value);
    handleChange(e.target.value);
  };

  const updateThemeColorHandle = () => {
    if (pickedColor) {
      addColor(pickedColor);
      handleCloseCP();
    }
  };

  const openCP = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  };

  const handleCloseCP = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "color-picker-popover" : undefined;

  const pickColor = (val: any) => {
    const hex = val.toHexString();
    setPickedColor(hex);
  };

  const showToggle = (e: any) => {
    e.preventDefault();
    setShowToolbar(!showToolbar);
  };

  return (
    <EditorWrapper>
      <EditorProvider>
        <Editor style={{ height: "280px", backgroundColor: "white", width: "100%" }} value={html} onChange={onChange}>
          <StyledButton onClick={showToggle}>{showToolbar ? <ArrowDropUp /> : <ArrowDropDown />}</StyledButton>
          {showToolbar && (
            <>
              <Toolbar style={{ position: "relative" }}>
                <BtnUndo />
                <BtnRedo />
                <Separator />
                <BtnBold />
                <BtnItalic />
                <BtnUnderline />
                <BtnStrikeThrough />
                <Separator />
                <BtnNumberedList />
                <BtnBulletList />
                <Separator />
                <BtnAlignLeft style={{ display: "flex", alignItems: "center" }} />
                <BtnAlignCenter style={{ display: "flex", alignItems: "center" }} />
                <BtnAlignRight style={{ display: "flex", alignItems: "center" }} />
                <BtnAlignJustify style={{ display: "flex", alignItems: "center" }} />
                <Separator />
                <BtnClearFormatting />
                <HtmlButton />
              </Toolbar>
              <Toolbar style={{ paddingLeft: "5px" }}>
                <BtnStyles />
                <Separator />
                <div>
                  <select onChange={(e) => handleFontFamily(e.target.value)}>
                    <option value="">Select Font Family</option>
                    <option value="Arial" style={{ fontFamily: "Arial" }}>
                      Arial
                    </option>
                    <option value="Times New Roman" style={{ fontFamily: "Times New Roman" }}>
                      Times New Roman
                    </option>
                    <option value="Courier New" style={{ fontFamily: "Courier New" }}>
                      Courier New
                    </option>
                    <option value="Verdana" style={{ fontFamily: "Verdana" }}>
                      Verdana
                    </option>
                    <option value="Georgia" style={{ fontFamily: "Georgia" }}>
                      Georgia
                    </option>
                  </select>
                </div>
                <Separator />
                <div style={{ display: "flex" }}>
                  {themeColorOpts.length &&
                    themeColorOpts.map((c) => <ChooseColorButton key={c} bgColor={c} onClick={(e) => handleFontColor(c, e)}></ChooseColorButton>)}
                </div>
                <ColorButton aria-describedby={id} onClick={openCP}>
                  Add Color
                </ColorButton>
                <Popover
                  id={id}
                  open={open}
                  anchorEl={anchorEl}
                  onClose={handleCloseCP}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "center",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "center",
                  }}>
                  <ColorPickerWrapper>
                    <ColorPicker value={pickedColor} onChange={pickColor} />
                  </ColorPickerWrapper>
                  <ColorButton onClick={updateThemeColorHandle} style={{ backgroundColor: pickedColor }}>
                    <span style={{ backgroundColor: "white", padding: "2px 10px" }}>Add To Colors</span>
                  </ColorButton>
                </Popover>
              </Toolbar>
            </>
          )}
        </Editor>
      </EditorProvider>
    </EditorWrapper>
  );
};

export default ScreenTextEditor;

const EditorWrapper = styled.div`
  width: 600px;
  max-width: 600px;
  position: relative;
  .rsw-editor {
    height: 360px;
  }
  .rsw-ce {
    padding: 10px 50px;
    width: 83% !important;
    overflow-y: scroll;
  }
`;

const StyledButton = styled.button`
  position: absolute;
  left: -41px;
  width: 20px !important;
  top: 0;
  z-index: 99;
  background-color: coral;
  display: flex;
  justify-content: center;
`;

const ColorPickerWrapper = styled.div`
  z-index: 10;
  background-color: white;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 8px;
`;

const ColorButton = styled.button`
  padding: 4px 10px;
  border-radius: 10px;
  border: 1px solid black;
`;

const ChooseColorButton = styled.button<{ bgColor: string }>`
  background-color: ${(props) => props.bgColor} !important;
  margin: 2px 5px;
  width: 20px;
  height: 20px;
  padding: 0 !important;
  :hover {
    border: 2px solid black;
  }
`;
