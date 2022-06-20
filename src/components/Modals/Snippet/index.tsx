import React from "react";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-css";

import {
  getLocalStorageDataFromKey,
  initializeSnippets,
  fileToBase64,
} from "../../../logic/Utils";
import { LOCALSTORAGE_KEYS } from "../../../constants";
import Button from "../../Button";
import { CardProps } from "../../Card/Card";
import { ModalType } from "../../../logic/LaunchModals";
import FileInput from "../../FileInput";

const SnippetModal = (props: { content?: CardProps, type: ModalType }) => {
  const PREVIEW_IMAGE_ID = "marketplace-customCSS-preview";
  const [code, setCode] = React.useState(props.type === "ADD_SNIPPET" ? "" : props.content?.item.code || "");
  const [name, setName] = React.useState(props.type === "ADD_SNIPPET" ? "" : props.content?.item.title || "");
  const [description, setDescription] = React.useState(props.type === "ADD_SNIPPET" ? "" : props.content?.item.description || "");
  const [imageURL, setimageURL] = React.useState(props.type === "ADD_SNIPPET" ? "" : props.content?.item.imageURL || "");

  const processName = () => name.replace(/\n/g, "").replaceAll(" ", "-");
  const processCode = () => code.replace(/\n/g, "\\n");

  const saveSnippet = () => {
    // const processedCode = processCode();
    const processedName = processName();
    const processedDescription = description.trim();

    const localStorageKey = `marketplace:installed:snippet:${processedName}`;
    if (getLocalStorageDataFromKey(localStorageKey) && props.type !== "EDIT_SNIPPET") {
      Spicetify.showNotification("That name is already taken!");
      return;
    }

    console.log(`Installing snippet: ${processedName}`);
    if (props.content && props.content.item.title !== processedName) {
      // Remove from installed list
      console.log(`Deleting outdated snippet: ${props.content.item.title}`);

      localStorage.removeItem(`marketplace:installed:snippet:${props.content.item.title}`);
      const installedSnippetKeys = getLocalStorageDataFromKey(LOCALSTORAGE_KEYS.installedSnippets, []);
      const remainingInstalledSnippetKeys = installedSnippetKeys.filter((key: string) => key !== `marketplace:installed:snippet:${props.content?.item.title}`);
      localStorage.setItem(LOCALSTORAGE_KEYS.installedSnippets, JSON.stringify(remainingInstalledSnippetKeys));
    }

    localStorage.setItem(
      localStorageKey,
      JSON.stringify({
        title: processedName,
        code,
        description: processedDescription,
        imageURL,
        custom: true,
      }),
    );

    // Add to installed list if not there already
    const installedSnippetKeys = getLocalStorageDataFromKey(
      LOCALSTORAGE_KEYS.installedSnippets,
      [],
    );
    if (installedSnippetKeys.indexOf(localStorageKey) === -1) {
      installedSnippetKeys.push(localStorageKey);
      console.log(installedSnippetKeys);
      localStorage.setItem(
        LOCALSTORAGE_KEYS.installedSnippets,
        JSON.stringify(installedSnippetKeys),
      );
    }
    const installedSnippets = installedSnippetKeys.map((key: string) =>
      getLocalStorageDataFromKey(key),
    );
    initializeSnippets(installedSnippets);

    Spicetify.PopupModal.hide();
    if (props.type === "EDIT_SNIPPET") location.reload();
  };

  return (
    <div id="marketplace-add-snippet-container">
      <div className="marketplace-customCSS-input-container">
        <label htmlFor="marketplace-custom-css">Custom CSS</label>
        <div className="marketplace-code-editor-wrapper marketplace-code-editor">
          <Editor
            value={code}
            onValueChange={code => setCode(code)}
            highlight={code => highlight(code, languages.css)}
            textareaId="marketplace-custom-css"
            textareaClassName="snippet-code-editor"
            readOnly={props.type === "VIEW_SNIPPET"}
            placeholder="Input your own custom CSS here! You can find them in the installed tab for management."
            style={{
              // fontFamily: "'Fira code', 'Fira Mono', monospace'",
              // fontSize: 12,
            }}
          />
        </div>
      </div>
      <div className="marketplace-customCSS-input-container">
        <label htmlFor="marketplace-customCSS-name-submit">Snippet Name</label>
        <input id="marketplace-customCSS-name-submit" className="marketplace-code-editor"
          value={name} onChange={(e) => {
            if (props.type !== "VIEW_SNIPPET")
              setName(e.target.value);
          }}
          placeholder="Enter a name for your custom snippet."
        />
      </div>
      <div className="marketplace-customCSS-input-container">
        <label htmlFor="marketplace-customCSS-description-submit">
          Snippet Description
        </label>
        <input id="marketplace-customCSS-description-submit" className="marketplace-code-editor"
          value={description} onChange={(e) => {
            if (props.type !== "VIEW_SNIPPET")
              setDescription(e.target.value);
          }}
          placeholder="Enter a description for your custom snippet."
        />
      </div>
      <div className="marketplace-customCSS-input-container">
        <label htmlFor={PREVIEW_IMAGE_ID}>
          Snippet Preview { props.type !== "VIEW_SNIPPET" && "(optional)" }
        </label>
        <FileInput
          id={PREVIEW_IMAGE_ID}
          disabled={props.type === "VIEW_SNIPPET"}
          value={imageURL}
          onChange={
            async (file?: File) => {
              if (props.type !== "VIEW_SNIPPET") {
                if (file) {
                  try {
                    const b64 = await fileToBase64(file);
                    if (b64) {
                      console.log(b64);
                      setimageURL(b64 as string);
                    }
                  } catch (err) {
                    console.error(err);
                  }
                }
              }
            }
          }
        />
        {imageURL &&
          <label htmlFor={PREVIEW_IMAGE_ID} style={{ textAlign: "center" }}>
            <img className="marketplace-customCSS-image-preview" src={imageURL} alt="Preview" />
          </label>
        }
      </div>
      {props.type !== "VIEW_SNIPPET"
        // Disable the save button if the name or code are empty
        ? <Button onClick={saveSnippet} disabled={!processName() || !processCode()}>
          Save CSS
        </Button>
        : <></>}
    </div>
  );
};
export default SnippetModal;