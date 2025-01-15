import React, {
  FormEventHandler,
  KeyboardEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  as,
  Box,
  Header,
  Text,
  Icon,
  Icons,
  IconButton,
  Input,
  Button,
  TextArea as TextAreaComponent,
  color,
  Spinner,
} from 'folds';
import { isKeyHotkey } from 'is-hotkey';
import { MatrixError } from 'matrix-js-sdk';
import * as css from './styles.css';
import { useTextAreaIntentHandler } from '../../../hooks/useTextAreaIntent';
import { Cursor, Intent, TextArea, TextAreaOperations } from '../../../plugins/text-area';
import { GetTarget } from '../../../plugins/text-area/type';
import { syntaxErrorPosition } from '../../../utils/dom';
import { AsyncStatus, useAsyncCallback } from '../../../hooks/useAsyncCallback';
import { useMatrixClient } from '../../../hooks/useMatrixClient';

const EDITOR_INTENT_SPACE_COUNT = 2;

export type AccountDataEditorProps = {
  type?: string;
  content?: object;
  requestClose: () => void;
};

export const AccountDataEditor = as<'div', AccountDataEditorProps>(
  ({ type, content, requestClose, ...props }, ref) => {
    const mx = useMatrixClient();
    const defaultContent = useMemo(
      () => JSON.stringify(content, null, EDITOR_INTENT_SPACE_COUNT),
      [content]
    );
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const [jsonError, setJSONError] = useState<SyntaxError>();

    const getTarget: GetTarget = useCallback(() => {
      const target = textAreaRef.current;
      if (!target) throw new Error('TextArea element not found!');
      return target;
    }, []);

    const { textArea, operations, intent } = useMemo(() => {
      const ta = new TextArea(getTarget);
      const op = new TextAreaOperations(getTarget);
      return {
        textArea: ta,
        operations: op,
        intent: new Intent(EDITOR_INTENT_SPACE_COUNT, ta, op),
      };
    }, [getTarget]);

    const intentHandler = useTextAreaIntentHandler(textArea, operations, intent);

    const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (evt) => {
      intentHandler(evt);
      if (isKeyHotkey('escape', evt)) {
        const cursor = Cursor.fromTextAreaElement(getTarget());
        operations.deselect(cursor);
      }
    };

    const [submitState, submit] = useAsyncCallback<object, MatrixError, [string, object]>(
      useCallback((dataType, data) => mx.setAccountData(dataType, data), [mx])
    );
    const submitting = submitState.status === AsyncStatus.Loading;

    const handleSubmit: FormEventHandler<HTMLFormElement> = (evt) => {
      evt.preventDefault();
      if (submitting) return;

      const target = evt.target as HTMLFormElement | undefined;
      const typeInput = target?.typeInput as HTMLInputElement | undefined;
      const contentTextArea = target?.contentTextArea as HTMLTextAreaElement | undefined;
      if (!typeInput || !contentTextArea) return;

      const typeStr = typeInput.value.trim();
      const contentStr = contentTextArea.value.trim();

      let parsedContent: object;
      try {
        parsedContent = JSON.parse(contentStr);
      } catch (e) {
        setJSONError(e as SyntaxError);
        return;
      }
      setJSONError(undefined);

      if (
        !typeStr ||
        parsedContent === null ||
        defaultContent === JSON.stringify(parsedContent, null, EDITOR_INTENT_SPACE_COUNT)
      ) {
        return;
      }

      submit(typeStr, parsedContent);
    };

    useEffect(() => {
      if (jsonError) {
        const errorPosition = syntaxErrorPosition(jsonError) ?? 0;
        const cursor = new Cursor(errorPosition, errorPosition, 'none');
        operations.select(cursor);
        getTarget()?.focus();
      }
    }, [jsonError, operations, getTarget]);

    useEffect(() => {
      if (submitState.status === AsyncStatus.Success) {
        requestClose();
      }
    }, [submitState, requestClose]);

    return (
      <Box grow="Yes" direction="Column" {...props} ref={ref}>
        <Header className={css.EditorHeader} size="600">
          <Box grow="Yes" gap="200">
            <Box grow="Yes" alignItems="Center" gap="200">
              <Text size="H3" truncate>
                Account Data
              </Text>
            </Box>
            <Box shrink="No">
              <IconButton onClick={requestClose} variant="Surface">
                <Icon src={Icons.Cross} />
              </IconButton>
            </Box>
          </Box>
        </Header>
        <Box
          as="form"
          onSubmit={handleSubmit}
          grow="Yes"
          className={css.EditorContent}
          direction="Column"
          gap="400"
          aria-disabled={submitting}
        >
          <Box shrink="No" direction="Column" gap="100">
            <Text size="L400">Type</Text>
            <Box gap="300">
              <Box grow="Yes" direction="Column">
                <Input
                  name="typeInput"
                  size="400"
                  readOnly={!!type || submitting}
                  defaultValue={type}
                  required
                />
              </Box>
              <Button
                variant="Primary"
                size="400"
                type="submit"
                disabled={submitting}
                before={submitting && <Spinner variant="Primary" fill="Solid" size="300" />}
              >
                <Text size="B400">Save</Text>
              </Button>
            </Box>

            {submitState.status === AsyncStatus.Error && (
              <Text size="T200" style={{ color: color.Critical.Main }}>
                <b>{submitState.error.message}</b>
              </Text>
            )}
          </Box>
          <Box grow="Yes" direction="Column" gap="100">
            <Box shrink="No">
              <Text size="L400">JSON Content</Text>
            </Box>
            <TextAreaComponent
              ref={textAreaRef}
              name="contentTextArea"
              className={css.EditorTextArea}
              onKeyDown={handleKeyDown}
              defaultValue={defaultContent}
              resize="None"
              spellCheck="false"
              required
              readOnly={submitting}
            />
            {jsonError && (
              <Text size="T200" style={{ color: color.Critical.Main }}>
                <b>
                  {jsonError.name}: {jsonError.message}
                </b>
              </Text>
            )}
          </Box>
        </Box>
      </Box>
    );
  }
);
