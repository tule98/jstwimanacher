"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Mention from "@tiptap/extension-mention";
import { ReactRenderer } from "@tiptap/react";
import { SuggestionOptions } from "@tiptap/suggestion";
import tippy, { Instance as TippyInstance } from "tippy.js";
import "tippy.js/dist/tippy.css";
import "./tiptap-styles.css";
import {
  Box,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import type { Habit } from "@/services/api/habits";

interface MentionListProps {
  items: Habit[];
  command: (item: { id: string; label: string }) => void;
}

interface MentionListHandle {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

const MentionList = forwardRef<MentionListHandle, MentionListProps>(
  (props, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectItem = (index: number) => {
      const item = props.items[index];
      if (item) {
        props.command({ id: item.id, label: item.name });
      }
    };

    const upHandler = () => {
      setSelectedIndex(
        (selectedIndex + props.items.length - 1) % props.items.length
      );
    };

    const downHandler = () => {
      setSelectedIndex((selectedIndex + 1) % props.items.length);
    };

    const enterHandler = () => {
      selectItem(selectedIndex);
    };

    useEffect(() => setSelectedIndex(0), [props.items]);

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        if (event.key === "ArrowUp") {
          upHandler();
          return true;
        }

        if (event.key === "ArrowDown") {
          downHandler();
          return true;
        }

        if (event.key === "Enter") {
          enterHandler();
          return true;
        }

        return false;
      },
    }));

    return (
      <Paper
        elevation={3}
        sx={{
          maxHeight: 300,
          overflow: "auto",
          minWidth: 200,
        }}
      >
        <List dense disablePadding>
          {props.items.length ? (
            props.items.map((item, index) => (
              <ListItem key={item.id} disablePadding>
                <ListItemButton
                  selected={index === selectedIndex}
                  onClick={() => selectItem(index)}
                  sx={{
                    bgcolor:
                      index === selectedIndex
                        ? "action.selected"
                        : "transparent",
                  }}
                >
                  <ListItemText primary={item.name} />
                </ListItemButton>
              </ListItem>
            ))
          ) : (
            <ListItem>
              <ListItemText primary="No habits found" />
            </ListItem>
          )}
        </List>
      </Paper>
    );
  }
);

MentionList.displayName = "MentionList";

interface HabitLogInputWithTagInsertionProps {
  habits: Habit[];
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
}

export default function HabitLogInputWithTagInsertion({
  habits,
  value = "",
  onChange,
  placeholder = "Type @ to mention a habit...",
}: HabitLogInputWithTagInsertionProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Mention.configure({
        HTMLAttributes: {
          class: "mention",
        },
        suggestion: {
          items: ({ query }: { query: string }) => {
            return habits
              .filter((habit) =>
                habit.name.toLowerCase().includes(query.toLowerCase())
              )
              .slice(0, 5);
          },
          render: () => {
            let component: ReactRenderer<MentionListHandle, MentionListProps>;
            let popup: TippyInstance[];

            return {
              onStart: (props) => {
                component = new ReactRenderer(MentionList, {
                  props: {
                    ...props,
                    items: props.items as Habit[],
                  },
                  editor: props.editor,
                });

                if (!props.clientRect) {
                  return;
                }

                popup = tippy("body", {
                  getReferenceClientRect: props.clientRect as () => DOMRect,
                  appendTo: () => document.body,
                  content: component.element,
                  showOnCreate: true,
                  interactive: true,
                  trigger: "manual",
                  placement: "bottom-start",
                });
              },

              onUpdate(props) {
                component.updateProps({
                  ...props,
                  items: props.items as Habit[],
                });

                if (!props.clientRect) {
                  return;
                }

                popup[0].setProps({
                  getReferenceClientRect: props.clientRect as () => DOMRect,
                });
              },

              onKeyDown(props) {
                if (props.event.key === "Escape") {
                  popup[0].hide();

                  return true;
                }

                return component.ref?.onKeyDown(props) ?? false;
              },

              onExit() {
                popup[0].destroy();
                component.destroy();
              },
            };
          },
        } as Partial<SuggestionOptions>,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "tiptap-editor",
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        p: 2,
        minHeight: 120,
        "& .tiptap-editor": {
          outline: "none",
          minHeight: 80,
          "& .mention": {
            backgroundColor: "primary.light",
            color: "primary.contrastText",
            padding: "2px 6px",
            borderRadius: "4px",
            fontWeight: 500,
          },
          "& p.is-editor-empty:first-child::before": {
            content: `"${placeholder}"`,
            color: "text.disabled",
            pointerEvents: "none",
            height: 0,
            float: "left",
          },
        },
      }}
    >
      <EditorContent editor={editor} />
    </Box>
  );
}
